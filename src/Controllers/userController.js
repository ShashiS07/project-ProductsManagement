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
        let files = req.files

        let {fname,lname,email,phone,password,address} = data

        if(typeof (address) == 'string') {address = JSON.parse(address)}
      
        // const jaddress = JSON.parse(address)
        
        //--------------------------------requirements---------------------------------------------------
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "plz provide info for user" })
        if(!fname){return res.status(400).send({status:false, message:"Please provide title "})}
        if(!lname ){return res.status(400).send({status:false, message:"Please provide name "})}
        if(!phone ){return res.status(400).send({status:false, message:"Please provide phone "})}
        if(!password ){return res.status(400).send({status:false, message:"Please provide password "})}
        if(!files){return res.status(400).send({status:false, message:"plz provide profileImage"})}
        if(!address){return res.status(400).send({status:false, message:"plz provide address"})}

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
        let profileImageurl = await aws.uploadFile(files[0])
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        console.log(password);
        const data_to_create = {fname,lname,email,profileImageurl,phone,password,address}
        

        const user = await userModel.create(data_to_create);
        return res.status(201).send({ status: true,msg:"Succes", data: user})

    } catch (error) {res.status(500).send({ status: false, msg: error.message })}
    }


const login= async function(req,res){

        try {
        
        const data= rq.body
        if(!Object.keys(data).count==0||1){res.status(400).send({status:false,message:"plese provide email and password(they are manadatory)"})}
        
        let{email,password}=data
        
        const userData= await userModel.findOne({email:email,password:password,isDeleted:false})
        if(!userData){
            res.status(404).send({status:false,message:"please provide valid email and password"})
        }
        const token= jwt.sign({userId:userData._id},"ProductMnagementGroup24",{expiresIn: '12hr'})
        
        const tokenData={
            userId:userData._id,
            token:token
        }
        res.status(200).send({status:true,message: "User login successfull",data:tokenData})
           
        } catch (err) {
          res.status(500).send({status:false,message:err.message})  
        }
        
}
        

// ========================get api=======================================
const getUser=async function(req,res){
  try{
    let userId=req.params.userId
    console.log(userId);
    if(!userId) return res.status(400).send({status:false, message:"Please Provide UserID"})
  
    if(!isValid(userId)) return res.status({status:false, message:"Please Provide valid UserID"})
  
    //if(userId!==req.pass.userId) return res.status(401).send({status:false,message:"Authentication Failed"})
   
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

//put api


const update=async function(req,res){
    try {
        let data = req.params.userId
        let update = req.body
    
        let { fname, lname,password ,phone,email } = update
      
        if (Object.keys(update).length == 0) { return res.status(400).send({ status: false, msg: "incomplete request data provide more data" }) }
    
        if (fname || lname || password || email) {
          if (typeof (fname || lname || password || email) !== "string") {
            return res.status(400).send({ status: false, msg: "be in string only" })
          }
        }
        // if (tags || subcategory) {
        //   if (typeof (tags || subcategory) !== "object") {
        //     return res.status(400).send({ status: false, msg: "tags/subcategory should be in array of string only" })
        //   }
        // }
        let checkisDleted = await --yModel.findOne({ _id: data, isDeleted: true })
        
        if (checkisDleted) return res.status(404).send({ status: false, msg: "no users found" })
    
    
        let users = await --Model.findOneAndUpdate({ _id: data },
          {
            fname: fname, lname: lname, password: password, email:email
            ,// $push: { tags: tags, subcategory: subcategory }
          }, { new: true })
        return res.status(200).send({ status: true, message:"successful" ,data:users })
    } catch (err) { res.status(500).send({ status: false, msg: err.message }) }
}
    
     
module.exports={createUser,getUser,update,login}