const express = require('express');
const router = express.Router();
const Session = require('../models/session.js');
const Game = require('../helpers/game.js');

router.post('', async (req, res) => {
  try {
    const isBlueSideWinning = req.body.isBlueSideWinning ? true : false;
    const sessionId = req.body.sessionId;
    const session = await Session.findById(sessionId).select('-ipCreation');
    const game = new Game(session);
    game.start();
    const updatedSession = game.session;
    await updatedSession.save();
    game.session = shortenHistory(game.session);
    res.send({
      session: game.session,
      hasWon: game.hasWon,
      winner: getWinnerSide(isBlueSideWinning, game.hasWon),
      lp: game.lp
    });
  } catch (error) {
    res.status(500).json("Service unavailable");
  }
});

const shortenHistory = (session) => {
  if (session.messageHistory.length <= 5) {
    return session;
  }
  session.messageHistory = session.messageHistory.slice(0, 5);
  return session;
}

const getWinnerSide = (isBlueSideWinning, hasWon) => {
  if (isBlueSideWinning && hasWon) {
    return "blueSide";
  }
  if (!isBlueSideWinning && hasWon) {
    return "redSide";
  }
  if (isBlueSideWinning && !hasWon) {
    return "redSide";
  }
  if (!isBlueSideWinning && !hasWon) {
    return "blueSide";
  }
}

module.exports = router;
