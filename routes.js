var fs = require("fs");

module.exports = function(app, passport) {
    var mongoose = require('mongoose');
    var userModel = require('./models/user.js');
    var bodyParser = require('body-parser');
    var multer = require('multer');
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    var bb = require('express-busboy');

    // Setup of the BusBoy. Allows the upload of files (uses the default location for storing the uploads at first
    bb.extend(app, {
        upload: true,
        allowedPath: /./
    });

    // Renders the correct page when trying to access the /chat, if the user is logged in.
    // Otherwise sends the user to the login page
    app.get('/chat', isLoggedIn, function(req, res) {
        res.render('chat.ejs', {
            user_id: req.user._id,
            user : req.user
        });
    });

    // Renders the correct page when trying to access the /chat, if the user is logged in.
    // Otherwise sends the user to the login page
    app.get('/', isLoggedIn, function(req, res) {
        res.render('chat.ejs', {
            user : req.user
        });
    });

    // Handles the login page
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // Processes the login form, using Passport-local
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/chat', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // Shows the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // Handles the signup using Passport-local
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash    : true // allow flash messages
    }));

    // Handles the logout, again using Passport
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    // Takes the new status from the request and updates it into the DB
    app.post('/updateStatus', function(req, res) {
        var id = req.user.id;
        var status = req.body.status;
        console.log("user id: " + id + "\nnew status: " + status);

        userModel.findByIdAndUpdate(id, {'local.status': status}, { new: true }, function(err) {
            if (err) return handleError(err);
            console.log("Status updated!");
        })
    });

    // Searches and returns a user's info by their username
    app.post('/userInfoById', function(req, res) {
        var searchUser = req.body.searchUser;
        console.log("Retrieving " + searchUser);
        userModel.findOne({'local.username': searchUser}, function (err, obj) {
            obj.local.password = null;
            res.setHeader('Content-Type', 'application/json');
            res.send(obj);
        });
    });

    // Handles the changing of the user profile picture.
    app.post('/changeProfilePic', function(req, res) {
        // Saves the path of the image in the temp-folder to a variable
        var oldPath = req.files.picture.file;
        // Sets the new path up
        var newPath = __dirname + '/public/upload/profiles/' +req.user.id + '_profile.jpg';
        console.log("Old path to file: " + oldPath + "\n" +
                    "New path to file: " + newPath);
        // Moves and renames the image
        fs.rename(oldPath, newPath, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("File moved succesfully!");
                res.render('chat.ejs', {
                    user : req.user
                });
            }
        });
    });
};

// Checks if the user is logged in
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}