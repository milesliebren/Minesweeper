const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoDB = "mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/";

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const leaderboardEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User_Profile', required: true },
  currentDate: Date,
  elapsedTime: { type: Number, required: true },
  difficulty: String,
});

const Leaderboard_Entry = mongoose.model('Leaderboard_Entry', leaderboardEntrySchema);

const userProfileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  dateCreated: { type: Date, required: true },
  numWins: { type: Number, required: false },
  bestTimes: [{ difficulty: String, elapsedTime: Number }],
  sessionID: String,
});

const User_Profile = mongoose.model('User_Profile', userProfileSchema);

const DIFFICULTIES = ['easy', 'medium', 'hard'];

async function main() {
  try {
    await mongoose.connect("mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/");
    console.log('Connected to MongoDB');

    // Clear existing data
    await clearDatabase();

    // Create 10 users with entries
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const username = `user${i}`;
      const password = await bcrypt.hash(`password${i}`, 10);

      const user = await profileCreate(username, password, new Date(), 0, []);
      users.push(user);

      // Create 10 entries for each user with random difficulty
      for (let j = 1; j <= 10; j++) {
        const currentDate = new Date();
        const elapsedTime = Math.floor(Math.random() * 1000) + 1; // Random time for demonstration
        const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

        await entryCreate(user._id, currentDate, elapsedTime, difficulty);

        // Check if the new entry qualifies for the best times
        const bestTimes = user.bestTimes || [];
        bestTimes.push({ difficulty, elapsedTime });
        bestTimes.sort((a, b) => a.elapsedTime - b.elapsedTime);
        user.bestTimes = bestTimes.slice(0, 3);
        await user.save();
      }
    }

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

async function clearDatabase() {
  try {
    // Clear leaderboard entries
    await Leaderboard_Entry.deleteMany({});

    // Clear user profiles
    await User_Profile.deleteMany({});
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

async function entryCreate(userId, currentDate, elapsedTime, difficulty) {
  try {
    const leaderboardEntry = new Leaderboard_Entry({
      user: userId,
      currentDate: currentDate,
      elapsedTime: elapsedTime,
      difficulty: difficulty,
    });

    await leaderboardEntry.save();
  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
  }
}

async function profileCreate(username, password, dateCreated, numWins, bestTimes, sessionID) {
  try {
    const profile = { username, password, dateCreated, numWins, bestTimes, sessionID };
    const newUser = new User_Profile(profile);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

main();