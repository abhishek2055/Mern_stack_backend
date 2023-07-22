const express = require('express')
const router = express.Router()
const {
    getProducts
    , adminCreateProducts
    , adminDeleteProducts
    , getProductsById
    , getBestsellers
    , adminGetProducts
    , adminUpdateProducts
    , adminUpload
    , adminDeleteProductImage
} = require("../controllers/productController")

router.get("/category/:categoryName/search/:searchQuery", getProducts)
router.get("/category/:categoryName", getProducts)
router.get("/search/:searchQuery", getProducts)
router.get("/", getProducts)
router.get("/bestsellers", getBestsellers)
router.get("/get-one/:id", getProductsById)

//admin routes
router.get("/admin", adminGetProducts)
router.delete("/admin/:id", adminDeleteProducts)
router.post("/admin", adminCreateProducts);
router.put("/admin/:id",adminUpdateProducts);
router.post("/admin/upload",adminUpload);
router.delete("/admin/image/:imagePath/:productId")

module.exports = router

