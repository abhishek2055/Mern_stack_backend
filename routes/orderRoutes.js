const express = require("express");

const router = express.Router()

const getOrder = require("../controllers/orderController")

router.get("/",getOrder)

module.exports = router;