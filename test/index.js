var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

// Chargement de la page index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

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

    socket.on('nouveau_color', function(color) {
        socket.color = color;
        console.log(socket.color);
    });
    socket.on('nouveau_size', function(size) {
        socket.size = size;
        console.log(socket.size);
    });
    socket.on('nouveau_number', function(number) {
        socket.number = number;
        console.log(socket.number);
    });
    socket.on('nouveau_combat', function (combatnumber) {
        const mysql = require('mysql');
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'RandomGame'
        });

        connection.beginTransaction(function (err) {
            if (err) {
                connection.end();
                throw err;
            }

            connection.query("INSERT INTO `dice` (`id`, `name`, `color`, `size`, `result`) VALUES ('" + socket.pseudo + "," + socket.pseudo + "," + socket.color + "," + socket.size + "," + socket.number + "');", function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        connection.end();
                        throw error;
                    });
                }

                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            connection.end();
                            throw err;
                        });
                    }
                    console.log('Success !');
                });
            });
        });

    });
});

server.listen(8080);
console.log('Ecoute sur le port :8080');
