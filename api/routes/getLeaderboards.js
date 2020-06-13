const express = require('express');
const router = express.Router();
const Session = require('../models/session.js');

router.get('/', async (req, res) => {
  try {
    const unluckyLeaderboard = await getUnluckyLeaderboard();
    const luckyLeaderboard = await getLuckyLeaderboard();
    const todayUnluckyLeaderboard = await getTodayUnluckyLeaderboard();
    const todayLuckyLeaderboard = await getTodayUnluckyLeaderboard();
    res.send({
      luckyLeaderboard,
      unluckyLeaderboard,
      todayLuckyLeaderboard,
      todayUnluckyLeaderboard
    });
  } catch (error) {
    console.log(error)
    res.status(500).json("An error occured");
  }
});

const getUnluckyLeaderboard = async () => {
  const luckyLeaderboard = await getLeaderboard(false, {});
  return Promise.resolve(luckyLeaderboard);
}

const getTodayUnluckyLeaderboard = async () => {
  const { start, end } = getToday();
  const find = { createdAt: { $gte: start, $lt: end } }
  const unluckyLeaderboard = await getLeaderboard(false, find);
  return Promise.resolve(unluckyLeaderboard);
}

const getLuckyLeaderboard = async () => {
  const luckyLeaderboard = await getLeaderboard(true, {});
  return Promise.resolve(luckyLeaderboard);
}

const getTodayLuckyLeaderboard = async () => {
  const { start, end } = getToday();
  const find = { createdAt: { $gte: start, $lt: end } }
  const luckyLeaderboard = await getLeaderboard(true, find);
  return Promise.resolve(luckyLeaderboard);
}

const getLeaderboard = async (isLucky, find) => {
  const score = isLucky ? '-score' : 'score';
  const leaderboard = await Session
    .find(find)
    .select('-_id score summonerName server currentRank winNumber looseNumber')
    .sort(score)
    .limit(10);
  return Promise.resolve(leaderboard);
}

const getToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

module.exports = router;
