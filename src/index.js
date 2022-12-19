const express = require("express");
const route = require("./routes/routes.js")
const mongoose = require("mongoose")
const app = express()

mongoose.set('strictQuery', true)
app.use(express.json())


mongoose.connect("mongodb+srv://Shashi_Shekhar_Singh:Shashi0708@myproject.mb3u3za.mongodb.net/Group24-DB?authSource=admin&replicaSet=atlas-lhj98j-shard-0&readPreference=primary&ssl=true",
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