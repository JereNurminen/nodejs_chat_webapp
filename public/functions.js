
var socket = io().connect();
var username = $('#username').text();
socket.emit('user join', username);
var timerDone = false;

$( document ).ready(function() {

    Push.clear();

    var timer = setTimeout(function(){
        timerDone = true;
    }, 5000);
    //clearTimeout(timer);

    $('#modifyStatus').click(function() {
        event.preventDefault();
        $('#oldStatus').toggle();
        $('#newStatus').toggle();
    });

    $('#cancelStatus').click( function() {
        event.preventDefault();
        $('#newStatus').toggle();
        $('#oldStatus').toggle();
    });

    $('#saveStatus').click( function() {
        event.preventDefault();
        $('#newStatus').toggle();
        $('#oldStatus').toggle();
        var newStatus = $('#statusBox').val();
        console.log(newStatus);
        //var userId = $('#userId').text();
        $.post('/updateStatus',
            {
                status: newStatus
            });
        $('#oldStatus').text(newStatus);
    });

    $('#changeProfilePictureButton').click(function(){
        event.preventDefault();
        $('#changeProfilePictureForm').show();
    });

    $('#newMessageField').submit(function () {
        event.preventDefault();
        var msg = {
            username: username,
            message: $('#newMessage').val(),
            date: Date.now()
        }
        console.log(msg);
        socket.emit('chat message', msg);
        $('#newMessage').val('');
        scrollToBottom();
        return false;
    });

    $('#messages').delegate('p.sender', 'click', function() {
        var userToSearch = $(this).text();
        getUserInfo(userToSearch);
    })

    $('.backToProfile').click(function() {
        toggleProfile();
    });
});

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

function toggleProfile() {
    $('#visitProfile').toggle();
    $('[data-profile="own"]').toggle();
}

function scrollToBottom() {
    $('#messages').stop().animate({
        scrollTop: $('#messages')[0].scrollHeight
    }, 800);
}

socket.on('user join', function (user) {
    console.log(user + " joined.");
    var messagesList = $("#messages");
    //var lastMsgSender = $("ul li").last().find("div").data('sender');
    messagesList.append($('<li>'));
    var lastMsgLi = $("li").last();
    lastMsgLi.append($('<p class="joinMsg">').text(user + " joined!"));
    if (username != user) loginPush(user);
});

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