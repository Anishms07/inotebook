
const express=require('express')
const router=express.Router()
const User=require('../models/User');
const { body, validationResult } = require('express-validator');
const  bcrypt = require('bcryptjs');
var  JWT_SECRET='harryisagoodboy'
const jwt = require('jsonwebtoken');

//create a user using:POST  "/api/auth/createuser" .Doesnt require auth       //No login required
router.post('/createuser', [
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 })
], async(req,res)=>{
      //If there are errors,Return bad request and errors
    const errors = validationResult(req);  //Validation code from expressvalidator site
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Check whether the user with email already exists
    try {
        
   
    let user= await User.findOne({email:req.body.email});
    console.log(user)
    if(user)
    {
        return res.status(400).json({error: "sorry a user with this email is already registered"})
    }

 const salt= await bcrypt.genSalt(10);
 const secPass=await bcrypt.hash(req.body.password,salt);

    //create a new user
    user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email
      });
      const data={
        user:{
            id:user.id
        }
      }

   const authtoken=jwt.sign(data,JWT_SECRET);
  
   //res.json(user)
   res.json({authtoken})
} catch (error) {
        console.log(error.message)
        res.status(500).send("Some error occured");
}
})
module.exports= router 