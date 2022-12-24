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
    console.log(cartId);

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

const updatecart = async (req, res) => {
try{
    let userId = req.params.userId
    let {cartId,productId,removeProduct} = req.body
    console.log(productId);

    if (!mongoose.Types.ObjectId.isValid(cartId)) {return res.status(400).send({ status: false, message: "Please Provide a valid cartid" })}
    if (!mongoose.Types.ObjectId.isValid(productId)) {return res.status(400).send({ status: false, message: "Please Provide a valid productId" })}

    const cart = await cartModel.findOne({_id:cartId})

    const product = await productModel.findById(productId)
  
    if (!cart){return res.status(404).send({ status: false, msg: "There is no cart exist with this id" });}
    if (!product){return res.status(404).send({ status: false, msg: "There is no product exist with this id" });}

    if (userId != cart.userId.toString()) { return res.status(400).send({ status: false, message: "you are not owner this cart" })}

    for (let i = 0; i < cart.items.length; i++) {   
        if (productId == cart.items[i].productId) {  

            if (removeProduct == 1) {

                let product = await productModel.findOne({ _id: productId, isDeleted: false })
                if (!product) { return res.status(400).send({ status: false, message: "This product does not exist 1" })}

                cart.totalPrice = Number(cart.totalPrice) - Number(product.price)
                cart.items[i].quantity -= 1

                if (cart.items[i].quantity == 0) {
                    cart.items.splice(i, 1)
                    cart.totalItems -= 1
                }
                cart.save();
                return res.status(200).send({ status: true, message: "Success", data: cart })

            } 
            if (removeProduct == 0){ 

                let product = await productModel.findOne({ _id: productId, isDeleted: false });

                if (!product) {return res.status(400).send({ status: false, message: "This product does not exist" })}

                cart.totalPrice = Number(cart.totalPrice) - Number(cart.items[i].quantity) * Number(product.price)
                cart.items.splice(i, 1)
                cart.totalItems -= 1
                cart.save();

                if (cart.items.length == 0) {
                    cart.totalPrice = 0
                    cart.save();
                }
                return res.status(200).send({ status: true, message: "Success", data: cart })

            }
        }
    }   
    return res.status(400).send({ status: false, message: "This product does not exist" })

}catch(error){
    return res.status(500).send({status:false,error:error.message})
}
}

const getCart= async function(req,res){
    try {     
 
    const userId= req.params.userId
    let validCart = await cartModel.findOne({ userId: userId })
    if (!validCart) return res.status(404).send({ status: false, message: "No cart found" })
        if(validCart.totalItems==0 || validCart.totalPrice==0 || validCart.items==[]){
            return res.status(400).send({status:false,message:"Cart is Empty"})
        }else{
        return res.status(200).send({ status: true, message: 'Success', data: validCart })
        }
    } catch (error) {
          res.status(500).send({ status: false, msg: error.message });   
    }
}


const deleteCart= async function(req,res){
    try {
    
    const userId= req.params.userId
    
    const cartData= await cartModel.findOne({userId:userId}) 
    if(!cartData){return res.status(404).send({status:false,message:"cart does not exist"})}
    if(cartData.totalItems==0 && cartData.totalPrice==0){return res.status(200).send({status:true,message:"Cart is already deleted"})}
 
    const cartId=cartData._id
    const deleteCartData= await cartModel.findOneAndUpdate({_id:cartId},{$set:{totalItems:0,totalPrice:0}})
    return res.status(204).send({status:true,message:"Deleted Successfully"})
        
    } catch (error) {
          res.status(500).send({ status: false, msg: error.message });   
    }
}


module.exports={createCart,updatecart,getCart,deleteCart}