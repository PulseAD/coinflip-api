const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const newSessionRoute = require('./api/routes/newSession.js');
const retrieveSessionRoute = require('./api/routes/retrieveSession.js');
const newGameRoute = require('./api/routes/newGame.js');
const getLeaderboardsRoute = require('./api/routes/getLeaderboards.js');

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.use("/new-session", newSessionRoute);
app.use("/new-game", newGameRoute);
app.use("/retrieve-session", retrieveSessionRoute);
app.use("/leaderboards", getLeaderboardsRoute);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
