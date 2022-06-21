const express = require('express');
const app = express();
const fetch = require("node-fetch");
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const Users = require('./model/users')
const initializePassport = require('./passport-config')
const MONGO_URI= process.env.MONGO_URI


//initialize passport
initializePassport(passport)

//mongoDB connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
})

//middleware set 
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))

// const weatherRoute = require("./routes/weather");
app.set("view engine", "ejs");
//now use middleware for routes
// app.use('/', weatherRoute);
app.use(flash())
app.use(session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//login functionallity
//GET
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
//POST
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        //Trying Mongo
        const user = await Users.findOne({ username: req.body.username })
        if (user) return res.status(400).send("User Already Exists")
        await Users.create({
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    // console.log(users)
})
app.delete('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});






//to get data 
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index', {
        city: null,
        temp: null,
        icon: null,
        des: null
    });
})
//to post data
app.post('/', checkAuthenticated, async (req, res) => {
    const city = req.body.city;
    const url_api = `${process.env.API_ID}=${city}&appid=${process.env.API_KEY}`;
    try {
        await fetch(url_api)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'city not found') {
                    res.render('index', {
                        city: data.message,
                        des: null,
                        icon: null,
                        temp: null
                    })
                } else {
                    const city = data.name;
                    const des = data.weather[0].description;
                    const icon = data.weather[0].icon;
                    const temp = data.main.temp;
                    res.render('index', {
                        city, des, icon, temp
                    });
                }
            }
            );
    }
    catch (err) {
        res.render('index', {
            city: "somthing wrong",
            des: null,
            icon: null,
            temp: null
        })
    }
}
)


//mandatory boilerplate
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(PORT, () => console.log(`Listning to the port ${PORT}`));
