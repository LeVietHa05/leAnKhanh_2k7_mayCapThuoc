var express = require('express');
var router = express.Router();

const user = require('../user.json')
/* GET home page. */
router.get('/', function (req, res, next) {
  const { username, password } = req.query;
  let userNumber = getUserNumber(username, password);
  if (userNumber == -1) {
    res.sendFile("/view/login.html", { root: 'public' })
  } else {
    res.sendFile("/view/index.html", { root: 'public' })
  }
});


router.get("/getusernumber", (req, res) => {
  const { username, password } = req.query;
  let userNumber = getUserNumber(username, password);
  res.status(200).json(user[userNumber])
})

function getUserNumber(username, password) {
  for (let i = 0; i < user.length; i++) {
    if (user[i].username === username && user[i].password === password) {
      return i;
    }
  }
  return -1
}

module.exports = router;
