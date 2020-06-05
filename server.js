const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const newSessionRoute = require('./api/routes/newSession.js');
const retrieveSessionRoute = require('./api/routes/retrieveSession.js');
const newGameRoute = require('./api/routes/newGame.js');

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

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

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
