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

const randomNames = [
  'Shadow',
  'Phoenix',
  'Blaze',
  'Viper',
  'Specter',
  'Raven',
  'Fury',
  'Wolf',
  'Thunder',
  'Abyss',
  'Ghost',
  'Bolt',
  'Sparrow',
  'Venom',
  'Rogue',
  'Xenon',
  'Neon',
  'Havoc',
  'Quasar',
  'Orion',
];

async function main() {
  try {
    await mongoose.connect("mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/");
    console.log('Connected to MongoDB');

    // Clear existing data
    await clearDatabase();

    // Create 100 users with entries
    for (let i = 1; i <= 100; i++) {
      const username = generateRandomUsername();
      const password = await bcrypt.hash(`password${i}`, 10);

      const user = await profileCreate(username, password, new Date(), 0, []);
      
      // Create 10-20 entries for each user with random difficulty
      const numEntries = Math.floor(Math.random() * 11) + 10;
      for (let j = 1; j <= numEntries; j++) {
        const currentDate = generateRandomDate();
        const elapsedTime = Math.floor(Math.random() * 975) + 25; // Minimum time of 25 seconds
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

function generateRandomUsername() {
  const baseName = randomNames[Math.floor(Math.random() * randomNames.length)];
  const numberSuffix = Math.floor(Math.random() * 1000);
  return `${baseName}${numberSuffix}`;
}

function generateRandomDate() {
  const today = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 101);
  const randomDate = new Date(today);
  randomDate.setDate(today.getDate() - randomDaysAgo);
  return randomDate;
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