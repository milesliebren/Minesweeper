const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const mongoDB = "mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/";
mongoose.set("strictQuery", false);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(mongoDB);
    console.log('Connected to MongoDB');
  } catch (error) {
    throw new Error('MongoDB connection error: ' + error.message);
  }
}


const leaderboardEntrySchema = new mongoose.Schema({
  username: String,
  currentDate: Date,
  elapsedTime: Number,
  difficulty: String
});

const userProfileSchema = new mongoose.Schema({
  username: String,
  password: String,
  dateCreated: Date,
  numWins: Number,
  bestTimes: [{ difficulty: String, elapsedTime: Number }],
  sessionID: String,
});

// Create a mongoose model
const Leaderboard_Entry = mongoose.model('Leaderboard_Entry', leaderboardEntrySchema);
const User_Profile = mongoose.model('User_Profile', userProfileSchema);

app.route('/api/user-profile')
  .get(async (req, res) => {
    try {
      const username = req.query.username || '';
      const userExists = await User_Profile.exists({ username });

      if (userExists) {
        res.status(200).send('User found');
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      res.status(500).send('Internal Server Error');
    }
  })
  .post(async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if required parameters are present
      if (!username || !password) {
        return res.status(400).send('Bad Request: Missing required parameters');
      }

      const user = await User_Profile.findOne({ username });

      // Check if the user exists
      if (user) {
        return res.status(401).send('Login failed: User already exists');
      }

      // Use bcrypt to hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user profile without sessionID
      await profileCreate(username, hashedPassword, new Date(), 0, []);

      console.log(`User '${username}' registered successfully`);
      res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send('Internal Server Error');
    }
  })
  .put(async (req, res) => {
    try {
      const { username, numWins, bestTimes } = req.body;

      // Update user profile with new win and best time
      const updatedProfile = await User_Profile.findOneAndUpdate(
        { username: username },
        {
          $inc: { numWins: numWins },
          $push: { bestTimes: bestTimes },
        },
        { new: true }
      );

      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.route('/api/leaderboard')
.get(async (req, res) => {
  try {
    const difficulty = req.query.difficulty || '';
    const leaderboard = await Leaderboard_Entry.find({ difficulty }).sort({ elapsedTime: 1 }).limit(5);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).send('Internal Server Error');
  }
})
.post(async (req, res) => {
  try {
    const { username, currentDate, elapsedTime, difficulty } = req.body;

    // Check if required parameters are present
    if (!username || !currentDate || !elapsedTime || !difficulty) {
      return res.status(400).send('Bad Request: Missing required parameters');
    }

    if (isValidUsername(username)) {
      // Create a new leaderboard entry
      await entryCreate(username, new Date(currentDate), elapsedTime, difficulty);

      // Update the user's profile with the new leaderboard entry
      const userProfile = await User_Profile.findOne({ username });
      userProfile.bestTimes.push({
        difficulty,
        elapsedTime,
      });

      // Sort the best times array by time and difficulty
      userProfile.bestTimes.sort((a, b) => {
        if (a.elapsedTime !== b.elapsedTime) {
          return a.elapsedTime - b.elapsedTime;
        }
        return a.difficulty.localeCompare(b.difficulty);
      });

      // Update the user's profile in the database
      await User_Profile.findOneAndUpdate(
        { username: username },
        {
          $set: {
            bestTimes: userProfile.bestTimes,
          },
        }
      );

      res.status(200).send('Entry added successfully!');
    } else {
      res.status(400).send('Bad Request: Invalid username');
    }
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.route('/api/login')
.post(async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if required parameters are present
    if (!username || !password) {
      return res.status(400).send('Bad Request: Missing required parameters');
    }

    const user = await User_Profile.findOne({ username });

    // Check if the user exists
    if (!user) {
      console.error('Bad Request: Missing required parameters', req.body);
      return res.status(401).send('Login failed: User not found');
    }

    console.log('Entered Password:', password);
    console.log('Stored Hashed Password:', user.password);

    // Compare the entered password with the stored hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', passwordMatch);

    if (passwordMatch) {
      // Passwords match, login successful
      res.status(200).json({ message: 'Login successful' });
    } else {
      // Passwords do not match, login failed
      res.status(401).send('Login failed: Invalid username or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function isValidUsername(username) {
  // Check if the username is less than 14 characters
  if (username.length > 14) {
    return false;
  }

  // Check if the username contains only alphanumeric characters and underscores
  const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
  return validUsernameRegex.test(username);
}

async function entryCreate(username, currentDate, elapsedTime, difficulty) {
  try {
    const userProfile = await User_Profile.findOne({ username });
    if (userProfile) {
      const leaderboardEntry = new Leaderboard_Entry({
        user: userProfile._id,
        currentDate: currentDate,
        elapsedTime: elapsedTime,
        difficulty: difficulty,
      });

      await leaderboardEntry.save();
    } else {
      console.error(`User profile not found for username: ${username}`);
    }
  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
  }
}

async function profileCreate(username, password, dateCreated, numWins, bestTimes, sessionID)
{
  const profile = {username, password, dateCreated, numWins, bestTimes, sessionID};
  const newProfile = new User_Profile(profile);
  await newProfile.save();
}
