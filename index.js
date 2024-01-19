const express = require("express");
const mongoose = require("mongoose");
const Recipe = require("./recipes");
const User = require("./users");
const  bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require('joi');

require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const secretKey="vtcrtdtygu";
const port=3004;


const swaggerOptions = {
  definition: {
      openapi: '3.0.0',
      info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A sample API for learning Swagger',
      },
      servers: [
      {
          url: 'http://localhost:3004/',
      },
      ],
  },
  apis: ['*.js'],
  };


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


const querySchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10),
  password: Joi.string().required().min(8),
});

app.use(express.json());
/**
 * @swagger
 * /registre:
 *   post:
 *     summary: Endpoint pour l'enregistrement d'un nouvel utilisateur.
 *     tags:
 *       - Utilisateurs
 *     requestBody:
 *       description: Données de l'utilisateur à enregistrer.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'utilisateur.
 *               email:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur.
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone de l'utilisateur.
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *               phone: +1234567890
 *               password: securePassword
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Mauvaise requête ou utilisateur déjà existant.
 *       500:
 *         description: Erreur interne du serveur.
 */

app.post('/registre', async (req, res) => {

  try {

    const { error } = querySchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

      const { name, email, phone, password } = req.body;
      let new_user = new User({
          name, email, phone,
          password: bcrypt.hashSync(password, 10),
      });

      const findUser = await User.findOne({ email: User.email });
      if (findUser) {
          return res.status(400).send('User already exists');
      }

      const savedUser = await new_user.save();
      console.log(savedUser);
      res.status(201).send("Created");
  } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification de l'utilisateur.
 *     requestBody:
 *       description: Les informations d'identification de l'utilisateur.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur.
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *             example:
 *               email: john@example.com
 *               password: securePassword
 *     responses:
 *       200:
 *         description: Authentification réussie. Retourne un token JWT.
 *         content:
 *           application/json:
 *             example:
 *               token: "jwt_token_here"
 *       401:
 *         description: Identifiant ou mot de passe incorrect.
 *       500:
 *         description: Erreur interne du serveur lors de l'authentification.
 */
app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      const passwordMValid = await bcrypt.compare(password, user.password);

      if(!passwordMValid || !user){
         return res.status(401).send("Username or Password is not correct!");
      }
  
      jwt.sign({ user }, secretKey, {expiresIn : "1d"} ,(err, resultat)=>{
        if (err) {
          return res.json({ error: err });
        } else {
          res.json({ token: resultat });
        }
      });
      
    } catch (error) {
      console.error("Erreur lors de l'authentification :", error.message);
      res.status(500).send("Erreur interne du serveur");
    }
  });

  function VerifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      console.log(bearerHeader);
      const bearer = bearerHeader.split(' ');
      const token = bearer[1];
      if(!token){
        res.status(401).json({message:"unauthorized"})
      }
      
      jwt.verify(req.token, secretKey, (err, data) => {
        if (err) {
          res.sendStatus(403);
        } else {
          req.user = data.user;
        }
      });
      req.user={...VerifyToken};

      next();
    } else {
      res.sendStatus(403);
    }
  }



  /**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Obtenir la liste des recettes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des recettes récupérée avec succès.
 *         content:
 *           application/json:
 *             example:
 *               - recipe1
 *               - recipe2
 *               - recipe3
 *       401:
 *         description: Non autorisé. Le token JWT est manquant ou invalide.
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des recettes.
 */


app.get('/recipes',VerifyToken,async(req,res)=>{
    try{
       result = await Recipe.find({});
       res.send(result);
    }catch(err){
         console.log(err);
    }
});


app.use(express.json());

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Ajouter une nouvelle recette.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Les détails de la nouvelle recette.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la recette.
 *               category:
 *                 type: string
 *                 description: Catégorie de la recette.
 *               author:
 *                 type: string
 *                 description: Auteur de la recette.
 *               origin:
 *                 type: string
 *                 description: Origine de la recette.
 *               ingredients:
 *                 type: array
 *                 description: Ingrédients de la recette.
 *               steps:
 *                 type: array
 *                 description: Étapes de préparation de la recette.
 *             example:
 *               title: "Nouvelle recette"
 *               category: "Dessert"
 *               author: "John Doe"
 *               origin: "France"
 *               ingredients: ["ingrédient1", "ingrédient2"]
 *               steps: ["étape1", "étape2"]
 *     responses:
 *       200:
 *         description: Recette ajoutée avec succès.
 *       500:
 *         description: Erreur interne du serveur lors de l'ajout de la recette.
 */


app.post('/recipes',VerifyToken,async(req,res)=>{
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


/**
 * @swagger
 * /recipes/{title}:
 *   delete:
 *     summary: Supprimer une recette par titre.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         description: Titre de la recette à supprimer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suppression de la recette réussie.
 *       401:
 *         description: Non autorisé. Le token JWT est manquant ou invalide.
 *       500:
 *         description: Erreur interne du serveur lors de la suppression de la recette.
 */

app.delete('/recipes/:title',VerifyToken,async(req,res)=>{
    try{
        await Recipe.findOneAndDelete({ title: req.params.title});
        res.send("Delete done");
    } catch(err) {
        res.send(err);
    }

});

/**
 * @swagger
 * /recipes/{title}:
 *   put:
 *     summary: Mettre à jour une recette par titre.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         description: Titre de la recette à mettre à jour.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Les détails mis à jour de la recette.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nouveau titre de la recette.
 *               category:
 *                 type: string
 *                 description: Nouvelle catégorie de la recette.
 *               author:
 *                 type: string
 *                 description: Nouvel auteur de la recette.
 *               origin:
 *                 type: string
 *                 description: Nouvelle origine de la recette.
 *               ingredients:
 *                 type: array
 *                 description: Nouveaux ingrédients de la recette.
 *               steps:
 *                 type: array
 *                 description: Nouvelles étapes de préparation de la recette.
 *             example:
 *               title: "Recette mise à jour"
 *               category: "Plat principal"
 *               author: "Jane Doe"
 *               origin: "Italie"
 *               ingredients: ["nouvel ingrédient1", "nouvel ingrédient2"]
 *               steps: ["nouvelle étape1", "nouvelle étape2"]
 *     responses:
 *       200:
 *         description: Mise à jour de la recette réussie.
 *       401:
 *         description: Non autorisé. Le token JWT est manquant ou invalide.
 *       500:
 *         description: Erreur interne du serveur lors de la mise à jour de la recette.
 */




app.put('/recipes/:title',VerifyToken,async(req,res)=>{
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

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));