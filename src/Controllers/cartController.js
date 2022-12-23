const cartModel=require("../Model/cartModel")
const productModel=require("../Model/productModel")
const {isValid}=require("../Middleware/validations")
const mongoose=require("mongoose")

const createCart=async function(req,res){
try{
    let userId = req.params.userId
    let data=req.body
    if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"Please prodive some data"})

    let {productId,cartId}=data

    if(!isValid(productId)) return res.status(400).send({status:false,message:"Product Id is required"})
        
    if(!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({status:false,message:"Product Id is not valid"})
        
    if(cartId){
        if(!isValid(cartId)){
            return res.status(400).send({status:false,message:"cartId is required"})
        }
        if(!mongoose.Types.ObjectId.isValid(cartId)){
            return res.status(400).send({status:false,message:"cartId is not valid"})
        }
    }
    let checkProduct=await productModel.findOne({_id:productId,isDeleted:false})
    if(!checkProduct) return res.status(404).send({status:false, message:"Product is not exist"})

    let cartexist=await cartModel.findOne({ userId: userId })
    if(!cartexist){
            const cartObject={
            userId:userId,
            items: [{productId: productId, quantity: 1 }],
            totalPrice:checkProduct.price,
            totalItems:1
        }
        const createcart=await cartModel.create(cartObject)
        return res.status(201).send({status:true,message:"Success",data:createcart})
    }
    if(cartexist){
        if(cartId==undefined) return res.status(400).send({status:false,message:"Cart is already created. Use different UserId"})
        if(cartexist._id.toString()!==cartId) return res.status(404).send({status:false, message:"Cart Not found please enter valid Cart Id"})
    }
// update same product
    let arr=cartexist.items
    for(let i=0;i<arr.length;i++){
        if(arr[i].productId==productId){
            arr[i].quantity+= 1
            const updatecart=await cartModel.findOneAndUpdate(
                {userId},
                {
                    items:arr,
                    totalPrice: cartexist.totalPrice + checkProduct.price
                },{new:true})
            return res.status(201).send({status:true,message:"Success",data:updatecart})
        }
    }
    // add new product
    const cartObject={
        $addToSet:{items:{productId:productId, quantity:1}},
        totalPrice: cartexist.totalPrice + checkProduct.price,
        totalItems: cartexist.totalItems+1
    }
    const cartupdate=await cartModel.findOneAndUpdate({userId},cartObject,{new:true})
    return res.status(201).send({status:true,message:"Success",data:cartupdate})

}catch(error){
    return res.status(500).send({status:false,error:error.message})
}
}


module.exports={createCart}