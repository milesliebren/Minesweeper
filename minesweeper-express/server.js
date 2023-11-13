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
  await mongoose.connect(mongoDB);
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

app.post('/api/leaderboard', async (req, res) => {
  try {
    const { username, currentDate, elapsedTime, difficulty } = req.body;

    // Check if required parameters are present
    if (!username || !currentDate || !elapsedTime || !difficulty) {
      return res.status(400).send('Bad Request: Missing required parameters');
    }

    // Create a new entry with parameters from the request body
    await entryCreate(username, new Date(currentDate), elapsedTime, difficulty);

    res.status(200).send('Entry added successfully!');
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function entryCreate(username, currentDate, elapsedTime, difficulty) {
  const entry = { username, currentDate, elapsedTime, difficulty};
  const newEntry = new Leaderboard_Entry(entry);
  await newEntry.save();
}
