const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    numWins: { type: Number, required: false },
    bestTimes: [{ difficulty: String, time: Number }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User_Profile" }
});

const User_Profile = mongoose.model("User_Profile", userProfileSchema);

module.exports = User_Profile;