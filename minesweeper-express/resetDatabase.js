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

async function resetDatabase() {
  try {
    // Clear all entries from both collections
    await Leaderboard_Entry.deleteMany({});
    await User_Profile.deleteMany({});

    console.log('Database cleared.');

    // Repopulate the database with sample data
    const user1 = await createSampleUser('bob', 'bob');
    const user2 = await createSampleUser('james', 'james');

    await createLeaderboardEntries(user1, 5);
    await createLeaderboardEntries(user2, 5);

    console.log('Database repopulated.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

async function createSampleUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User_Profile({
    username,
    password: hashedPassword,
    dateCreated: new Date(),
    numWins: 0,
    bestTimes: [],
    sessionID: 'someUniqueSessionID',
  });

  return await user.save();
}

async function createLeaderboardEntries(user, count) {
  const difficulties = ['easy', 'medium', 'hard'];

  for (let i = 0; i < count; i++) {
    const entry = new Leaderboard_Entry({
      user: user._id,
      currentDate: new Date(),
      elapsedTime: Math.floor(Math.random() * 300) + 60, // Random elapsed time between 60 and 360 seconds
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    });

    await entry.save();
  }
}

resetDatabase();