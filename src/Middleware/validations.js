const emailValidator = require("email-validator");
const productModel = require("../Model/productModel");
const userModel = require('../Model/userModel');

let alphabets = /[A-Za-z]/;
let phoneNumber = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
const passwordFormat = /^[a-zA-Z0-9@]{8,15}$/
const addressformat=/^[a-zA-Z0-9@. ]*$/
const pincodeformat=/^[1-9]\d{5}$/
let numbers = /^[0-9.]+$/

const isValid = function (value) {
        if (typeof value === 'undefined' || value === null) return false
       if (typeof value === 'string' && value.length === 0) return false
       return true;}

// =============================validation for create User======================================
const createuser = async (req, res, next) => {
        let data = req.body
        let files = req.files
        let {fname,lname,email,phone,password,address} = data

//--------------------------------requirements---------------------------------------------------
if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "plz provide info for user" })
if(!fname){return res.status(400).send({status:false, message:"Please provide fname "})}
if(!lname ){return res.status(400).send({status:false, message:"Please provide lname "})}
if(!email ){return res.status(400).send({status:false, message:"Please provide email "})}
if(!phone ){return res.status(400).send({status:false, message:"Please provide phone "})}
if(!password ){return res.status(400).send({status:false, message:"Please provide password "})}
if(!files){return res.status(400).send({status:false, message:"please provide profileImage"})}
if(!address){return res.status(400).send({status:false, message:"please provide address"})}

// -----------------------------------------validation------------------------------------

if (!alphabets.test(fname)) return res.status(400).send({ status: false, msg: "Please Enter Valid Name" })
if (!phoneNumber.test(phone)) return res.status(400).send({ status: false, msg: "Please Enter Valid Phone Number" })
if (!emailValidator.validate(email)) return res.status(400).send({ status: false, msg: "Please Enter Valid email ID" })
const validPassword = passwordFormat.test(password)
if (!validPassword){return res.status(400).send({ status: false, msg: " Incorrect Password, It should be of 8-15 digits" });}

 //--------------------------------------For Dduplicacy----------------------------------------
        
 const chkPhone= await userModel.findOne({phone:phone})
 if (chkPhone)return res.status(400).send({ status: false, msg: "Phone already exists" });
 const chkemail= await userModel.findOne({email:email})
 if (chkemail)return res.status(400).send({ status: false, msg: "email already exists" });

// -------------------------------------for address---------------------------------------------
if(address){
    if(typeof (address) == 'string') {address = JSON.parse(address)}
    if(address.shipping){
        if(address.shipping.street){
            if(!addressformat.test(address.shipping.street)) return res.status(400).send({status:false, message:"Please provide street in correct format"})
        }else{
        return res.status(400).send({status:false,message:"Please Provide Street"})
        }
        if(address.shipping.city){
            if(!alphabets.test(address.shipping.city)) return res.status(400).send({status:false, message:"Please provide city in correct format"})
        }else{
        return res.status(400).send({status:false,message:"Please Provide city"})
        }
        if(address.shipping.pincode){
            if(!pincodeformat.test(address.shipping.pincode)) return res.status(400).send({status:false, message:"Please provide pincode in correct format"})
        }else{
        return res.status(400).send({status:false,message:"Please Provide pincode"})
        }
    }else{
        return res.status(400).send({status:false,message:"Please provide Shipping Address"})
    }
    if(address.billing){
        if(address.billing.street){
            if(!addressformat.test(address.billing.street)) return res.status(400).send({status:false, message:"Please provide street in correct format"})
        }else{
        return res.status(400).send({status:false,message:"Please Provide Street"})
        }
        if(address.billing.city){
            if(!alphabets.test(address.billing.city)) return res.status(400).send({status:false, message:"Please provide city in correct format"})
        }else{
        return res.status(400).send({status:false,message:"Please Provide city"})
        }
        if(address.billing.pincode){
            if(!pincodeformat.test(address.billing.pincode)) return res.status(400).send({status:false, message:"Please provide pincode in correct format"})
        }else{
        return res.status(400).send({status:false,message:"Please Provide pincode"})
        }
    }else{
        return res.status(400).send({status:false,message:"Please provide billing Address"})
    }
}

