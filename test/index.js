var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

// Chargement de la page index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
const helmet = require('helmet')
app.use(helmet())

//connexion a la base données mysql
var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'RandomGame'
});


//connexion aux modules socket.io
io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
        console.log(socket.pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    });

    //log des inputs des boutons avec les info
    socket.on('nouveau_color', function(color) {
        socket.color = color;
        console.log(socket.color);
    });
    socket.on('nouveau_size', function(size) {
        socket.size = size;
        console.log(socket.size);
    });

    //lancement du dé pour l'utilisateur
    socket.on('lancer_dice', function(number) {
      socket.number = number;
      console.log(socket.number);
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query("INSERT INTO `dice` (`name`, `color`, `size`, `result`) VALUES ('"+ socket.pseudo +"', '"+ socket.color +"', '"+ socket.size +"', '"+ socket.number +"');", function (err, result) {
          connection.release();
          if (err) throw err;
          //console.log(result);
        });
      });
    });

    socket.on('suppr_lancer', function() {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query("DELETE FROM dice WHERE id > 1;", function (err, result) {
          connection.release();
          if (err) throw err;
        });
      });
    });

    socket.on('nouveau_combat', function (combatnumber) {
      pool.getConnection(function (err, connection) {
        connection.query("SELECT `name` FROM `dice` WHERE `result`=(SELECT max(`result`) FROM `dice`);", function(err, result) {
          connection.release();
          if (err) throw err;
          var string = JSON.stringify(result);
          console.log(string);
          var winner = JSON.parse(string);
          console.log(winner.name);
        })
      });
    });
});

//écoute du port 8080 pour l'accès a la page
server.listen(8080);
console.log('Ecoute sur le port: 8080');
