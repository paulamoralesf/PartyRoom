const mongoose = require('mongoose');

//Connect to MongoDB database
mongoose.connect('mongodb+srv://marterojo:rojomarte@cluster0.dqnvy.mongodb.net/Server?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true }, //set by default, ensure it to avoid warnings
);

mongoose.connection.once('open', function() { //once for the first connection try
    console.log('Connected successfully to Database');
}).on('error', function(error) { //with on controls if there is an error
    console.log('Connection error: ', error);
});



const md5 = require('md5'); //require md5 for encripting
const salt = "dsjadhñsadhsaljd dpassisdjkasdj marsjdspfddrfobert"; //salt added to encription
const Clients = require('./usersModel.js'); //require the model

/* const Rooms = require('./roomsModel.js')

let rockRoom = new Rooms({
    roomname: "RockRoom",
    elements: "table",
    playlist: "song"
});

rockRoom.save(function(error, res) { //save example
    if (error) {
        console.error(error);
    } else {
        console.log("Rock room created:", res);
    }
})
 */

var DB = { // DB abstraction functions

    verifyLogIn: async function(username, password) { //log in verification
        let users = await this.findByUsername(username);

        let validUser; //will have the validUser if found
        if (users) //if found
            users.forEach(user => {
                if (user.password == md5(salt + password)) {
                    validUser = user;
                }
            });
        return validUser;
    },

    createUser: async function(username, password, avatar) { //sign in registration
        let users = await this.findByUsername(username);
        if (users[0] != undefined) { //if exists someone with the same username, cant create (comparing the fisrt element cause with the empty arrays gave problems)
            console.log(" !X-Another user already has the same username.");
            return false;
        }

        let newClient = new Clients({
            username: username,
            password: md5(salt + password),
            avatar: avatar,
            position: [0, 0.1,0]
        });

        newClient.save(function(error, res) { //save example
            if (error) {
                console.error(error);
            } else {
                console.log("!O-Client created:", res);
            }
        });
        return true;
    },

    updateUserData: async function(username, position, avatar, password, newUsername) { //update the incoming data to one user
        let updateObj = {};
        if (avatar) {
            updateObj.avatar = avatar;
        }
        if (password) {
            updateObj.password = md5(salt + password);
        }
        if (position) {
            updateObj.position = position;
        }
        if (newUsername) {
            updateObj.username = newUsername;
        }

        //console.log("  ! update object:", updateObj); //debugg to see th updated data
        if (updateObj) {

            await Clients.updateOne({ username: username }, {
                    $set: updateObj
                },
                function(error) {
                    if (error) {
                        console.error
                        return false;
                    } else {
                        return true;
                    }
                });
        }

    },

    resetDB: async function() {
        await Clients.deleteMany({});
    },

    findByUsername: async function(username) {
            let users;
            await Clients.find({ username: username }, function(error, data) {
                if (error) {
                    //console.error(error)
                } else {
                    //console.log("Found Clients: ", data); //debugg of all same usernames
                    users = data;
                }
            });
            return users;
        } ///////////
        /* findByRoomname: async function(room) {
            let rooms;
            await Rooms.find({ roomname: room }, function(error, data) {
                if (error) {
                    console.error(error)
                } else {
                    //console.log("Found Clients: ", data); //debugg of all same usernames
                    rooms = data;
                }
            });
            return rooms;
        } */
};



module.exports = DB;