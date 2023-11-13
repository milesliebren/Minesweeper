const mongoose = require("mongoose");

const leaderboardEntrySchema = new mongoose.Schema({
  username: { type: String, required: true },
  currentDate: { type: Date, required: true },
  elapsedTime: { type: Number, required: true },
  difficulty: { type: String, required: true}
});

const Leaderboard_Entry = mongoose.model("Leaderboard_Entry", leaderboardEntrySchema);

module.exports = Leaderboard_Entry;
