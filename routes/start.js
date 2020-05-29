const express = require('express');
const router = express.Router();
const servers = ['euw1', 'na1', 'eun1', 'tr1', 'ru', 'kr'];

router.get('', (req, res) => {
  if (!servers.includes(req.params.query.server)) {
    return res.status(422).json('Server not valid');
  }
  if (!req.params.query.username) {
    return res.status(422).json('An username is needed');
  }
});

module.exports = router;
