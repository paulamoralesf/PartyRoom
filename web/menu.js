var FrontPage = document.querySelector(".front-page"); //Configuration features
var LogInMenu = document.querySelector(".log-in");
var SignInMenu = document.querySelector(".sign-in");
var RoomMenu = document.querySelector(".room-custom");

var login_button = document.querySelector("#log-in");
var signin_button = document.querySelector("#sign-in");
var musicCont = document.querySelector("#music-player-container")
var buttonplay = document.createElement("button");
buttonplay.innerText = "Play/Pause"
var next = document.createElement("button");
next.innerText = "->"
var previous = document.createElement("button");
previous.innerText = "<-"

// FUNCTIONS ***
function openRoom() {
    chatWindow.style.visibility = "visible";
    FrontPage.style.visibility = "hidden";
    //all front page elements hidden
    LogInMenu.style.visibility = "hidden";
    SignInMenu.style.visibility = "hidden";
    if (clientType == 'DJ') {
        createMusicPlayer();
    }
}

function createMusicPlayer() {
    var music_player = document.createElement("audio");
    num_song = 0;
    music_player.id = "music_player"
    music_player.src = `./audio/song_${num_song}.mp3`
    music_player.preload = "auto"
    music_player.play();
    //music_player.controls = "true";
    musicCont.append(music_player);
    musicCont.append(previous);
    musicCont.append(buttonplay);
    musicCont.append(next);
}
next.addEventListener("click", function() {
    if (num_song == 4) num_song = -1;
    music_player.src = `./audio/song_${++num_song%4}.mp3`;
    music_player.preload = "auto";
    music_player.play();
    musicEvent();
})
previous.addEventListener("click", function() {
    if (num_song == 0) num_song = 1;
    music_player.src = `./audio/song_${--num_song%4}.mp3`;
    music_player.preload = "auto";
    music_player.play();
    musicEvent();
})

buttonplay.addEventListener("click", function() {
    /* let music = {
        type: "info-music",
        song: music_player.src,
        time: music_player.currentTime
    } */

    if (music_player.paused == false) {
        music_player.pause();


    } else {
        music_player.play()

    }
    //socket.send(JSON.stringify(music))
    musicEvent();
})

function musicEvent() {
    let music = {
        type: "info-music",
        song: music_player.src,
        time: music_player.currentTime,
        paused: music_player.paused
    }
    socket.send(JSON.stringify(music))
}

function SingOut() {
    chatWindow.style.visibility = "hidden";
    FrontPage.style.visibility = "visible";
    LogInMenu.style.visibility = "visible";
    //sign in remains hidden if not clicked
}


login_button.addEventListener("click", function() {
    if (LogInMenu.style.visibility == "visible") {
        LogIn();
    } else {
        LogInMenu.style.visibility = "visible";
        SignInMenu.style.visibility = "hidden";
    }
});

signin_button.addEventListener("click", function() {
    if (SignInMenu.style.visibility == "visible")
        SignIn();
    else {
        SignInMenu.style.visibility = "visible";
        LogInMenu.style.visibility = "hidden";
    }
});


//default values
var chatRoom;
var username; //to use it from chat after login
var clientType = null; //default
function LogIn() {

    //get the configuration info
    //
    if (document.querySelector(".log-in_chatRoom").value) {
        chatRoom = document.querySelector(".log-in_chatRoom").value;
    } else {
        chatRoom = document.querySelector("#login-list-room") != null ? document.querySelector("#login-list-room").value : false;
        chatRoom = chatRoom || "Party Room"; //default room name
    }

    username = document.querySelector(".log-in_username").value;
    let password = document.querySelector(".log-in_password").value;
    clientType = document.querySelector("#client-type").value;

    //update in DOM values
    document.querySelector(".username").innerText = username;
    document.querySelector(".chatRoom").innerText = chatRoom;

    sendAutentication(username, password, chatRoom, clientType);
}

function sendAutentication(username, password, chatRoom, clientType) { //user sends an autentication message
    let data = {
        type: 'aut',
        username: username,
        password: password,
        room: chatRoom,
        clientType: clientType
    }
    socket.send(JSON.stringify(data));
}


function SignIn() {

    //get the configuration info
    let avatar = document.querySelector(".sign-in_avatar").value;
    username = document.querySelector(".sign-in_username").value;
    let password = document.querySelector(".sign-in_password").value;

    document.querySelector(".sign-in_avatar").value = 1;
    document.querySelector(".sign-in_username").value = "";
    document.querySelector(".sign-in_password").value = "";

    let lowerCaseLetters = /[a-z]/g;
    let upperCaseLetters = /[A-Z]/g;
    let numbers = /[0-9]/g;

    if (username.length >= 3 && username.match(lowerCaseLetters) &&
        password.length >= 8 && password.match(lowerCaseLetters) && password.match(upperCaseLetters) && password.match(numbers)) {
        sendCreation(username, password, avatar);
    } else {
        notifyMsg("Remember to fill the sign in correctly.\nYou shold have a username of at leat 3 letters and a password with 1 uppercase, 1 number and 8 letters.");
    }
}

function sendCreation(username, password, avatar) { //user sends an autentication message
    let data = {
        type: 'create',
        username: username,
        password: password,
        avatar: avatar
    }
    console.log(`Request creation "${username}" with avatar "${avatar}"`);
    socket.send(JSON.stringify(data));
}


