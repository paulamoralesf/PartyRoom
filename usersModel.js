const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientsSchema = new Schema({
    //sin poner el id se lo crea solo
    username: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: Number, required: true },
    position: Object
}, 
{ versionKey: false }  //without versioning when saving ( __v )
);

const Clients = mongoose.model('Clients', ClientsSchema, 'Clients');

//we export this to be able to use it in other files in this project
module.exports = Clients;