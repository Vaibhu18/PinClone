var express = require("express");
const multer = require("multer");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./postModel");
const local = require("passport-local");
const passport = require("passport");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
let error = [];

passport.use(new local(userModel.authenticate()));

const uploads = multer({ storage: multer.memoryStorage() }).single("image");

cloudinary.config({
  cloud_name: "dadvvrncz",
  api_key: "688672219212932",
  api_secret: "nNx1hfYWJW5P9T_7ddA33-PQ3n0",
});

/* GET home page. */
router.get("/", async (req, res, next) => {
  const posts = await postModel.find().populate("user").sort({ createdAt: -1 });
  res.render("home", { posts });
});
router.get("/uploadPost", function (req, res, next) {
  res.render("uploadPost");
});

router.post("/uploadPost", isLoggedIn, uploads, async (req, res, next) => {
  let { imageTitle, description } = req.body;
  if (!imageTitle) imageTitle = " ";
  if (!description) description = " ";
  if (!req.file) {
    res.status(400).send("No file selected");
    return;
  }

  await cloudinary.uploader
    .upload_stream({ resource_type: "auto" }, async (error, result) => {
      if (error) {
        res.status(500).send("An error occurred during file upload");
      } else {
        const user = await userModel.findOne({
          username: req.session.passport.user,
        });
        const post = await postModel.create({
          user: user._id,
          title: imageTitle,
          decription: description,
          image: result.secure_url,
        });
        user.posts.push(post._id);
        await user.save();
      }
    })
    .end(req.file.buffer);
  res.redirect("/profile");
});

router.get("/profile", isLoggedIn, async (req, res, next) => {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render("profile", { user });
});

router.get("/All/posts", isLoggedIn, async (req, res, next) => {
  const posts = await postModel.find().populate("user");
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("posts", { posts, user });
});

router.post("/fileupload", isLoggedIn, uploads, async (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No file selected");
    return;
  }
  await cloudinary.uploader
    .upload_stream({ resource_type: "auto" }, async (error, result) => {
      if (error) {
        res.status(500).send("An error occurred during file upload");
      } else {
        const user = await userModel.findOne({
          username: req.session.passport.user,
        });
        user.profileImage = result.secure_url;
        await user.save();
      }
    })
    .end(req.file.buffer);
  res.redirect("/profile");
});

router.get("/register", (req, res, next) => {
  res.render("register", { error });
});

router.get("/edit/:id", async (req, res, next) => {
  let postId = req.params.id;
  const post = await postModel.findOne({ _id: postId });
  const userId = post.user.toString();
  const user = await userModel.findOne({ _id: userId });
  let indexToDelete = -1;
  for (let i = 0; i < user.posts.length; i++) {
    if (user.posts[i] == postId) {
      indexToDelete = i;
      break;
    }
  }
  if (indexToDelete !== -1) {
    user.posts.splice(indexToDelete, 1);
  }
  await user.save();
  await postModel.findOneAndDelete({ _id: postId });
  const secureUrl = post.image;
  deleteImageBySecureUrl(secureUrl);

  function deleteImageBySecureUrl(secureUrl) {
    const publicId = extractPublicIdFromSecureUrl(secureUrl);
    if (!publicId) {
      console.error("Unable to extract public ID from secure URL");
      return;
    }
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error deleting image:", error);
      } else {
        console.log("Image deleted successfully:", result);
      }
    });
  }
  res.redirect("/profile");
});

function extractPublicIdFromSecureUrl(secureUrl) {
  const regex = /\/v\d+\/([^\.]+)/;
  const match = secureUrl.match(regex);
  return match ? match[1] : null;
}

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});

router.post("/register", checkUser, (req, res) => {
  const userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });
  console.log(userData);
  userModel.register(userData, req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {}
);

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) throw next(err);
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

async function checkUser(req, res, next) {
  const { name, username, email } = req.body;
  const user1 = await userModel.findOne({ username });
  const user2 = await userModel.findOne({ email });

  if (user1 || user2) {
    if (user1) {
      error.push("username already exist");
    } else {
      error.push("email already exist");
    }
    res.render("register", { error });
    error = [];
  } else {
    next();
  }
}

module.exports = router;
