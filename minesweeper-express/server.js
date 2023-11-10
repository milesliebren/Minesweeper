const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://test:test@leaderboard.o7mtq0w.mongodb.net/";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});