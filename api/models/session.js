const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
  "summonerName": String,
  "server": String,
  "ipCreation": String,
  "initialRank": {
    "tier": String,
    "rank": String,
    "leaguePoints": Number,
    "miniSeries": {
      "target": Number,
      "wins": Number,
      "losses": Number,
      "progress": String
    }
  },
  "currentRank": {
    "tier": String,
    "rank": String,
    "orderedRank": Number,
    "leaguePoints": Number,
    "miniSeries": {
      "target": Number,
      "wins": Number,
      "losses": Number,
      "progress": String
    },
    "demoteProtection": Number
  },
  "maxRank": {
    "tier": String,
    "rank": String,
    "orderedRank": Number
  },
  "winNumber": Number,
  "looseNumber": Number,
  "messageHistory": [{
    "message": String,
    "lp": Number,
    "date": Date
  }],
  "score": Number,
  "lastGame": Date
});

module.exports = mongoose.model('Session', sessionSchema);
