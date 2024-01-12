const mongoose = require('mongoose')

const recipesShecma =  mongoose.Schema({
        title: {
            type:String ,
            required:true,
        },
        category: {
            type:String ,
            required:true,
        },
        author: {
            type:String ,
            required:true,
        },
        origin: {
            type:String ,
            required:true,
        },     
          ingredients: [String],
          steps: [String],   
});
const model = mongoose.model("Recettes",recipesShecma);

module.exports = model;