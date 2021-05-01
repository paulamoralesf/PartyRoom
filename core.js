const DB = require("./database.js");
//var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//const Rooms = require("./roomsModel.js");

var CORE = {
    num_clients: 0, //amount of connected clients

    chatRooms: [], //has each room and the clients inside each


    DB: require("./database.js"), //get the abstracted database

    init: function() {
        console.log("Inizialising CORE...");
    },

    onClientConnect: function(connection) {
        connection.username = false; //starts as false until user logIn
        let rooms = [];
        CORE.chatRooms.forEach(room => {
            rooms.push(room.roomName);
        });

        msg = {
            type: "rooms",
            rooms: rooms
        }
        connection.sendUTF(JSON.stringify(msg));
        this.num_clients++;
    },

    onNewMessage: async function(connection, message) {
        //console.log(`  - ${connection.username || "'Unidentified User'"} sent us: ${JSON.stringify(message.utf8Data)}`);

        let msg = JSON.parse(message.utf8Data);
        switch (msg.type) {
            case 'aut': //autentication to enter a room
                // if (connection.username) //case if was in a different room before
                //     leaveRoom(connection.username, connection.roomName, connection.roomIndex, connection); **no hace falta si no cambia de sala

                let validUser = await this.onLogIn(msg.username, msg.password);

                let alreadyIn = false; //token true if username already inside any chat room
                let otherClientsIn = []; //get the other users already in room
                this.chatRooms.forEach(room => {
                    if (room) {
                        room.clients.forEach(client => {
                            if (client.username == msg.username) {
                                alreadyIn = true;
                                console.log("   > but the same username already is online.");
                            }
                        });
                    }

                    if (room.roomName == msg.room) {
                        room.clients.forEach(client => {
                            otherClientsIn.push({ username: client.username, cData: client.cData, avatar: client.avatar }); //save every client info
                        });
                    }
                });

                let validClient = false;
                if ((otherClientsIn.length == 0 && msg.clientType == 'DJ') || (otherClientsIn.length > 0 && msg.clientType == 'partier')) {
                    validClient = true;
                }

                let validation = { type: "login", validConnection: (validUser != undefined) && !alreadyIn && validClient, validUser: validUser,
                    alreadyIn: alreadyIn, pos: validUser ? validUser.position : false, clients: otherClientsIn, avatar: validUser ? validUser.avatar : false, }; //sends if was a valid user
                connection.sendUTF(JSON.stringify(validation)); //debugg **

                if (validUser != undefined && !alreadyIn && validClient) {
                    setRoom(msg.room, msg.username, connection, validUser.avatar, validUser.position, msg.clientType);

                    let info = infoMsg(msg.username, `joined the room as "${msg.clientType}"`, true, validUser.position);
                    broadcastFromUser(info, connection);
                }

                break;
            case 'create':
                let validCreation = await this.onSignIn(msg.username, msg.password, msg.avatar);
                console.log(validCreation);
                let creation = { type: "signin", content: validCreation };
                connection.sendUTF(JSON.stringify(creation));
                break;
            case 'text': //on text message
                broadcastFromUser(msg, connection);
                break;
            case 'update': //updating data
                let clients = this.chatRooms[connection.roomIndex].clients;
                if (clients.length)
                    clients.forEach(client => {
                        if (client.connection == connection) {
                            client.pos = msg.cData.pos;
                            client.cData = msg.cData;
                        }
                    });
                break;
            case 'setsettings':
                let validIdentification = await this.onLogIn(connection.username, msg.password); //not login but the same confirmation
                let usernameTaken = await DB.findByUsername(msg.update.username); //check if already taken
                let canUpdate = { type: "validUpdate", content: false};
                
                if (validIdentification && (!usernameTaken.length || !msg.update.username) ) { //if valid old password and not taking a new username already taken
                    DB.updateUserData(validIdentification.username, false, msg.update.avatar, msg.update.password, msg.update.username);
                    updateInfo(connection, msg.update.username, msg.update.avatar); //pass the elements to  update if unidentified checked inside
                    console.log(`User "${validIdentification.username}" updated: ${JSON.stringify(msg.update)}`);
                    canUpdate.content = true;
                    
                    //message to broadcast other users with the updates
                    let userUpdate = { type: "userUpdate", oldUsername: validIdentification.username, updates: {username: msg.update.username, avatar: msg.update.avatar} };
                    broadcastFromUser(userUpdate, connection);
                }
                connection.sendUTF(JSON.stringify(canUpdate));
                break;
            case 'info-music':
                broadcastFromUser(msg, connection);
                console.log(msg); //music info mesage
                break;
                /* case 'room-info':
                    let clients = CORE.chatRooms[connection.roomIndex].clients; //clients in his same room
                    msg={
                        type: "list-clients",
                        content: clients
                    }
                    connection.sendUTF(JSON.stringify(msg))
                    break; */
            default:
                break;
        }
    },

    onClientDisconnect: function(connection) {
        if (connection.username)
            leaveRoom(connection.username, connection.roomName, connection.roomIndex, connection);

        this.num_clients--;
    },

    onLogIn: async function(username, password) {
        let validUser = await this.DB.verifyLogIn(username, password); //needs await-async to handle the pending promise (also out if not wrong/ may be )
        //console.log(validUser); //debugg see the valid user
        return validUser; //return the user found to be valid (or none)
    },

    onSignIn: async function(username, password, avatar) {
        let wasCreated = await this.DB.createUser(username, password, avatar);
        console.log(wasCreated);
        if (wasCreated) {
            console.log(`The Client "${username}" was created`);
            return true;
        } else
            return false;
    }

};

