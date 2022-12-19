const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const aws = require('../aws')
const mongoose = require('mongoose')
const isValid = mongoose.Types.ObjectId.isValid
const emailValidator = require('email-validator')
let regexValidation = new RegExp(/^[a-zA-Z]+([\s][a-zA-Z]+)*$/);
let regexValidNumber = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
const passwordFormat = /^[a-zA-Z0-9@]{8,15}$/


const createUser = async function (req, res){

    try {
        let data = req.body
        console.log(data);
        let files = req.files

        const {fname,lname,email,phone,password,address,profileImage} = data

        //--------------------------------requirements---------------------------------------------------
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "plz provide info for user" })
        if(!fname){return res.status(400).send({status:false, message:"Please provide title "})}
        if(!lname ){return res.status(400).send({status:false, message:"Please provide name "})}
        if(!phone ){return res.status(400).send({status:false, message:"Please provide phone "})}
        if(!password ){return res.status(400).send({status:false, message:"Please provide password "})}
        if(!profileImage){return res.status(400).send({status:false, message:"plz provide profileImage"})}
        if(!address){return res.status(400).send({status:false, message:"plz provide address"})}
        if(!files[0]) {return res.status(400).send({ status: false, msg: "please provide image file" });}

        //----------------------------------validation---------------------------------------------------------
        if (!regexValidation.test(fname)) return res.status(400).send({ status: false, msg: "Please Enter Valid Name" })
       if (!regexValidNumber.test(phone)) return res.status(400).send({ status: false, msg: "Please Enter Valid Phone Number" })
        if (!emailValidator.validate(email)) return res.status(400).send({ status: false, msg: "Please Enter Valid email ID" })
        const validPassword = passwordFormat.test(password)
        if (!validPassword){return res.status(400).send({ status: false, msg: " Incorrect Password, It should be of 6-10 digits with atlest one special character, alphabet and number" });}
    
        //----------------------------For Dduplicacy ----------------------------------------------------------------
        
        const chkPhone= await userModel.findOne({phone:phone,isDeleted: false })
        if (chkPhone)return res.status(400).send({ status: false, msg: "Phone already exists" });
        const chkemail= await userModel.findOne({email:email})
        if (chkemail)return res.status(400).send({ status: false, msg: "email already exists" });
    
        //-------------------------------logic----------------------------------------------------------------------
        const profileImageurl = await aws.uploadFile(files[0])
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        const data_to_create = {fname,lname,email,profileImageurl,phone,password,address}

        const user = await userModel.create(data_to_create);
        return res.status(201).send({ status: true,msg:"Succes", data: user})


     } catch (error) {res.status(500).send({ status: false, msg: error.message })}
    }



// ========================get api=======================================
const getUser=async function(req,res){
  try{
    let userId=req.params.userId
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
module.exports={createUser,getUser}