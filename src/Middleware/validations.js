const emailValidator = require("email-validator");
const userModel = require('../Model/userModel');
// const ObjectId = require('mongoose').Types.ObjectId;

let alphabets = new RegExp(/^[a-zA-Z]+([\s][a-zA-Z]+)*$/);
let phoneNumber = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
const passwordFormat = /^[a-zA-Z0-9@]{8,15}$/


const global_validations =async(req,res,next)=>{


}



const createuser = async (req, res, next) => {
        let data = req.body
        let files = req.files
        let {fname,lname,email,phone,password,address} = data

if(typeof (address) == 'string') {address = JSON.parse(address)}

//--------------------------------requirements---------------------------------------------------
if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "plz provide info for user" })
if(!fname){return res.status(400).send({status:false, message:"Please provide title "})}
if(!lname ){return res.status(400).send({status:false, message:"Please provide name "})}
if(!phone ){return res.status(400).send({status:false, message:"Please provide phone "})}
if(!password ){return res.status(400).send({status:false, message:"Please provide password "})}
if(!files){return res.status(400).send({status:false, message:"plz provide profileImage"})}
if(!address){return res.status(400).send({status:false, message:"plz provide address"})}

//----------------------------------validation---------------------------------------------------------

if (!alphabets.test(fname)) return res.status(400).send({ status: false, msg: "Please Enter Valid Name" })
if (!phoneNumber.test(phone)) return res.status(400).send({ status: false, msg: "Please Enter Valid Phone Number" })
if (!emailValidator.validate(email)) return res.status(400).send({ status: false, msg: "Please Enter Valid email ID" })
const validPassword = passwordFormat.test(password)
if (!validPassword){return res.status(400).send({ status: false, msg: " Incorrect Password, It should be of 6-10 digits with atlest one special character, alphabet and number" });}

 //----------------------------For Dduplicacy ----------------------------------------------------------------
        
 const chkPhone= await userModel.findOne({phone:phone,isDeleted: false })
 if (chkPhone)return res.status(400).send({ status: false, msg: "Phone already exists" });
 const chkemail= await userModel.findOne({email:email})
 if (chkemail)return res.status(400).send({ status: false, msg: "email already exists" });

next()

}


const login = async function (req, res,next){

    // const data= req.body
    // if(!Object.keys(data).count==0||1){res.status(400).send({status:false,message:"plese provide email and password(they are manadatory)"})}
    // let{email,password}=data
    // const userData= await userModel.findOne({email:email,password:password,isDeleted:false})
    // if(!userData){res.status(404).send({status:false,message:"please provide valid email and password"})}

    // next()
}

const getUser =  async function(req,res,next){



}

const update =  async function(req,res,next){



}



module.exports={createuser,login}

