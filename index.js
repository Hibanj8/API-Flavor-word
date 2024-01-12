const express = require("express");
const mongoose = require("mongoose");
const Recipe = require("./recipes");

const app = express();
const port = 3004 ;

const startServer = async () => {
    try{  await mongoose.connect("mongodb+srv://najihiba137:hiba123@cluster0.vjtwcvl.mongodb.net/");
           console.log("connexion réussie avec la bdd");
           app.listen(port,()=>{
           console.log(`http://localhost:${port}`);
           })
       }catch(error){
          console.log(`${error} did not connect`);
       }
    
};  
startServer();


app.get('/recipes',async(req,res)=>{
    try{
       result = await Recipe.find({});
       res.send(result);
    }catch(err){
         console.log(err);
    }
});
app.use(express.json());
app.post('/recipes',async(req,res)=>{
    try{
            let new_recipe = new Recipe({
            title : req.body.title,
            category: req.body.category,
            author: req.body.author,
            origin: req.body.origin,
            ingredients: req.body.ingredients,
            steps: req.body.steps     
    });
        await new_recipe.save()
        res.send('save done');
    }catch(err){
       console.log(err)
    }
})


app.delete('/recipes/:title',async(req,res)=>{
    try{
        await Recipe.findOneAndDelete({ title: req.params.title});
        res.send("Delete done");
    } catch(err) {
        res.send(err);
    }id

});

app.put('/recipes/:title',async(req,res)=>{
    try{
        const Update = await Recipe.findOneAndUpdate(
            {title : req.params.title},
            {
                title : req.body.title,
                category: req.body.category,
                author: req.body.author,
                origin: req.body.origin,
                ingredients: req.body.ingredients,
                steps: req.body.steps
            },
            { new: true},
        );
        res.send(Update);
    } catch(err) {
        res.send(err);
    }

});
