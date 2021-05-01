var socket = new WebSocket("wss://ecv-etic.upf.edu/node/9018/ws/"); //SERVER CONFIGURATION **** wss://ecv-etic.upf.edu/node/9018/ws/
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;

var lateralPanel = document.querySelector("#panel-interface")
var CHAT = document.querySelector("#chat")
var chatTab = document.querySelector("#chat-selection");
var roomTab = document.querySelector("#login-list-room");

var chatWindow = document.querySelector("#room-window");
var chat = document.querySelector("#chat #general");
var chatPrivate = document.querySelector("#chat #private")
var input = document.querySelector(".send-box");

var send_button = document.querySelector(".send-button");

var chatButton = document.querySelector("#selectchat-button");
var userChat = chatTab.value; //for this chat is loaded before menu in html
var msgClass = "public";

var modal = document.querySelector(".modal-container");
var buttonModal = document.querySelector(".close-modal")


function chatInputOption() { //reacts to chat input options
    if (input.value == "!out") {
        SingOut();
        input.value = "";
    } else {
        sendMsg();
    }
}



function showInfo(content) { //show info in the chat
    var info = document.createElement("p");
    info.className = "info";
    info.innerText = content;

    chat.append(info);
    chat.scrollTop = 10000; //let the scrollbar at the end
}


function usersPanel(name, remove = false) {
    if (remove == false) {
        chatExist = -1;
        for (var i = 0; i < chatTab.length; i++) {
            if (chatTab.options[i].value == name) {
                var chatExist = 1;
                break;
            }
        }
        if (chatExist == -1) {
            var nameElement = document.createElement("option");
            nameElement.value = name;
            nameElement.innerText = name;;
            chatTab.append(nameElement);
        }
    } else {
        for (var i = 0; i < chatTab.length; i++) {
            if (chatTab.options[i].value == name) {
                chatTab.remove(i);
                break;
            }
        }
    }
}


//responding to the inpit area
send_button.addEventListener("click", chatInputOption);

input.addEventListener("keydown", (key) => {
    if (key.keyCode == 13) { //pressing enter
        chatInputOption();
    }
});


function sendMsg() { //user sends message in chat

    let msg = { //create a JSON to send on hte server
        type: "text",
        username: username,
        to_user: userChat,
        msgClass: msgClass,
        content: input.value
    };
    showMessage(msg.content, msg.username);
    socket.send(JSON.stringify(msg));
    input.value = "";

}


function showMessage(content, name, id, type, receiver) { //showing chat messages
    if (content == "") {
        return;
    }
    //create a new paragraph msg element

    var msg = document.createElement("div");
    msg.className = "msg";
    msg.id = id || "sent"; //specifies if its from an outsider (recieved) or from the sender (sent)

    var text = document.createElement("p");
    text.className = "text";
    text.innerText = content; //msg content text

    var user = document.createElement("p");
    user.className = "user";

    //add to the msg div the user and the text sent
    if (id) { //meaning when recived from others
        user.innerText = name;
        msg.appendChild(text);
        msg.appendChild(user);
        if (type == "private") { userChat = name }
    } else {
        user.innerText = "You";
        msg.appendChild(user);
        msg.appendChild(text);
    }
    if (userChat == 'general-chat') {
        chat.append(msg);
    } else {
        addMessageChat(msg, userChat)
    }
    CHAT.scrollTop = 1000;
    /* let name = userChat;
        let chatExist = activeChats.findIndex(element => element == name);
        if (chatExist == -1) {
            createChat(name)
        } else {
            addMessageChat(msg, name)
        }
 */

    /* chatPrivate.className = "chat-" + receiver;
    chatPrivate.append(msg);
    chatPrivate.scrollTop = 1000; */
    //let the scrollbar at the end
}

function createChat(toUser) {
    var newChat = document.createElement("div");
    newChat.className = toUser;
    newChat.id = "private";
    var boxTitle = document.createElement("div");
    boxTitle.className = "chat-title";
    var title = document.createElement("h2");
    title.innerText = toUser;
    boxTitle.appendChild(title);
    newChat.append(boxTitle);
    CHAT.append(newChat)
    newChat.style.visibility = "visible";
    chat.style.visibility = "hidden";
}

function addMessageChat(msg, chatname) {
    var chatSelected = document.querySelector(`.${chatname}`);
    chatSelected.append(msg);
    //chatSelected.scrollTop = 1000;
    var chats = document.querySelectorAll("#private");
    for (var i = 0; i < chats.length; i++) {
        if (chats[i] != chatSelected) chats[i].style.visibility = "hidden";
    }
}

