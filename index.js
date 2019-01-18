var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var numberUser = 0;
const bodyParser = require("body-parser");

app.use(express.static('html'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post("/", function (req, res) {
    console.log(req.body.user.name)
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/html/index.html');
});

io.on('connection', function(socket){
  numberUser = numberUser + 1;
  console.log(socket.id + ' s\'est connecté');
  console.log('Il y a ' + numberUser + ' utilisateur de connecté.');

  socket.on('disconnect', function() {
    numberUser = numberUser - 1;
    console.log(socket.id + ' s\'est déconnecté');
  });

  socket.on('sendMessage', function (data) {
    socket.broadcast.emit('message', data);
    socket.emit('message', { text: data.text });   
    }); 
});

http.listen(3000, function(){
  console.log('Ecoute sur le port :3000');
});

//console externes avec les connexion et tout 


//var numberUser = 0;
//var diceMax = 0;
// function gameon() {
//   for (let index = 0; index < numberUser; index++) {
//     let dice = Math.floor(Math.random() * 6) + 1;
//     if (dice > diceMax) {
//       diceMax = dice;
//       user = "le type";//nom de l'user
//     }
//   }
//   console.log("${user} as won");
// }
// window.setInterval(gameon, 10000);
