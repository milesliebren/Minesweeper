
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
    await Promise.all([
      entryCreate(0, "testUser1", Date.parse('11/10/2023'), 100, 'easy'),
      entryCreate(1, "testUser2", Date.parse('11/10/2023'), 200, 'medium'),
      entryCreate(2, "testUser3", Date.parse('11/10/2023'), 300, 'hard'),
    ]);
  }

  async function entryCreate(index, username, currentDate, elapsedTime, difficulty)
  {
    const entry = { username: username, currentDate: currentDate, elapsedTime: elapsedTime, difficulty: difficulty};
    const newEntry = new Leaderboard_Entry(entry);
    await newEntry.save();
    leaderboard_entries[index] = newEntry;
  }