//PEER FUNCTIONS 

function openingPeer() {
    if (clientType == 'DJ') {
        let peer = new Peer(chatRoom)
        peer.on('open', (id) => {
            console.log("Peer Connected with ID: ", id)
            getUserMedia({ video: true, audio: true }, (stream) => {
                local_stream = stream;
                setLocalStream(local_stream);
                videoWall(local_stream);
            }, (err) => {
                console.log(err)
            })
            console.log("Waiting for peer to join.")
        })
        peer.on('call', (call) => {
            call.answer(local_stream);
            call.on('stream', (stream) => {
                console.log(stream)
                    //setRemoteStream(stream);
            })
        })
        peer.on('connection', (conn) => {
            console.log(`a partier is connected with`, conn.peer)
        })
    } else {
        let peer = new Peer()
        peer.on('open', (id) => {
            console.log("Connected with Id: " + id)
            conn = peer.connect(chatRoom);
            getUserMedia({ video: true, audio: true }, (localstream) => {
                //local_stream = stream;
                //setLocalStream(local_stream)
                console.log("Joining peer")
                let call = peer.call(chatRoom, localstream)
                call.on('stream', (stream) => {
                    console.log('Soy el streaming de llegada', stream)
                    setRemoteStream(stream);
                    if (canvasvideo) {
                        videoWall(stream)
                        console.log('video wall')
                    }
                })
            }, (err) => {
                console.log(err)
            })
        })
    }
}

function videoWall() {
    let video;
    if (clientType != 'DJ') video = document.getElementById("remote-video");
    else video = document.getElementById("local-video");
    setTimeout(function() {
        var ctx = canvasvideo.getContext("2d");
        ctx.drawImage(video, 0, 0, 500, 500);

    }, 1500)
}

var tex_canvas = null;

function updateCanvas2D() {

    if (!tex_canvas)
        gl.textures["canvas_texture"] = tex_canvas = GL.Texture.fromImage(canvasvideo);
    else
        tex_canvas.uploadImage(canvasvideo);

}


function playSong(music_info) {
    var paused = music_info.paused;
    var src = music_info.song;
    var time = music_info.time;
    musicExist = document.querySelector("#receive-song");
    if (musicExist == null) {
        audio_cli = document.createElement("audio");
        audio_cli.id = "receive-song";
        audio_cli.src = src;
        audio_cli.currentTime = time;
        audio_cli.play();
        chatWindow.append(audio_cli)
        console.log("musica creada")
    } else {
        if (paused == true) {
            audio_cli.pause();
        } else {
            audio_cli.src = src;
            audio_cli.currentTime = time;
            audio_cli.play();
        }
    }

}

function setRemoteStream(stream) {
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play();
}

function setLocalStream(stream) {

    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.play();
}

function updateRooms(rooms) {
    console.log(`The rooms are: ${rooms}`);
    rooms.forEach(room => {
        var roomElement = document.createElement("option");
        roomElement.value = room;
        roomElement.innerText = room;
        roomTab.append(roomElement);
    })
}



function notifyMsg(msg) {
    modal.style.visibility = "visible";
    modal.querySelector("p").innerText = msg;
}
buttonModal.addEventListener("click", function() {
    console.log("click cerrar")
    modal.style.visibility = "hidden";
})

// SERVER FUNCTIONS ***
socket.onopen = function() {
    console.log("Socket has been opened! :)");
}

