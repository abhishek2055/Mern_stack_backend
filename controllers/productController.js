const Product = require("../models/ProductModel");
const recordsPerPage = require("../config/pagination");
const imageValidate = require("../utils/imageValidate");
const { log } = require("console");


const getProducts = async (req, res, next) => {
    try {
        let query = {};
        let queryCondition = false;

        let priceQueryCondition = {};
        if (req.query.price) {
            queryCondition = true;
            priceQueryCondition = { price: { $lte: Number(req.query.price) } };
        }

        let ratingQueryCondition = {};
        if (req.query.rating) {
            queryCondition = true;
            ratingQueryCondition = { rating: { $in: req.query.rating.split(",") } };
        }
        let categoryQueryCondition = {};
        const categoryName = req.params.categoryName || "";
        if (categoryName) {
            queryCondition = true;
            let a = categoryName.replaceAll(",", "/");
            var regEx = new RegExp("^" + a);
            categoryQueryCondition = { category: regEx };
        }
        if (req.query.category) {
            queryCondition = true;
            let a = req.query.category.split(",").map((item) => {
                if (item) return new RegExp("^" + item);
            });
            categoryQueryCondition = {
                category: { $in: a },
            };
        }
        let attrsQueryCondition = [];
        if (req.query.attrs) {
            // attrs=RAM-1TB-2TB-4TB,color-blue-red
            // [ 'RAM-1TB-4TB', 'color-blue', '' ]
            attrsQueryCondition = req.query.attrs.split(",").reduce((acc, item) => {
                if (item) {
                    let a = item.split("-");
                    let values = [...a];
                    values.shift(); // removes first item
                    let a1 = {
                        attrs: { $elemMatch: { key: a[0], value: { $in: values } } },
                    };
                    acc.push(a1);
                    // console.dir(acc, { depth: null })
                    return acc;
                } else return acc;
            }, []);
            //   console.dir(attrsQueryCondition, { depth: null });
            queryCondition = true;
        }

        //pagination
        const pageNum = Number(req.query.pageNum) || 1;

        // sort by name, price etc.
        let sort = {};
        const sortOption = req.query.sort || "";
        if (sortOption) {
            let sortOpt = sortOption.split("_");
            sort = { [sortOpt[0]]: Number(sortOpt[1]) };
        }
    


        const searchQuery = req.params.searchQuery || ""
        let searchQueryCondition = {}
        let select = {}
        if (searchQuery) {
            queryCondition = true
            searchQueryCondition = { $text: { $search: searchQuery } }
            select = {
                score: { $meta: "textScore" }
            }
            sort = { score: { $meta: "textScore" } }
        }



        if (queryCondition) {
            query = {
                $and: [
                    priceQueryCondition,
                    ratingQueryCondition,
                    categoryQueryCondition,
                    searchQueryCondition,
                    ...attrsQueryCondition
                ],
            };
        }

        const totalProducts = await Product.countDocuments(query);

        // aab database bata product haru chaiyeanusar kasari fetch garni 

        const products = await Product.find(query)
            .select(select)
            .skip(recordsPerPage * (pageNum - 1))
            .sort(sort)
            .limit(recordsPerPage);

        res.json({
            products,
            pageNum,
            paginationLinksNumber: Math.ceil(totalProducts / recordsPerPage),
        });
    } catch (error) {
        next(error);
    }
};


const getProductsById = async (req,res,next)=>{
    try{

        const product = await Product.findById(req.params.id).populate("reviews").orFail()
        res.json(product)

    } catch(err){
        next(err)
    }
}

const  getBestsellers = async (req,res,next)=>{
    try{

        const products = await Product.aggregate([
            {$sort: { category: 1, sales: -1 }},
            {$group: {_id: "$category" , doc_with_max_sales: {$first: "$$ROOT" } }},
            {$replaceWith: "$doc_with_max_sales"},
            {$match: { sales:{$gt: 0}}},
            { $project: {_id: 1,name: 1,images: 1,category: 1,description: 1} },
            
            {$limit: 3}
        ])
        res.json(products)

    }catch(err){
        next(err);
    }
}

const adminGetProducts = async (req,res,next)=>{
    try{

        const products = await Product.find({})
        .sort({category: 1})
        .select('name price category')

        return res.json(products)

    } catch(err){
        next(err);
    }
}

const adminDeleteProducts = async(req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id).orFail()
        await product.remove();
        res.json({ message: "products removed" })
    }
    catch(err){
        next(err);
    }
}

const adminCreateProducts = async (req,res,next)=>{
    try{
        const product = new Product();
        const {name,description,count,price,category,attributesTable} = req.body;
        product.name = name;
        product.description = description;
        product.count = count;
        product.price = price;
        product.category = category;
        if(attributesTable.length > 0){
            attributesTable.map((items)=>{
                product.attrs.push(items);
            })
        }
        await product.save();
        res.json({
            message: "product creates",
            productId: product._id,
        })

    
    }
    catch(err){
        next(err);
    }
}

const adminUpdateProducts = async(req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id).orFail()
        const {name,description,price,count,category,attributesTable} = req.body;
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.count = count || product.count;
        product.category = category || product.category;

        if(attributesTable.length > 0){
            product.attrs = [];
            attributesTable.map((item)=>{
                product.attrs.push(item);
            })
        }
        else{
            product.attrs = []
        }

        await product.save()

        res.json({
            message: "producted updated"
        })


    }
    catch(err){
        next(err)
    }
}

const adminUpload = async (req,res,next)=>{
    try{
        if(!req.files || !req.files.images ){
            return res.status(400).send("No files were Uploaded.");

        }

        const validateResult = imageValidate(req.files.images)
        if(validateResult.error){
            return res.status(400).send(validateResult.error);
        }

        const path = require("path");
        const {v4: uuidv4} = require("uuid");
        var uploadDirectory = path.resolve(__dirname,
            "../../frontend","public","images","products");    

        var imagesTable = []

        if(Array.isArray(req.files.images)){
            imagesTable = req.files.images;
        }
        else{
            imagesTable.push(req.files.images);
        
        }
        // console.log(req.files.images);
        let product = await Product.findById(req.query.productId).orFail()

        for(let image of imagesTable){
            console.log(image);
            console.log(path.extname(image.name));
            console.log(uuidv4());

            var fileName = uuidv4() + path.extname(image.name);

            var uploadPath = uploadDirectory + 
                    "/" + fileName;

            product.images.push({ path: "/images/products/" + fileName })

            image.mv(uploadPath , function(err){
                if(err){
                    return res.status(500).send(err);
                }
            })
            
        }
        await product.save();
        return res.send("Files Uploaded")
    }
    catch(err){
        next(err);
    }
}



module.exports = {
    getProducts 
    ,adminCreateProducts
    , getProductsById
    , getBestsellers
    ,adminDeleteProducts
     ,adminGetProducts
     , adminUpdateProducts
     ,adminUpload
     };