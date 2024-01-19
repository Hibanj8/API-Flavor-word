const mongoose = require("mongoose");


const usersShecma =  mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required: true,
    },
    email:{
        type:String,
        required: true,
        lowercase : true,
        unique : true,
    },
    phone:String,
    password:{
        type:String,
        required: true,
        minlength:[6, 'Too short password'],
    },
});
const model = mongoose.model("user",usersShecma);

module.exports = model;