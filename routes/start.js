const express = require('express');
const router = express.Router();
const servers = ['euw1', 'na1', 'eun1', 'tr1', 'ru', 'kr'];
const axios = require('axios');

router.get('', async (req, res) => {
  try {
    if (!servers.includes(req.query.server)) {
      return res.status(422).json('Server not valid');
    }
    if (!req.query.username) {
      return res.status(422).json('An username is needed');
    }
    const summoner = await retrieveSummonerByName(req.query.username, req.query.server);
    const rankeds = await retrieveRankeds(summoner.id, req.query.server);
    const soloQ = retrieveSoloQ(rankeds);
    res.json({
      summonerName: summoner.name,
      tier: soloQ.tier,
      rank: soloQ.rank,
      leaguePoints: soloQ.leaguePoints,
      miniSeries: soloQ.miniSeries ? soloQ.miniSeries : null,
    });
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
    console.log(ranked)
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

module.exports = router;
