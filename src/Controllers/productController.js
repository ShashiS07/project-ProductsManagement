const aws = require('../aws')
const mongoose = require('mongoose');
const productModel = require('../Model/productModel');
const ObjectId = require('mongoose').Types.ObjectId;


// ==============================create product============================================
const createproduct = async function (req, res){

    try {

        let product = req.body
        let { title, description, style, price, availableSizes,installments } = product;
        let files = req.files

        const productImage = await aws.uploadFile(files[0])

        let currencyId = "INR"
        let currencyFormat = "₹"
        let productCreated = { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes,installments }
        const productCreate = await productModel.create(productCreated);
        return res.status(201).send({ status: true, message: 'Success', data: productCreate });
    }
    catch (err) {
        res.status(500).send(err.message)
    }

}
// =============================get all product=============================================
const getproductbyquery=async function(req,res){
    try{
        let data=req.query

        let{size,name,priceGreaterThan,priceLessThan,priceSort}=data
        let filter={isDeleted:false}
        if(size){
            if(!['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'].includes(size)){
                return res.status(400).send({status:false,message:"Size is not valid"})
            }
            filter.availableSizes = { $all: size }
        }
        if(name){
            if(!/^[a-zA-Z0-9.,-_;: ]+$/.test(name)) return res.status(400).send({status:false,message:"Please provide valid name"})
            filter["title"] = { $regex: name }
        }
        if (priceLessThan) {
            if (!/^([0-9]{0,15}((.)[0-9]{0,2}))$/.test(priceLessThan)) {
                return res.status(400).send({ status: false, message: " please enter valid price " })
            }
            filter['price'] = { $lte: priceLessThan }
        }
        
        if (priceGreaterThan) {
            if (!/^([0-9]{0,15}((.)[0-9]{0,2}))$/.test(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: " please enter valid price " })
            }
            filter['price'] = { $gte: priceGreaterThan }
        }
        if (priceGreaterThan && priceLessThan) {
            filter['price'] = { $lt: priceLessThan, $gt: priceGreaterThan }
        }
       console.log(priceSort);
        if(priceSort){
        if(!priceSort==1 || !priceSort==-1){
            return res.status(400).send({status:false,message:"Please enter valid pricesort"})
        }
        }else{
            priceSort=1
        }
    
        let finalData = await productModel.find(filter).sort({ price: priceSort })
            if (finalData.length == 0) {
                return res.status(200).send({ status: false, message: "No product available" })
            }
            return res.status(200).send({ status: true, message: "Success", data: finalData })
    
    }catch(error){
        return res.send(500).send({status:false, erorr:message.error})
    }
    }

// =======================get product by Id================================================
const getproductById = async (req, res) => {
    try {
        let productid1 = req.params.productId
        if (!productid1)
            return res.status(400).send({ status: false, msg: "please give product id" })
        if (!mongoose.Types.ObjectId.isValid(productid1))
            return res.status(400).send({ status: false, msg: "please enter valid productid" })
  
        let product = await productModel.findById(productid1)
  
        if (!product || product.isDeleted == true)
            return res.status(404).send({ status: false, message: "No product Found" })
  
       
        return res.status(200).send({ status: true, message: "Success", data: product })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
  }

// =============================update product=====================================
const updateProductById = async (req, res) => {

    try {

        let paramsId = req.params.productId
        let checkId = ObjectId.isValid(paramsId);

        if (!checkId) {return res.status(400).send({ status: false, message: "Please Provide a valid productId in path params" })}

        let productFound = await productModel.findOne({ _id: paramsId, isDeleted: false })

        if (!productFound) {return res.status(404).send({ status: false, msg: "There is no product exist with this id" });}

        let updateBody =req.body
        let files = req.files
        let producturl
        if(files[0]) {producturl = await aws.uploadFile(files[0])}

        let updateProduct = await productModel.findOneAndUpdate({ _id: paramsId },{$set:updateBody},{ new: true })


        return res.status(200).send({ status: true, message: 'Success', data: updateProduct });

    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};
// =====================================delete product======================================
const deletedProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!mongoose.Types.ObjectId.isValid(productId))
            return res.status(400).send({ status: false, msg: "please enter valid productid" })
        const savedata = await productModel.findById(productId)
        if(!savedata) { return res.status(404).send({status:false, message: "product not found so can't delete anything" }) }
        
        if (savedata.isDeleted == true) {
            return res.status(200).send({ status: true, message: "product is already deleted" })
        }

    const deleteproduct = await productModel.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: Date.now() } });
       return res.status(200).send({ status: true, message: "product has been deleted successfully" })


    }catch(error){
        res.status(500).send({status: false, msg:error.message});

    }
}

// ======================================================================================

module.exports = {createproduct,updateProductById,getproductById,deletedProduct,getproductbyquery}
