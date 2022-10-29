const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const keys = require("../../config/key");
const User = require("../../models/User");
const Rule = require("../../models/Rule");
var jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
var nodemailer = require("nodemailer");
const fs = require("fs");
const { stringify } = require("csv-stringify");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomPwd(length, chars) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// @route   get api/users/test
// @desc    test User
// @access  Public
router.get("/test", (req, res) => {
  return res.json({ msg: "this is test" });
});

// @route   POST api/users/signup
// @desc    Register User
// @access  Public
router.post("/signup", async (req, res) => {
  console.log(req);
  User.findOne({ useremail: req.body.useremail }).then((user) => {
    if (user) {
      res.json({ usertype: user.usertype });
    } else {
      const newUser = new User({
        useremail: req.body.useremail,
        username: req.body.username,
        usertype: 0,
        authProvider: req.body.authProvider,
        id: req.body.id,
      });
      newUser.save();
      res.json({ usertype: 0 });
    }
  });
});

// @route   get api/users/getuserlist
// @desc    Get Userlist
// @access  Public
router.get("/getuserlist", async (req, res) => {
  User.find({}, function (err, users) {
    res.send(users);
    console.log(users);
  });
});

// @route   post api/users/writeemail
// @desc    Write email
// @access  Public
router.post("/writeemail", async (req, res) => {
  const fs = require("fs");

  let content = req.body.data;
  //src="cid:image001.png@01D8EA6A.A0FD7DF0" --> src="..\\files\\image001.png"

  while (1) {
    let index = content.indexOf('src="cid:');
    if (index == -1) break;
    let source = 'src="cid:';
    let filename = "";
    for (let i = index + 9; content[i] != '"'; i++) source += content[i];
    for (let i = index + 9; content[i] != "@"; i++) filename += content[i];
    let destination =
      'src="http://localhost:5000/api/users/getfile?filename=' + filename;
    console.log("source --->", source, ",destination--->", destination);
    content = content.replace(source, destination);
  }
  const id = req.body.id;
  fs.writeFile("routes/api/emails/" + id + ".html", content, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
  res.json("Email writed perfectly.");
});

// @route   get api/users/getemail
// @desc    Get email
// @access  Public
router.get("/getemail", async (req, res) => {
  res.sendFile(__dirname + "/emails/" + req.query.id + ".html");
});

// @route   post api/users/writefile
// @desc    Write File
// @access  Public
router.post("/writefile", async (req, res) => {
  const fs = require("fs");

  const content = req.body.content;
  const filename = req.body.filename;

  fs.writeFile("routes/api/files/" + filename, content, "base64", (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
  res.json("File writed perfectly.");
});

// @route   get api/users/getfile
// @desc    Get file
// @access  Public
router.get("/getfile", async (req, res) => {
  const filename = req.query.filename;
  res.sendFile(__dirname + "/files/" + filename);
});

// @route   post api/users/newrule
// @desc    Make new rule
// @access  Public
router.post("/newrule", async (req, res) => {
  console.log(req.body);
  const newRule = new Rule({
    filter: req.body.filter,
    folder: req.body.folder,
  });
  newRule.save();
  res.json("OK");
});

// @route   get api/users/getrules
// @desc    Get Rules
// @access  Public
router.get("/getrules", async (req, res) => {
  Rule.find({}, function (err, rules) {
    res.send(rules);
    // console.log(users);
  });
});

// @route   post api/users/writeemailaddress
// @desc    Write EmailAddress.csv
// @access  Public
router.post("/writeemailaddress", async (req, res) => {
  const emailaddresslist = req.body.emailaddresslist;
  const filename = req.body.useremail + ".csv";
  const writeStream = fs.createWriteStream(filename);
  writeStream.write(emailaddresslist.join("\n"));
  res.json("Finished writing data");
});

module.exports = router;
