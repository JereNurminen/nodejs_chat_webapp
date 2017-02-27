# A Node.js Chat
###By Jere Nurminen
A chat (web) app, made as a way of learning Node and MongoDB, among other things. It has both the server and the client in the same package, but they should be easy enough to separate. The chat is work-in-progress, but it already has most of the planned functionality: **Users** (implemented using [**Passport**](https://github.com/jaredhanson/passport-local)), **push notifications** (implemented using [**Push.js**](http://nickersoft.github.io/push.js/)) and *file uploads* (currently implemented for use as profile pictures, using [**Busboy**](https://github.com/mscdex/busboy)) to name a few. The real time-y action required by a proper chat is made possible by [**socket.io**](https://github.com/socketio/socket.io).

I plan to add much more functionality, such as private chats and file sharing, to this project. I'm also planning on making a mobile client using **PhoneGap**, and hosting the server on my trustworthy Raspberry Pi.
