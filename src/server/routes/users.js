var express = require('express');
var router = express.Router();
const fire = require('../fire');

/* GET users listing. */
router.get('/',  async (req, res) => {
  const usernames = await fire.get_all_usernames();

  res.send(usernames);
});

router.get('/:query', async (req, res) => {
  const query = req.params.query;

  const usernames = await fire.get_username(query);

  res.send(usernames);
});

module.exports = router;
