const express = require('express');
const router = express.Router();
const Session = require('../models/session.js');

router.get('/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    let session = await Session.findById(sessionId).select('-ipCreation');
    session = shortenHistory(session);
    res.send(session);
  } catch (error) {
    console.log(error)
    res.status(404).json("Session not found");
  }
});

const shortenHistory = (session) => {
  if (session.messageHistory.length <= 5) {
    return session;
  }
  session.messageHistory = session.messageHistory.slice(0, 5);
  return session;
}

module.exports = router;
