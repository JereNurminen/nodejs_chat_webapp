var app = require('express')();
var server  = require('http').createServer(app);
//var http = require('http').Server(app);
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

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs');

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//app.listen(port);
//console.log('The magic happens on port ' + port);

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
        console.log(msg.username + ': ' + msg.message);
        io.emit('chat message', msg);
        messageModel.message.create({
            nickname: msg.username,
            message : msg.message,
            date    : msg.date
        }, function (err, rs) {
            console.log(err);
        });
    });
});


/*
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


 */