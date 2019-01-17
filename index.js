var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var numberUser = 0;
var diceMax = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  numberUser++;
  console.log('a user connected');
  console.log('Il y a ' + numberUser + 'user de connecte.');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});


function gameon() {
  for (let index = 0; index < numberUser; index++) {
    let dice = Math.floor(Math.random() * 6) + 1;
    if (dice > diceMax) {
      diceMax = dice;
      user = "le type";//nom de l'user
    }
  }
  console.log("${user} as won");
}
window.setInterval(gameon, 10000);


 // when the user disconnects.. perform this
socket.on('disconnect', () => {
  if (addedUser) {
    --numUsers;

    // echo globally that this client has left
    socket.broadcast.emit('user left', {
      username: socket.username,
      numUsers: numUsers
    });
  }
});

socket.on('add user', (username) => {
  if (addedUser) return;

  // we store the username in the socket session for this client
  socket.username = username;
  ++numUsers;
  addedUser = true;
  socket.emit('login', {
    numUsers: numUsers
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});