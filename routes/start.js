const express = require('express');
const router = express.Router();
const servers = ['euw1', 'na1', 'eun1', 'tr1', 'ru', 'kr'];
const axios = require('axios');

router.get('', async (req, res) => {
  try {
    const { username, server } = req.params.query;
    if (!servers.includes(server)) {
      return res.status(422).json('Server not valid');
    }
    if (!username) {
      return res.status(422).json('An username is needed');
    }
    const summoner = await retrieveSummonerByName(username, server);
  } catch (error) {
    console.log(error)
    return res.status(400).json('Username not found on that server');
  }
});

const retrieveSummonerByName = async (username, server) => {
  const url = getApiUrl(username, server);
  
}

const getApiUrl = (username, server) => {
  const apiKey = process.env.API_KEY;
  return `https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${apiKey}?api_key=${apiKey}`;
}

module.exports = router;
