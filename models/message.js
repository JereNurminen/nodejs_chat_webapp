var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    username: String,
    message: String,
    date: String
});

var Message = mongoose.model('messages', messageSchema);

exports.message = Message;