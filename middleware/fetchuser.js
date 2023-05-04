var jwt = require('jsonwebtoken');
const JWT_SECRET = 'im a bad boy da';
const fetchuser = (req,res,next)=>{
    //get the user using jwt token
    const token=req.header('auth-token');
    if(!token)
    {
         res.status(401).send({ errors: 'enter valid token' });
    }
    try {
        const data=jwt.verify(token,JWT_SECRET);
        req.user=data.user;
        next();
        
    }  catch (error) {
       
        res.status(401).send('Some internal error occur');
      }
}
module.exports=fetchuser;