var app = require('express')();
var express = require('express');
var server  = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var configDB = require('./config/database.js');
var messageModel = require('./models/message.js');

mongoose.connect(configDB.url);

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

// required for passport
app.use(session({ secret: 'e1e3edd78468d2284f66' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static('public'));

require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

server.listen(port, function () {
    console.log("Server running at " + __dirname);
    console.log('Server listening at port %d', port);
});

io.on('connection', function(socket){

    // Gets the last 25 messages and emits them
    messageModel.message.find().limit(25).sort({_id: -1}).exec(function (err, results) {
        results.reverse();
        results.forEach(function (message) {
            if (message.username != null) {
                socket.emit('chat message', message);
            }
        });
    });

    console.log("user connected!");

    socket.on('disconnect', function(){
        console.log('user disconnected');

    });

    socket.on('user join', function(user) {
        console.log(user + ' joined');
        io.emit('user join', user);
    });

    // On a new message, saves it to the DB and emits it 'back'
    socket.on('chat message', function(msg){
        console.log(msg.username + ': ' + msg.message);
        io.emit('chat message', msg);
        messageModel.message.create({
            username: msg.username,
            message : msg.message,
            date    : msg.date
        }, function (err, rs) {
            console.log(err);
        });
    });
});