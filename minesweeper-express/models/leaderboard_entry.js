const mongoose = require("mongoose");

const leaderboardEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User_Profile', required: true }, 
  currentDate: Date,
  elapsedTime: {type: Number, required: true},
  difficulty: String,
});

const Leaderboard_Entry = mongoose.model('Leaderboard_Entry', leaderboardEntrySchema);

module.exports = Leaderboard_Entry;