next()

}
// ==================================validation for updateuser===================================
const updateUser=async function(req,res,next){
try{
    let data=req.body
    console.log(data)
    let {fname,lname,email,phone,password,address} = data
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "plz provide info for user to update"})
    if(fname){
        if (!alphabets.test(fname)) return res.status(400).send({ status: false, msg: "Please Enter Valid First Name" })
    }
    if(lname){
        if (!alphabets.test(lname)) return res.status(400).send({ status: false, msg: "Please Enter Valid Last Name" })
    }
    if(email){
        if (!emailValidator.validate(email)){ return res.status(400).send({ status: false, msg: "Please Enter Valid email ID" })
        }else{
        const chkemail= await userModel.findOne({email:email})
        if (chkemail)return res.status(400).send({ status: false, msg: "email already exists" });
        }
    }
    if(phone){
        if (!phoneNumber.test(phone)){ return res.status(400).send({ status: false, msg: "Please Enter Valid Phone Number" })
        }else{
        const chkPhone= await userModel.findOne({phone:phone})
        if (chkPhone)return res.status(400).send({ status: false, msg: "Phone already exists" });
        }
    }
    if(password){
        if(!passwordFormat.test(password)){
            return res.status(400).send({status:false, message:"Please Insert Correct Password"})
        }
    }
    if(address){
    //    if(typeof (address) == 'string') {address = JSON.parse(address)}
        if(address.shipping){
            if(address.shipping.street){
                if(!addressformat.test(address.shipping.street)) return res.status(400).send({status:false, message:"Please provide street in correct format"})
            }
            if(address.shipping.city){
                if(!alphabets.test(address.shipping.city)) return res.status(400).send({status:false, message:"Please provide city in correct format"})
            }
            if(address.shipping.pincode){
                if(!pincodeformat.test(address.shipping.pincode)) return res.status(400).send({status:false, message:"Please provide pincode in correct format"})
            }
        }
        if(address.billing){
            if(address.billing.street){
                if(!addressformat.test(address.billing.street)) return res.status(400).send({status:false, message:"Please provide street in correct format"})
            }
            if(address.billing.city){
                if(!alphabets.test(address.billing.city)) return res.status(400).send({status:false, message:"Please provide city in correct format"})
            }
            if(address.billing.pincode){
                if(!pincodeformat.test(address.billing.pincode)) return res.status(400).send({status:false, message:"Please provide pincode in correct format"})
            }
        }
    }
    next()

}catch(error){
    return res.status(500).send({status:false,error:error.message})
}
}

const Createproduct = async (req, res, next) => {

        let data = req.body
        let files = req.files
        let { title, description, style, price, availableSizes,installments } = data;
        if(!files[0]) {return res.status(400).send({status:false,msg:"Please provide product image file"})}

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "plz provide info for product" })
        if(!title){return res.status(400).send({status:false, message:"Please provide title"})}
        if(!description ){return res.status(400).send({status:false, message:"Please provide description"})}
        if(!price ){return res.status(400).send({status:false, message:"Please provide price"})}
        if(!availableSizes){return res.status(400).send({status:false, message:"plz provide size"})}


        if (!alphabets.test(title)) return res.status(400).send({ status: false, msg: "Please Enter Valid title" })
        if (!isValid(description)) return res.status(400).send({ status: false, msg: "Please Enter Valid description" })
        if (!isValid(style)) return res.status(400).send({ status: false, msg: "Please Enter Valid style" })
        if (!numbers.test(installments)) return res.status(400).send({ status: false, msg: "Please Enter Valid installment" })
        if (!numbers.test(price)) return res.status(400).send({ status: false, msg: "Please Enter Valid price" })
        if (availableSizes != "S" && availableSizes != "XS" && availableSizes != "M" && availableSizes != "X" && availableSizes != "L" && availableSizes != "XXL" && availableSizes != "XXL" && availableSizes != "XL")
        {return res.status(400).send({ msg: "Please provide valid size" });}

        const checktitle= await productModel.findOne({title,isDeleted: false })
        if (checktitle)return res.status(400).send({ status: false, msg: "title already exists" });

        next()
}

module.exports={createuser,updateUser,createuser,Createproduct}

