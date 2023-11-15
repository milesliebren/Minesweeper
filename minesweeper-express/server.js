const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const mongoDB = "mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/";
mongoose.set("strictQuery", false);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(mongoDB);
    console.log('Connected to MongoDB');
  } catch (error) {
    throw new Error('MongoDB connection error: ' + error.message);
  }
}

// Define the leaderboard entry schema
const leaderboardEntrySchema = new mongoose.Schema({
  username: String,
  currentDate: Date,
  elapsedTime: Number,
  difficulty: String
});

// Create a mongoose model
const Leaderboard_Entry = mongoose.model('Leaderboard_Entry', leaderboardEntrySchema);

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
      await entryCreate(username, new Date(currentDate), elapsedTime, difficulty);
      res.status(200).send('Entry added successfully!');
    } else {
      res.status(400).send('Bad Request: Invalid username');
    }

  } catch (error) {
    console.error('Error adding entry:', error);
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

async function entryCreate( username, currentDate, elapsedTime, difficulty) {
  const entry = { username, currentDate, elapsedTime, difficulty};
  const newEntry = new Leaderboard_Entry(entry);
  await newEntry.save();
}
