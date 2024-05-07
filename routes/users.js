var express = require('express');
var router = express.Router();
const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb+srv://vaibhu8605:vaibhu@cluster0.qp1gqva.mongodb.net/PinClone").then(() => {
  console.log("Mongodb is connected");
}).catch((err) => {
  console.log(err);
})

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  profileImage: String, 
  bords: {
    type: Array,
    default: []
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }]
})
userSchema.plugin(plm);


module.exports = mongoose.model("user", userSchema);
