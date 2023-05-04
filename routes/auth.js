const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'im a bad boy da'
const fetchuser = require('../middleware/fetchuser');

//rpute 1  /api/auth/createuser
router.post('/createuser',[
   body('email','Enter a valid email').isEmail(),
   body('password','Enter a valid password with minimum 5 length').isLength({ min: 5 }),
   body('name','Enter a valid name with min.3 charcters').isLength({ min: 3 }),
   
   
],async (req,res)=>{
   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //checking email exist or not 
    try {
      let user = await User.findOne({email:req.body.email});
      if(user)
      {
        return res.status(400).json({error:'Email already in use'})
      }
      //paswword hassing 
      const salt=await bcrypt.genSalt(10);
      const secPass= await bcrypt.hash(req.body.password,salt);
      //creating new user 
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
          user:{
            id:user.id
          }
      }
      const authToken = jwt.sign(data,JWT_SECRET);
      res.json({authToken});
      
    } catch (error) {
      console.log(error.message)
      res.status(500).send('Some internal error occur');
    }
})

// Route 2 /api/auth/login
router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Enter a valid password ').exists(),
  
],async (req,res)=>{
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
   //checking email exist or not 
   const {email,password} = req.body;
   try {
     let user = await User.findOne({email});
     if(!user)
     {
       return res.status(400).json({error:'enter correct information'});
     }
     //comparing password 
     const passwordCompare = await bcrypt.compare(password,user.password);
     if(!passwordCompare)
     {
      return res.status(400).json({error:'enter correct information'})
     }

     const data = {
         user:{
           id:user.id
         }
     }
     const authToken = jwt.sign(data,JWT_SECRET);
     res.json({authToken});
     
   } catch (error) {
     console.log(error.message)
     res.status(500).send('Some internal error occur');
   }
});
//route 3  /api/auth/getuser
router.post('/getuser',fetchuser,async (req,res)=>{
   try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password");
     res.send(user);
   } catch (error) {
     console.log(error.message)
     res.status(500).send('Some internal error occur');
   }
});

module.exports=router;