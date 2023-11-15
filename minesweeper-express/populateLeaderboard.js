
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  const Leaderboard_Entry = require("./models/leaderboard_entry");

  const leaderboard_entries = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createLeaderboardEntries();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }

  async function createLeaderboardEntries() {
    console.log("Adding entries");
    const easyEntries = Array.from({ length: 20 }, (_, index) =>
      entryCreate(index, getRandomUsername(), getRandomDate('11/01/2023'), getRandomTime(), 'easy')
    );
    const mediumEntries = Array.from({ length: 20 }, (_, index) =>
      entryCreate(index + 20, getRandomUsername(), getRandomDate('11/01/2023'), getRandomTime(), 'medium')
    );
    const hardEntries = Array.from({ length: 20 }, (_, index) =>
      entryCreate(index + 40, getRandomUsername(), getRandomDate('11/01/2023'), getRandomTime(), 'hard')
    );
    await Promise.all([...easyEntries, ...mediumEntries, ...hardEntries]);
  }
  
  function getRandomUsername() {
    const adjectives = ['Happy', 'Funny', 'Silly', 'Clever', 'Brave', 'Kind', 'Gentle', 'Swift', 'Witty'];
    const nouns = ['Fox', 'Cat', 'Dog', 'Rabbit', 'Tiger', 'Lion', 'Elephant', 'Dolphin', 'Owl'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${randomNumber}`;
  }
  
  function getRandomDate(startDate) {
    const startMillis = Date.parse(startDate);
    const endMillis = startMillis + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const randomMillis = startMillis + Math.floor(Math.random() * (endMillis - startMillis));
    return new Date(randomMillis);
  }

  async function entryCreate(index, username, currentDate, elapsedTime, difficulty)
  {
    const entry = { username: username, currentDate: currentDate, elapsedTime: elapsedTime, difficulty: difficulty};
    const newEntry = new Leaderboard_Entry(entry);
    await newEntry.save();
    leaderboard_entries[index] = newEntry;
  }

  function getRandomTime() {
    return Math.floor(Math.random() * (500 - 50 + 1)) + 50; // Random time between 50 and 500 seconds
  }