module.exports = CORE;

// FUNCTIONS

function updateInfo(connection, username, avatar) {
    CORE.chatRooms[connection.roomIndex].clients.forEach(client => {
        if (client.connection == connection) {
            if (username != undefined) {
                client.username = connection.username = username;
            }
            if (avatar != undefined)
                client.avatar = avatar;
        }
    });
}

function setRoom(room, username, connection, avatar, position, clientType) { //sets a connected user to a room

    let roomIndex = CORE.chatRooms.findIndex(element => element.roomName == room);

    let index = 0; //basic index if is a new room
    let pos = position ? position : [0, 0.1, 0];
    let cData = {};


    if (roomIndex == -1) {
        roomIndex = CORE.chatRooms.length; //if is a new room added at the end

        CORE.chatRooms.push({
            roomName: room,
            clients: [{ connection, username, avatar, pos, cData, clientType }]
        });
    } else {
        index = CORE.chatRooms[roomIndex].clients.push({ connection, username, avatar, pos, cData, clientType }) - 1;
    }

    //save the data used on connection
    connection.username = username;
    connection.roomName = room;
    connection.roomIndex = roomIndex;

    console.log(`<- User "${connection.username}" [avatar: ${avatar}] connected to room "${connection.roomName}" [${index}, ${connection.roomIndex}] in the position "${pos}"`);
}



async function leaveRoom(username, roomName, roomIndex, connection) { // remove user from it room connected clients
    let userIndex = -1;
    let i = 0;
    let clients = CORE.chatRooms[roomIndex].clients;

    clients.forEach(element => {
        if (element.connection == connection)
            userIndex = i;
        i++;
        //console.log(element.connection == connection, userIndex); //see the actual user leaving connection
    });
    if (userIndex != -1) {

        if (DB.updateUserData(username, position = clients[userIndex].pos)) { //on leave we update the data
            console.log(`   on leave, user "${username}" position was updated to ${position}.`);
        }

        let outClientType = clients[userIndex].clientType;
        await clients.splice(userIndex, 1);
        console.log(`-> User "${username}" disconected from room "${roomName}".`);

        if(clients.length && outClientType == "DJ") { //if there is clients remaining in the room
            clients[userIndex].clientType = "DJ";   //update next client after old DJ as the actual one
            broadcastFromUser({type: "newDJ", username: clients[userIndex].username}, connection);
            console.log(` - User "${clients[userIndex].username}" is the new DJ.`);
        }

        let info = infoMsg(username, "left the room.", false);
        broadcastFromUser(info, connection);
    }
}

function infoMsg(user, text, inRoom, position) { //username, message, bool is in room
    let pos = {};
    if (position) {
        pos = position
    }

    let info = { type: "info", username: user, content: text, exists: inRoom, pos: pos };
    return info;
}

function broadcastFromUser(msg, connection) { //broadcas all people except the incoming user
    let clients = CORE.chatRooms[connection.roomIndex].clients; //clients in his same room
    //var sendPos = clients.findIndex(client => client.connection == connection); //sender position
    if (msg.type == "text") {
        if (msg.to_user != "general-chat") {
            var receiver = clients.findIndex(client => client.username == msg.to_user);
            clients[receiver].connection.sendUTF(JSON.stringify(msg));
        } else {
            for (var k = 0; k < clients.length; k++) {
                if (clients[k].connection != connection) {
                    //if (msg.type != "text" || validDistance(clients[sendPos].pos, clients[k].pos)) { //only see if is in a valid distance for messages **Not used
                    clients[k].connection.sendUTF(JSON.stringify(msg)); //*only stringify for chat messages
                    //}
                }

            }
        }
    } else {
        for (var k = 0; k < clients.length; k++) {
            if (clients[k].connection != connection) {
                clients[k].connection.sendUTF(JSON.stringify(msg)); //*only stringify for chat messages
            }

        }
    }
}