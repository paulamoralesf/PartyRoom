const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomsSchema = new Schema({
        //sin poner el id se lo crea solo
        roomname: { type: String, required: true },
        elements: { type: String, required: true },
        playlist: { type: String }
    }, { versionKey: false } //without versioning when saving ( __v )
);

const Rooms = mongoose.model('Rooms', RoomsSchema, 'Rooms');

//we export this to be able to use it in other files in this project
module.exports = Rooms;