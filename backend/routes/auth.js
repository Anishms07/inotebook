
const express=require('express')
const router=express.Router()
const User=require('../models/User');
const { body, validationResult } = require('express-validator');
const  bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser')


const   JWT_SECRET='harryisagoodboy'
// Route 1 :create a user using:POST  "/api/auth/createuser" .Doesnt require auth       //No login required
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


// Route 2: Authenticate a user using:post "api/auth/login". No login required

router.post('/login', [

  body('email','Enter a valid email').isEmail(),
  body('password','Password cannot be blank').exists()
], async(req,res)=>{

    //If there are errors,Return bad request and errors
  const errors = validationResult(req);  //Validation code from expressvalidator site
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
const {email,password}=req.body
try {
  const user= await User.findOne({email})
  if(!user)
  {
    return res.status(400).json({error:"Please login with the correct credentials"})
  }
  const comparepassword= await bcrypt.compare(password,user.password)
  if(!comparepassword)
  {
    return res.status(400).json({error:"Please login with the correct credentials"})
  }
  //
  const data={
    user:{
        id:user.id
    }
  }

const authtoken=jwt.sign(data,JWT_SECRET);
res.json({authtoken})
} 
catch (error) {
  
  console.error(error.message)
  res.status(500).send("Internal Server error ocurred");
}
})

// Route 3: Get logged in user details using: post "api/auth/getuser" login required
router.post('/getuser',fetchuser, async(req,res)=>{

  try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
    
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server error ocurred");
  }
})

module.exports= router 