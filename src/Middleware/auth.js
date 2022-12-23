const jwt=require("jsonwebtoken");
const userModel = require("../Model/userModel");
const mongoose = require('mongoose')


const authentication=async function(req,res,next){
try{
    let token=req.headers['authorization']
    if(!token) return res.status(400).send({status:false,message:"Please give a Bearer Token"})

    if(token.startsWith("Bearer ")){
        token=token.substring(7, token.length);
    }

    jwt.verify(token,"ProductMnagementGroup24",(err,decode)=>{
        if(err){
            let msg=err.message==="jwt expired"? "Token is expired" : "Token is Invalid"
            return res.status(400).send({status:false, message:msg})
        }
        req.pass=decode

        next()
    })
}catch(error){
    return res.status(500).send({status:false,error:error.message})
}
}

const authorization=async function(req,res,next){
try{
    let userId=req.params.userId
    if(!userId) return res.send(400).send({status:false,message:"UserId is not present"})
    if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({status:false,message:"userId is not valid"})
    let userdetails=await userModel.findById({_id:userId})
    if(!userdetails) return res.status(404).send({status:false,message:"user not found"})

    if(userId !== req.pass.userId) return res.status(403).send({status:false,message:"User not authorised"})

    next()

}catch(error){
    return res.status(500).send({status:false,error:error.message})
}
}

module.exports={authentication,authorization}