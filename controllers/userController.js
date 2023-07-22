const User = require("../models/UserModel")

const getUser = (req,res)=>{
    res.send("handling a user routes")
}
module.exports = getUser