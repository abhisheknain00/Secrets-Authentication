
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

////////1 at this place only
app.use(session({
    secret: "Our Little secret.",
    resave: false,
    saveUninitialized: false

}));

////////2 this place
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchems = new mongoose.Schema({
    email: String,
    password: String
});

////////3 this
userSchems.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchems);

////////4
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.render("login");
    }
});

app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
    
});

app.post("/register", (req, res)=>{

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err){
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});


app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}), function(req, res){
    res.redirect("/secrets");
});












app.listen(3000, ()=>{
    console.log("Server started on port 3000.");
});