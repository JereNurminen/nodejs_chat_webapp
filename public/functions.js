
var socket = io().connect();
var username = $('#username').text();
socket.emit('user join', username);
var timerDone = false;

$( document ).ready(function() {

    // Clears all push messages from the app
    Push.clear();

    // Sets a timer of 5 seconds, so that the user doesn't get a flurry of push-notifications when tehy log in
    var timer = setTimeout(function(){
        timerDone = true;
    }, 5000);

    // Shows the status modifying-input
    $('#modifyStatus').click(function() {
        event.preventDefault();
        $('#oldStatus').toggle();
        $('#newStatus').toggle();
    });

    // Cancels the status modifying (ie. hides it)
    $('#cancelStatus').click( function() {
        event.preventDefault();
        $('#newStatus').toggle();
        $('#oldStatus').toggle();
    });

    // Hides the status change input and sends a post-request to a route which handles updating the status in the DB
    $('#saveStatus').click( function() {
        event.preventDefault();
        $('#newStatus').toggle();
        $('#oldStatus').toggle();
        var newStatus = $('#statusBox').val();
        $.post('/updateStatus',
            {
                status: newStatus
            });
        $('#oldStatus').text(newStatus);
    });

    // Toggles the visibility of the profile picture-input
    $('#changeProfilePictureButton').click(function(){
        event.preventDefault();
        $('#changeProfilePictureForm').show();
    });

    // Handles the new message-process by compiling an object of the message and its sender, and emits it.
    $('#newMessageField').submit(function () {
        event.preventDefault();
        var msg = {
            username: username,
            message: $('#newMessage').val(),
            date: Date.now()
        };
        socket.emit('chat message', msg);
        $('#newMessage').val('');
        scrollToBottom();
        return false;
    });

    // Binds the 'getUserInfo'-function to the event of clicking a user's name
    $('#messages').delegate('p.sender', 'click', function() {
        var userToSearch = $(this).text();
        getUserInfo(userToSearch);
    });

    // Shows the user's own profile again after clicking the back-button
    $('.backToProfile').click(function() {
        toggleProfile();
    });
});

// Handles showing push-messages when a message is received
function msgPush(msg) {
    var title = msg.username + " sent a message!";
    Push.create(title, {
        body: msg.message,
        timeout: 4000,
        onClick: function () {
            window.focus();
            this.close();
        }
    });
}

// Handles showing push-messages when a user logs in
function loginPush(user) {
    var message = user + " joined!";
    Push.create(message, {
        body: message,
        timeout: 4000,
        onClick: function () {
            window.focus();
            this.close();
        }
    });
}

// Requests the users info from the database and renders it
function getUserInfo(searchUser) {
    var userFromDb = $.ajax({
        method: "POST",
        url: "/userInfoById",
        data: { searchUser: searchUser},
        async: true
    }).done(function( data ) {
        console.log(data);
        $('#profileViewName').text(data.local.username);
        $('#profileViewStatus').text(data.local.status);
        toggleProfile()
        return data;
    });
}

// Toggles between showing the user's own profile and the profile they are visiting
function toggleProfile() {
    $('#visitProfile').toggle();
    $('[data-profile="own"]').toggle();
}

// Scrolls to the bottom of the messages
function scrollToBottom() {
    $('#messages').stop().animate({
        scrollTop: $('#messages')[0].scrollHeight
    }, 800);
}

// On a 'user join' -event, appends the notifications of a user joining to the bottom of the message-panel
socket.on('user join', function (user) {
    console.log(user + " joined.");
    var messagesList = $("#messages");
    //var lastMsgSender = $("ul li").last().find("div").data('sender');
    messagesList.append($('<li>'));
    var lastMsgLi = $("li").last();
    lastMsgLi.append($('<p class="joinMsg">').text(user + " joined!"));
    if (username != user) loginPush(user);
});

// On a 'chat message' -event, appends the message to the bottom of the message-panel
socket.on('chat message', function (msg) {
    var messagesList = $("#messages");
    var lastMsgSender = $("ul li").last().find("div").data('sender');
    messagesList.append($('<li>'));
    var lastMsgLi = $("li").last();
    if (lastMsgSender != msg.username) {
        lastMsgLi.append($('<p class="sender">').text(msg.username));
        //lastMsgLi.append($('<br>'));
    }
    lastMsgLi.append($('<div class="msg" data-sender="' + msg.username + '">').append($('<p>').text(msg.message)));
    if (timerDone && msg.username != username) msgPush(msg);
});