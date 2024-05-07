# Import and Export

        Export => module.exports = <function name>
        Import => const <var name> = require ("<path of file>")

            ```javascript
               // File 2
                let greet1 = () =>{
                    console.log("Hello";)
                }
                let greet2 = () =>{
                    console.log("Hello";)
                }
                module.exports = {greet1, greet2};

                // File 1
                const greet = require("./file2")
                use => greet.greet1 or greet.greet2
            ```

# Routing [get, post, put, patch, delete]

    1) app.get("/",(req, res)=>{
        res.send("<Text message>") / res.render("<ejs file>") / res.redirect("<route>")
    })

    2) app.get("/profile",(req, res)=>{
        res.send("<Text message>") / res.render("<ejs file>") / res.redirect("<route>")
    })

    3) app.get("/profile:username",(req, res)=>{
        res.send("req.params.username")
    })

# Ejs setup

    1) install ejs => npm i ejs
    2) configure ejs => app.set("view engine", "ejs")
    3) make a folder give the name views inside this folder only make ejs files
    4) to render any ejs file => res.render("<ejs file name without .ejs extenstion>")
    5) send data to any ejs file for rendering give data => res.render("file name", {data})

# Static Files [images, stylesheets, fronend-javascripts]

    1) make a folder public name
    2) inside public folder make 3 folders images, stylesheets, javascript
    3) configure static folder with express => app.use(express.static("./public"))

# Error handelor

    1) make a middleware function at last of all routes
    2) function is

        ```javascript
        app.use((err, req, res, next)=>{
            if(res.headersSent){
                return next(err)
            }
            res.status(500)
            res.render("error", {error: err});
        })
        ```
    3) use => in any function if error => throw Error("<text messeage>")

# Express generator [Boilerplate]

    1) install express generator globally => npm i express-generator -g
    2) where want to create new app then use => express <app name> --view=ejs

# Mongodb Connection

    1) install mongoose => npm i mongoose
    2) connection => mongoose.connect("<connection url>")
    3) create Schema => new mongoose.Schema({username:String})
    4) export this => module.exports = mongoose.model("<foldername>", Schema name)
    5) create document => userModel.create({obj})

            ```javascript
            mongoose.connect("mongodb://127.0.0.1:27017/<database name>")
            const userModel = new mongoose.Schema({
                        username: String,
                        name: String,
                        age: Number
                    })

            module.exports = mongoose.model("user", userModel);

            // to create document
            userModel.create({
                username : "XYZ",
                name:"ABC",
                age : 20
            })

            ```
    6) find(), findOne({username:"XYZ"}), findOneAndDelete({username:"XYZ"})

# Session And Cookie

1.  # Session (save data on server)
        1) install express-session => npm i express-session
        require in file    const session = require("express-session");
        2) Note => express-session configure must be between view engine and logger
        configuration (app.js) => app.use(session({
            resave: false,
            saveUninitialized: false,
            secret: "<any text>"
        }))
        3) we can create a session in any route => req.session.<any variable name> = value
        4) we can access the value of session in any route => console.log(req.session.<already given variable name>)
        5) remove session => req.session.distroy((err)=>{
            if(err) throw err;
            res.send("session removed");
        });
2.  # Cookie (save data on frontend/browser)
        1) install cookie-parser => npm i cookie-parser and require in file
        2) configuration => app.use(cookieParser())
        3) set cookie => res.cookie("<variable name>", value);
        4) read cookie => req.cookies
        Note => when set then use res and when read use req and use keyword cookies console.log(req.cookies.variable name)
        5) delet cookie => res.clearCookie("variable name")

# Flash Messages

        1) install connect-flash => npm i connect-flash
        const flashVar = require("connect-flash")
        2) make sure express-session is setup and set connect-flash after setup session
        3) app.use(flashVar())
        4) set flash in any route => req.flash("variable name", value)
        5) read flash in any route => req.flash("variable name")

# Passport

        1) install packages => npm i passport passport-local passport-local-mongoose
        2) then require all installed packages
        3) setup (app.js) => make sure configure passport after the view engine and before the logger

            ```javascript
            const session = require("express-session")
            const passport = require("passport")
            const usersRouter = require('./routes/users');

            app.use(session({
                resave: false,
                saveUninitialized: false,
                secret: "xyz"
            }))

            app.use(passport.initialize())
            app.use(passport.session())
            passport.serializeUser(usersRouter.serializeUser())
            passport.deserializeUser(usersRouter.deserializeUser())

        4) setup (user.js)
            const mongoose = require("mongoose")
            const plm = require("passport-local-mongoose")
            mongoose.connect("<connection url>")
            const userSchema = new mongoose.Schema({
                username:String,
                password:String,
                secret:String
            })
            userShema.plugin(plm)
            module.exports = mongoose.model("<folder name>", userSchema)

        5) setup (index.js)
            const local = require("passport-local")
            passport.use(new local(userModel.authenticate()))

            router.post("/register",(req, res)=>{
                const userData = new userModel({
                    username : req.body.username,
                    secret : req.body.secret
                });
                userModel.register(userData, req.body.password).then(() => {
                    passport.authenticate("local")(req, res, () => {
                        res.redirect("/profile");
                    });
                });
            });

            router.post("/login", passport.authenticate("local", {
                successRedirect: "/profile",
                failureRedirect: "/login"
           }), (req, res) => { });

           function isLoggedIn(req, res, next){
            if(req.isAuthenticated()) return next();
            res.redirect("/")
           }

        ```
