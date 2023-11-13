const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Set up mongoose connection
mongoose.connect("mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("strictQuery", false);

// Define the leaderboard entry schema
const leaderboardEntrySchema = new mongoose.Schema({
  username: String,
  currentDate: Date,
  elapsedTime: Number
});

// Create a mongoose model
const Leaderboard_Entry = mongoose.model('Leaderboard_Entry', leaderboardEntrySchema);

app.post('/api/leaderboard', async (req, res) => {
  try {
    // Add a single sample entry
    await entryCreate("sampleUser", new Date(), 150);
    res.status(200).send('Sample entry added successfully!');
  } catch (error) {
    console.error('Error adding sample entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function entryCreate(username, currentDate, elapsedTime) {
  const entry = { username, currentDate, elapsedTime };
  const newEntry = new Leaderboard_Entry(entry);
  await newEntry.save();
}
