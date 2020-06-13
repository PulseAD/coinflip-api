const express = require('express');
const router = express.Router();
const servers = ['euw1', 'na1', 'eun1', 'tr1', 'ru', 'kr', 'jp1', 'la1', 'la2', 'oc1', 'br1'];
const axios = require('axios');
const Session = require('../models/session.js');
const getOrderedRank = require('../helpers/getOrderedRank.js');

router.post('', async (req, res) => {
  try {
    if (!servers.includes(req.body.server)) {
      return res.status(422).json('Server not valid');
    }
    if (!req.body.username) {
      return res.status(422).json('An username is needed');
    }
    const summoner = await retrieveSummonerByName(req.body.username, req.body.server);
    const rankeds = await retrieveRankeds(summoner.id, req.body.server);
    const soloQ = retrieveSoloQ(rankeds);
    let session = await createSession(summoner, soloQ, req.body.server, req);
    session = await Session.findById(session._id).select('-ipCreation');
    res.json(session);
  } catch (error) {
    console.log(error);
    return res.status(400).json('Username not found on that server');
  }
});

const retrieveSummonerByName = async (username, server) => {
  const url = getSummonerApiUrl(username, server);
  const summoner = await axios.get(url);
  return Promise.resolve(summoner.data);
}

const getSummonerApiUrl = (username, server) => {
  const apiKey = process.env.API_KEY;
  return `https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${apiKey}`;
}

const retrieveRankeds = async (id, server) => {
  const url = getRankedApiUrl(id, server);
  const rankeds = await axios.get(url);
  return Promise.resolve(rankeds.data);
}

const getRankedApiUrl = (id, server) => {
  const apiKey = process.env.API_KEY;
  return `https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${apiKey}`;
}

const retrieveSoloQ = (rankeds) => {
  for (ranked of rankeds) {
    if (ranked.queueType === 'RANKED_SOLO_5x5') {
      return ranked;
    }
  }
  return {
    tier: 'IRON',
    rank: 'IV',
    leaguePoints: '0',
    miniSeries: null,
  };
}

const createSession = async (summoner, soloQ, server, req) => {
  const orderedRank = getOrderedRank(soloQ.tier, soloQ.rank);
  const session = new Session({
    summonerName: summoner.name,
    server: server,
    ipCreation: req.get('x-forwarded-for').split(',')[0],
    initialRank: {
      tier: soloQ.tier,
      rank: soloQ.rank,
      leaguePoints: soloQ.leaguePoints,
      miniSeries: soloQ.miniSeries ? soloQ.miniSeries : null,
    },
    currentRank: {
      tier: soloQ.tier,
      rank: soloQ.rank,
      leaguePoints: soloQ.leaguePoints,
      miniSeries: soloQ.miniSeries ? soloQ.miniSeries : null,
      orderedRank: orderedRank,
      demoteProtection: 2,
    },
    maxRank: {
      tier: soloQ.tier,
      rank: soloQ.rank,
      orderedRank: orderedRank,
    },
    winNumber: 0,
    looseNumber: 0,
    lpHistory: [],
    score: 0,
    lastGame: null
  });
  await session.save();
  return Promise.resolve(session);
}

module.exports = router;
