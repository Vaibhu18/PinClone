var express = require('express');
var router = express.Router();
const userModel = require("./users")
const postModel = require("./postModel")
const local = require("passport-local")
const passport = require("passport")
const upload = require("./multer")
const uploadPosts = require("./multer_post")
let error = [];

passport.use(new local(userModel.authenticate()))

/* GET home page. */
router.get('/', async (req, res, next) => {
  const posts = await postModel.find().populate("user");
  res.render('home', { posts });
});
router.get('/uploadPost', function (req, res, next) {
  res.render('uploadPost');
});

router.post('/uploadPost', isLoggedIn, uploadPosts.single("postImage"), async (req, res, next) => {
  let { imageTitle, description } = req.body;
  if (!imageTitle) imageTitle = " ";
  if (!description) description = " ";
  if (req.file == undefined) {
    res.redirect('/profile');
  } else {
    const user = await userModel.findOne({ username: req.session.passport.user })
    const post = await postModel.create({
      user: user._id,
      title: imageTitle,
      decription: description,
      image: req.file.filename
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile');
  }
});

router.get('/profile', isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")
  res.render("profile", { user });
});

router.get('/All/posts', isLoggedIn, async (req, res, next) => {
  const posts = await postModel.find().populate("user");
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render("posts", { posts, user });
});



router.post('/fileupload', isLoggedIn, upload.single("image"), async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.profileImage = req.file.filename
  await user.save();
  res.redirect("/profile")
});

router.get('/register', (req, res, next) => {
  res.render('register', { error });
});

router.get('/edit/:id', async (req, res, next) => {
  let postId = req.params.id;
  const post = await postModel.findOne({ _id: postId })
  const userId = (post.user).toString()
  const user = await userModel.findOne({ _id: userId })
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
  await user.save()
  await postModel.findOneAndDelete({ _id: postId })
  res.redirect("/profile")

});


router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});


router.post("/register", checkUser, (req, res) => {
  const userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });
  console.log(userData)
  userModel.register(userData, req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile")
    });
  });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}), (req, res) => { });

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) throw next(err);
    res.redirect("/")
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

async function checkUser(req, res, next) {
  const { name, username, email } = req.body;
  const user1 = await userModel.findOne({ username })
  const user2 = await userModel.findOne({ email })

  if (user1 || user2) {
    if (user1) {
      error.push("username already exist");
    } else {
      error.push("email already exist");
    }
    res.render("register", { error })
    error = [];
  } else {
    next()
  }

}

module.exports = router;
