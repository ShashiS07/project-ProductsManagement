const express = require("express");
const route = require("./routes/routes.js")
const mongoose = require("mongoose")
const app = express()

mongoose.set('strictQuery', true)
app.use(express.json())


mongoose.connect("mongodb+srv://Vinay1997:Z4AKcP40EXSsGdcj@vinay.0stv4ut.mongodb.net/group12DB?retryWrites=true&w=majority",
{useNewUrlParser:true})

.then(()=> console.log("MongoDb is connected"))
.catch (err => console.log(err))

app.use('/',route);

app.use(function (req, res) {
    var err = new Error("Not Found.")
    err.status = 404
    return res.status(404).send({ status: "404", msg: "Invalid http request" })
  })

app.listen(process.env.PORT || 3000 ,function() {
    console.log("Express app running on port" + (process.env.PORT || 3000))
});