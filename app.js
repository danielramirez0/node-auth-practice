//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5")
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/userDB");

const secret = process.env.SECRET;
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (err, foundUser) {
      if (!err && foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, valid) {
          if (valid) {
            res.render("secrets");
          }
        });
      }
    });
  });

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      if (!err) {
        const newUser = new User({
          email: req.body.username,
          password: hash,
        });

        newUser.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.render("secrets");
          }
        });
      }
    });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