//In-Room Menus

var chatPanel = document.querySelector("#chat-interface");
var confPanel = document.querySelector("#conf-interface");

var chatAccess = document.querySelector("#chat-access-button");
var confAccess = document.querySelector("#conf-access-button");
var exitButon = document.querySelector("#exit-button");

chatButton.addEventListener("click", openChat);
chatAccess.addEventListener("click", visibleChat);
confAccess.addEventListener("click", visibleConf);
exitButon.addEventListener("click", exitClose);

function exitClose() { //seeing the panel it closes it
    if (lateralPanel.style.visibility == "visible") {
        openPanel();
        confPanel.style.visibility = "hidden";
        chatPanel.style.visibility = "hidden";
    } else
        location.reload();
}

function visibleChat() {
    if (lateralPanel.style.visibility == "hidden")
        openPanel();
    if (chatPanel.style.visibility == "hidden") {
        confPanel.style.visibility = "hidden";
        chatPanel.style.visibility = "visible";
        openChat();
    } else {
        chatPanel.style.visibility = "hidden";
        openPanel(); //close panel
    }
}

function visibleConf() {
    if (lateralPanel.style.visibility == "hidden")
        openPanel();
    if (confPanel.style.visibility == "hidden") {
        chatPanel.style.visibility = "hidden";
        confPanel.style.visibility = "visible";
        closeChat();
    } else {
        confPanel.style.visibility = "hidden";
        openPanel(); //close panel
    }
}

function openPanel() { //and also close it in case already open
    if (lateralPanel.style.visibility == "hidden") {
        lateralPanel.style.visibility = "visible";
        chatWindow.style.gridTemplateColumns = "75% 25%";
    } else {
        lateralPanel.style.visibility = "hidden";
        chatWindow.style.gridTemplateColumns = "100% 0%";
    }
}

function openChat() {
    userChat = chatTab.value;
    let chats = document.querySelectorAll("#private");
    if (userChat == "general-chat") {
        msgClass = "public";
        chat.style.visibility = "visible"; //this is the general chat *Paula
        chat.style.height = "auto";
        console.log(`está en chat general`);
        for (var i = 0; i < chats.length; i++) {
            chats[i].style.visibility = "hidden";
            chats[i].style.height = "0";
            //chats.forEach(element => element.style.visibility = "hidden") NO FUNCIONA
        }
    } else {
        msgClass = "private";
        chat.style.visibility = "hidden";
        chat.style.height = "0";
        var chatExist = -1;
        for (var i = 0; i < chats.length; i++) {
            if (chats[i].className == userChat) {
                chatExist = 1;
                break;
            };
        }
        //chatExist = chats.some(element => element.className == userChat); NO FUNCIONA no entiendo por qué
        console.log(`Ha iniciado un chat privado con ${userChat}`)
        if (chatExist == -1) {
            createChat(userChat)
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].className != userChat) {
                    chats[i].style.visibility = "hidden"
                    chats[i].style.height = "0";
                }
            }
            /* chats.forEach(element => {
                if (element.className != userChat) {
                    element.style.visibility = "hidden"
                }
            }); */
        } else {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].className != userChat) {
                    chats[i].style.visibility = "hidden"
                    chats[i].style.height = "0";
                } else {
                    chats[i].style.visibility = "visible";
                    chats[i].style.height = "auto";
                }
            }
            /* chats.forEach(element => {
                if (element.className != userChat) {
                    element.style.visibility = "hidden"
                } else {
                    element.style.visibility = "visible"
                }
            }); */
        }
    }
}


function closeChat() {
    chat.style.visibility = "hidden";
    let private = document.querySelectorAll("#private");
    for (var i = 0; i < private.length; i++) {
        private[i].style.visibility = "hidden";
    }
}

var save = document.querySelector("#save-settings");
save.addEventListener("click", saveSettings);

var avatar = 1; //global user avatar
var newUserValues = { username: username, avatar: avatar };

async function saveSettings() {

    //get the configuration info
    let newUsername = document.querySelector(".new_username").value;
    let oldPass = document.querySelector(".old_password").value;
    let newPass = document.querySelector(".new_password").value;
    let newAvatar = document.querySelector(".new_avatar").value;

    //aux variables to ensure the user/password pattern
    let lowerCaseLetters = /[a-z]/g;
    let upperCaseLetters = /[A-Z]/g;
    let numbers = /[0-9]/g;

    let settings = {};
    if (newUsername) {
        if (newUsername.length >= 3 && newUsername.match(lowerCaseLetters))
            settings.username = newUserValues.username = newUsername;
    }
    if (newPass) {
        if (newPass.length >= 8 && newPass.match(lowerCaseLetters) && newPass.match(upperCaseLetters) && newPass.match(numbers))
            settings.password = newPass;
    }
    if (newAvatar) {
        settings.avatar = newUserValues.avatar = newAvatar;
    }

    let data = {
        type: 'setsettings',
        password: oldPass,
        update: settings
    }
    if (settings != {}) {
        console.log(`Request update "${username}"`);
        socket.send(JSON.stringify(data));
    }

    document.querySelector(".new_username").value = "";
    document.querySelector(".old_password").value = "";
    document.querySelector(".new_password").value = "";
    document.querySelector(".new_avatar").value = "";
}