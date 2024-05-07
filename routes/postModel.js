var express = require('express');
const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
  },
  title: {
    type:String,
    default:""
  },
  decription:{
    type:String,
    default:""
  },
  image: String,
  createdAt:{
    type:Date,
    default:Date.now()
  }
})

module.exports = mongoose.model("post", postSchema);
