const aws = require('../aws')
const mongoose = require('mongoose');
const productModel = require('../Model/productModel');



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

const getProducts = async function (req, res) {
    try {
      const data = req.query
      if (Object.keys(data).length == 0) { res.status(400).send({ status: false, message: "please provide request data" }) }
      let { size, name, priceLessThan } = data
  
      if (!size) return res.status(400).send({ status: false, message: "size is required" })
      if (!name) return res.status(400).send({ status: false, message: "Product name is required" })
      if (!priceLessThan) return res.status(400).send({ status: false, message: "please provide price range" })
  
      const productData = await productModel.find({ $and: [{ size }, { name }, { priceLessThan }, { isDeleted: false }] }).sort({ priceSort: 1 })
      if (!productData) { res.status(404).send({ status: false, message: "no data found" }) }
  
      res.ststus(200).send({ status: true, message: "Success", data: productData })
  
    } catch (err) {
      res.ststus(500).send({ status: false, message: err.message })
    }
  }


const getproductById = async (req, res) => {
    try {
        let productid1 = req.params.bookId
        if (!productid1)
            return res.status(400).send({ status: false, msg: "please give product id" })
        if (!mongoose.Types.ObjectId.isValid(prductid1))
            return res.status(400).send({ status: false, msg: "please enter valid productid" })
  
        let product = await productModel.findById(productid1)
  
        if (!product || product.isDeleted == true)
            return res.status(404).send({ status: false, message: "No product Found" })
  
       
        return res.status(200).send({ status: true, message: "product list", data: product })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
  }


const updateProductById = async (req, res) => {

    try {

        let paramsId = req.params.productId
        let checkId = ObjectId.isValid(paramsId);

        if (!checkId) {return res.status(400).send({ status: false, message: "Please Provide a valid productId in path params" })}

        let productFound = await productModel.findOne({ _id: paramsId, isDeleted: false })

        if (!productFound) {return res.status(404).send({ status: false, msg: "There is no product exist with this id" });}

        let updateBody = JSON.parse(req.body.data)
        let files = req.files
        let producturl
        if(files[0]) {producturl = await aws.uploadFile(files[0])}

        let { title, description, price, style, availableSizes, installments } = updateBody

        let updateProduct = await productModel.findOneAndUpdate({ _id: paramsId }, { title: title, description: description, price: price, productImage: producturl, style: style, availableSizes: availableSizes, installments: installments }, { new: true })

        return res.status(200).send({ status: true, message: 'product updated successfully', data: updateProduct });

    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

module.exports = {createproduct,getProducts,updateProductById,getproductById}