socket.onmessage = function(UTFmsg) {
    var msg = UTFmsg.data;
    //console.log(msg);
    if (msg[0] === "{") { //if not a JSON object
        var msg_obj = JSON.parse(msg); //turn msg to a JSON

        //different messages options
        switch (msg_obj.type) {
            case "rooms":
                updateRooms(msg_obj.rooms);
                break;
            case "login":
                if (msg_obj.validConnection) { //if true login
                    console.log(`Valid Log In:\n Hello "${username}" to room "${chatRoom}"\nclient type: '${clientType}'`);
                    character.name = username;
                    openRoom(); //change to chat window
                    openingPeer();
                    setUCharacter(msg_obj.pos, msg_obj.avatar); //set user character position
                    msg_obj.clients.forEach(client => {
                        addCharacter(client.username, client.cData.pos, client.avatar);
                    });
                    showInfo(`You can express yourself by any number\n ...ah, don't forget to greet people with [SPACE]`);
                } else {
                    if (!msg_obj.validUser) {
                        notifyMsg("Incorrect Log In");
                    } else if (msg_obj.alreadyIn) {
                        notifyMsg("You're already logged");
                    } else if (msg_obj.clients.length) {
                        console.log(msg_obj.clients);
                        notifyMsg("There is already another user as the DJ");
                    } else {
                        notifyMsg("You're the first one in this room. Please select DJ as type of client");
                    }
                }
                break;
            case "signin":
                if (msg_obj.content) {
                    LogInMenu.style.visibility = "visible";
                    SignInMenu.style.visibility = "hidden";
                    notifyMsg("Validation succeeded, now you can log In.");
                } else
                    notifyMsg("Username already taken.");
                break;
            case "room-info":
                //usersPanel(msg_obj.content.username);
                msg_obj.content.forEach(user => { //update all characters except the user one
                    if (user.username != username) {
                        updateCharacter(user.username, user.cData, user.avatar);
                        usersPanel(user.username);
                    }
                });
                break;
            case "userUpdate":
                console.log("updated: " + msg_obj.updates + "\n as old user -> " + msg_obj.oldUsername);
                var updateChar = scene.root.findNodeByName(msg_obj.oldUsername); //find by old username
                //update changed values
                usersPanel(msg_obj.oldUsername, remove = true);
                if (updateChar) { //secure from invalid errors
                    if (msg_obj.updates.username) updateChar.name = msg_obj.updates.username;
                    if (msg_obj.updates.avatar) updateChar.texture = avatarCharacter(msg_obj.updates.avatar);
                }
                break;
            case "text":
                console.log(`User ${msg_obj.username} said "${msg_obj.content}" \nmore info ${JSON.stringify(msg_obj)}`);
                if (msg_obj.msgClass == "private") {
                    var chats = document.querySelectorAll("#private");
                    var chatExist = -1;
                    for (var i = 0; i < chats.length; i++) {
                        if (chats[i].className == msg_obj.username) {
                            chatExist = 1;
                            break;
                        }
                    }
                    if (chatExist == -1) {
                        createChat(msg_obj.username);
                    }
                    //showMessage(msg_obj.content, msg_obj.username, "recieved");

                }
                if (chatPanel.style.visibility == "hidden") {
                    if (msg_obj.msgClass == "public")
                        chatTab.value = "general-chat";
                    else
                        chatTab.value = msg_obj.username;
                    notifyMsg(`${msg_obj.username} sent a message in ${msg_obj.msgClass}`);
                    visibleChat();
                }
                showMessage(msg_obj.content, msg_obj.username, "recieved", msg_obj.msgClass);

                break;
            case "info":
                showInfo(`user ${msg_obj.username} ${msg_obj.content}`);
                usersPanel(msg_obj.username);
                if (msg_obj.exists) {
                    addCharacter(msg_obj.username, msg_obj.pos);
                } else {
                    removeCharacter(msg_obj.username);
                    if (scene.root.findNodeByName("board " + msg_obj.username)) scene.root.removeChild(scene.root.findNodeByName("board " + msg_obj.username)); //remove also its name board
                    usersPanel(msg_obj.username, remove = true);
                    chatTab.value = "general-chat";
                    visibleChat();
                }
                break;
            case "newDJ":
                if (msg_obj.username == username) {
                    clientType = "DJ";
                    createMusicPlayer();
                }
                openingPeer();
                showInfo(`${msg_obj.username} is the new DJ of the room.`);
                break;
            case "validUpdate":
                if (msg_obj.content) {
                    if (newUserValues.username) {
                        scene.root.removeChild(scene.root.findNodeByName("board " + username));
                        username = newUserValues.username;
                        document.querySelector(".username").innerText = character.name = username;
                    }
                    if (newUserValues.avatar) {
                        avatar = newUserValues.avatar;
                        updateCharacter(username, false, avatar);
                    }
                } else
                    notifyMsg("Couldn't update settings since username is already taken."); //the avatar is checked via web
                break;
            case "info-music":
                playSong(msg_obj);
                console.log('canción es: ', msg_obj);
                break;
            default:
                console.warn("Unknown message type:", msg_obj);
        }
    } else {
        console.warn("Recived message is not well defined.");
    }
}

socket.onclose = function() {
    console.warn("Server connection has been closed.");
    notifyMsg(`The server is closed :(`);
}