const orderModel=require("../Model/OrderModel")
const userModel=require("../Model/userModel")
const cartModel=require("../Model/cartModel")
const validator=require("../Middleware/validations")
const mongoose=require('mongoose')

const createOrder=async function(req,res){
try{
    let userId=req.params.userId
    let data=req.body
    if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"Please provide data"})
    let {cartId,status,cancellable}=data
    if(status){
        if(!validator.isValidStatus(status)){
            return res.status(400).send({status:false,message:"Status should be (pending/completed/cancelled)"})
        }
    }
    if(cancellable){
        if(cancellable !== Boolean) return res.status(400).send({status:false,message:"Please give only boolean value"})
    }
    if(!validator.isValid(cartId)) return res.status(400).send({status:false,message:"CartId is required"})
    if(!mongoose.Types.ObjectId.isValid(cartId)) return res.status(400).send({status:false,message:"CartId is not valid"})

    let checkCart=await cartModel.findOne({_id:cartId,userId:userId})
    if(!checkCart) return res.status(404).send({status:false,message:"CartId is not found"})

    let arr=checkCart.items
    if(arr.length==0) return res.status(400).send({status:false,message:"Cart is empty"})

    let totalQuantity=0;
    for(let i of arr){
        totalQuantity=totalQuantity+i.quantity
    }
    let order={
        userId:userId,
        items:arr,
        totalPrice:checkCart.totalPrice,
        totalItems:checkCart.totalItems,
        totalQuantity:totalQuantity,
        cancellable:cancellable,
        status:status
    }
    const orderCreate=await orderModel.create(order)

    await cartModel.updateOne({_id:checkCart.id},{items:[], totalPrice:0, totalItems:0})
    return res.status(201).send({status:true,message:"Success",data:orderCreate})

}catch(error){
    return res.status(500).send({status:false,error:error.message})
}
}

const updateOrder=async function (req,res){
try{
    let userId=req.params.userId
    let data=req.body

    if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"Please Provide data"})

    let {orderId,status}=data

    if(!validator.isValid(status)) return res.status(400).send({status:false,message:"status is required"})
    if(!validator.isValidStatus(status)) return res.status(400).send({status:false,message:"Status must be (pending/completed/cancelled)"})

    if(!orderId) return res.status(400).send({status:false,message:"OrderId is required"})
    if(!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).send({status:false,message:"OrderId is not valid"})

    let checkCart=await cartModel.findOne({userId})
    if(!checkCart) return res.status(404).send({status:false,message:"Cart not found"})

    let checkOrder=await orderModel.findOne({_id:orderId, userId:userId, isDeleted:false})
    if(!checkOrder) return res.status(404).send({status:false, message:"Order not found"})
    if(checkOrder.cancellable==false) return res.status(400).send({status:false,message:"This order cannot be cancelled"})

    let updateOrder= await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})

    return res.status(200).send({status:true,message:"Success",data:updateOrder})

}catch(error){
    return res.status(500).send({status:false,error:error.message})
}    
}
module.exports={createOrder,updateOrder}