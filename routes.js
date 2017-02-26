// app/routes.js
module.exports = function(app, passport) {
    var mongoose = require('mongoose');
    var userModel = require('./models/user.js');
    var bodyParser = require('body-parser');
    var multer = require('multer');
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/chat', isLoggedIn, function(req, res) {
        res.render('chat.ejs', {
            user_id: req.user._id,
            user : req.user
        });
    });

    app.get('/', isLoggedIn, function(req, res) {
        res.render('chat.ejs', {
            user : req.user
        }); // load the index.ejs file
    });


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/chat', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash    : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    app.post('/updateStatus', function(req, res) {
        var id = req.user.id;
        var status = req.body.status;
        console.log("user id: " + id + "\nnew status: " + status);

        userModel.findByIdAndUpdate(id, {'local.status': status}, { new: true }, function(err) {
            if (err) return handleError(err);
            console.log("Status updated!");
        })
    });

    app.post('/userInfoById', function(req, res) {
        var searchUser = req.body.searchUser;
        console.log("Retrieving " + searchUser);
        userModel.findOne({'local.username': searchUser}, function (err, obj) {
            obj.local.password = null;
            res.setHeader('Content-Type', 'application/json');
            res.send(obj);
        });
    });

    app.post('/changeProfilePic', function(req, res) {

    })
};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}