const http = require('http');
const url = require('url');

var CORE = require("./core.js");

var WebSocketServer = require('websocket').server;
const port = 9018;
console.log(`Serving with PID ${process.pid}!`); //alert the service PID to know if killed

var server = http.createServer(function(req, res) {
    console.log('REQUESTED ' + req.url);

    switch (req.url) {
        case "/":
            res.end("SERVER RUNNING...");
            break;
        case "/status":
            res.end(`Current status:\n  Total Rooms: ${CORE.chatRooms.length}, Total Clients: ${CORE.num_clients}`);
            break;
        case "/rooms":
            let rooms = [];
            CORE.chatRooms.forEach(room => {
                rooms.push(room.roomName);
            });
            res.end(`Room list:\n  ${rooms}`);
            break;
        case "/clients":
            let clients = [];
            CORE.chatRooms.forEach(room => {
                room.clients.forEach(client => {
                    clients.push(client.username);
                });
            });
            res.end(`Clients online list:\n  ${clients}`);
            break;
        case "/resetDB":
            res.end("DB RESET DONE");
            CORE.DB.resetDB();
            break;
        case "/marsattack":
            res.end("SERVER STOPING...");
            process.exit(0);
        default:
            break;
    }
});

server.listen(port, function() {
    console.log(`Server listening on port ${port}!`);
});

var wsServer = new WebSocketServer({ httpServer: server }); //server http websocket to handle requests


// WS server event handler on connections
wsServer.on('request', function(request) { //(request refers to each client requesting)
    var connection = request.accept(null, request.origin);
    CORE.onClientConnect(connection);

    connection.on('message', function(message) {
        if (message.type === 'utf8') { //process WebSocket message if valid
            CORE.onNewMessage(connection, message);
        }
    });

    connection.on('close', function(connect) { //the function connect is different
        CORE.onClientDisconnect(connection);
    });

});


const dt = 0.1;

function update(dt) { //update clients positions

    CORE.chatRooms.forEach(room => {
        let msg = { type: "room-info", content: [] };
        room.clients.forEach(client => {
            msg.content.push({ username: client.username, cData: client.cData, avatar: client.avatar }); //save every client info
        });
        room.clients.forEach(client => { //broadcast info
            client.connection.sendUTF(JSON.stringify(msg));
        });
    })

}
setInterval(update, dt * 1000);


CORE.init();

wsServer.CORE = CORE;