const userModel = require('../Model/userModel')
const bcrypt = require('bcrypt')
const auth= require('../Middleware/auth')
const validator= require("../Middleware/validations")
const jwt= require("jsonwebtoken")
const aws = require('../aws')
const mongoose = require('mongoose')
const isValid = mongoose.Types.ObjectId.isValid


const createUser = async function (req, res){
   try {
        let data = req.body
        let files = req.files
        let {fname,lname,email,phone,password,address} = data
        if(typeof (address) == 'string') {address = JSON.parse(address)}
    
        let profileImage = await aws.uploadFile(files[0])
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const data_to_create = {fname,lname,email,profileImage,phone,password,address}

        const user = await userModel.create(data_to_create);
        return res.status(201).send({ status: true,message:"Success", data: user})

    } catch (error) {res.status(500).send({ status: false, message: error.message })}
    }

// ========================================login===============================================

const login= async function(req,res){
  try {
          const data= req.body
          if(!Object.keys(data).length){
            return res.status(400).send({status:false,message:"plese provide email and password(they are manadatory)"})}
          
          let{email,password}=data
          if(!email) return res.status(400).send({status:false,message:"Email is required"})
          if(!password) return res.status(400).send({status:false,message:"password is required"})
  
          const userData= await userModel.findOne({email})
          if(!userData){
             return res.status(404).send({status:false,message:"Please provide valid email"})
          }else{
            let validPassword= await bcrypt.compare(password,userData.password)
            if(!validPassword) return res.status(400).send({status:false,message:"Invalid Password"}) 
          }
          const token= jwt.sign({userId:userData._id},"ProductMnagementGroup24",{expiresIn: '12hr'})
          
          const tokenData={
              userId:userData._id,
              token:token
          }
          return res.status(200).send({status:true,message: "User login successfull",data:tokenData})
             
          } catch (err) {
            return res.status(500).send({status:false,message:err.message})  
          }
          
  }

// ========================get api=======================================
const getUser=async function(req,res){
  try{
    let userId=req.params.userId
    console.log(userId);
    if(!userId) return res.status(400).send({status:false, message:"Please Provide UserID"})
  
    if(!isValid(userId)) return res.status({status:false, message:"Please Provide valid UserID"})
  
    if(userId!==req.pass.userId) return res.status(401).send({status:false,message:"Authentication Failed"})
   
    let userexist=await userModel.findOne({_id:userId})
    if(!userexist) return res.status(404).send({status:false, message:"User not found"})
  
    const data={
      address:userexist.address,
      _id:userexist.id,
      fname:userexist.fname,
      lname:userexist.lname,
      email:userexist.email,
      profileImage:userexist.profileImage,
      phone:userexist.phone,
      password:userexist.password,
      createdAt:userexist.createdAt,
      updatedAt:userexist.updatedAt,
      __v:userexist.__v
    }
  
    return res.status(200).send({status:true,message:"User profile details",data:data})
  
  }catch(error){
    return res.status(500).send({status:false,error:error.message})
  }
  }

//==================================update user=================================================

const update=async function(req,res){
try{
    let userId=req.params.userId
    let data=req.body
    let files=req.files
    let {fname,lname,email,phone,password,address,profileImage} = data
    
    if(typeof (address) == 'string') {address = JSON.parse(address)}

    if(password){
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }
    if(files && files.length > 0){
      let profileImage = await aws.uploadFile(files[0])
      data.profileImage=profileImage
    }
    console.log(data)
    let updateuser=await userModel.findOneAndUpdate({_id:userId},{$set:{data}},{new:true})
    return res.status(200).send({status:false, message:"Updated Successfully",data:updateuser})
}catch(error){
  return res.status(500).send({status:false,error:error.message})
}

}
    
     
module.exports={createUser,getUser,update,login}