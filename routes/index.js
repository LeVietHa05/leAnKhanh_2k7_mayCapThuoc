var express = require('express');
const fs = require('fs');
var router = express.Router();

const users = JSON.parse(fs.readFileSync('user.json', 'utf8'));
/* GET home page. */
router.get('/', function (req, res, next) {
  const { username, password } = req.query;
  let [user, userNumber] = getUserNumber(username, password);
  if (userNumber == -1)
    res.sendFile("/view/login.html", { root: 'public' })
  if (user.role !== "admin") {
    res.sendFile("/view/login.html", { root: 'public' })
  } else {
    res.sendFile("/view/admin.html", { root: 'public' })
  }
});


//route to change the time of the user
router.post("/changeTime", async (req, res) => {
  console.log(req.body);
  let { uid, index, time } = req.body;
  const { username, password } = req.query;
  let [user, userNumber] = getUserNumber(username, password);

  users[userNumber].time[index] = time;
  fs.writeFileSync('user.json', JSON.stringify(users));
  res.status(200).json({ message: "success" });
})

router.get("/getusernumber", (req, res) => {
  const { username, password } = req.query;
  let [user, userNumber] = getUserNumber(username, password);
  res.status(200).json(user)
})

router.get("/getPatientList", (req, res) => {
  let userList = [];
  users.forEach(user => {
    if (user.role === "user") {
      userList.push(user);
    }
  })
  res.status(200).json(userList);
})

function getUserNumber(username, password) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      return [users[i], i];
    }
  }
  return [null, -1]
}

module.exports = router;
