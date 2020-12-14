const express = require("express")
const uniqid = require("uniqid")
const { writeProducts, getProducts } = require ("../lib/utilities")
const { check, validationResult } = require("express-validator")

const productsRouter = express.Router()

const productsValidation = [check("name").exists().withMessage("Please, insert a name"), 
check("description").exists().withMessage("Please, provide a description, minimum 30 chars."), 
check("brand").exists().withMessage("Brand is required!"),
check("price").exists().withMessage("Price is required!")]

const reviewsValidation = [check("comment").exists().withMessage("Compile the required field!"),
check("rate").exists().isInt({ min: 1, max: 5 }).withMessage("Rate us!"),]

productsRouter.get("/", async (req, res, next) => {
    try {
        const products = await getProducts()

        if(req.query && req.query.category ) {
            const filteredProducts = productsDB.filter(
            product =>
            product.hasOwnProperty("category") 
            &&
            product.category.toLowerCase() === req.query.category.toLowerCase()
        ) 
        res.send(filteredProducts) 
   }
        else {
            res.send(products)
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
})



productsRouter.get("/:id", async (req, res, next) => {
    try {
        const products = await getProducts()
        const product = products.find(product => product.ID === req.params.id)

        
        if(product.length > 0) {
             res.send(product)

        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        } 
    

    } catch (error) {
        next(error)
    }
})


productsRouter.post("/", productsValidation, async (req, res, next) => {
    try {
        const validationErrors = validationResult(req)

        if(!validationErrors.isEmpty()) {
           const err = new Error() 
           err.message = validationErrors
           err.httpStatusCode = 400 
          next(err)
        } else {

        const products = await getProducts()
        products.push({
            ...req.body,
            ID: uniqid(),
            createdAt: new Date(),
            updatedAt: new Date(),
            reviews: []
        })
        

        await writeProducts(products)
        res.send(201).send("ok")
    }
    } catch (error) {
        next(error)
    }
}
)


productsRouter.delete("/:id", async (req, res, next) => {
    try {
        const products = await getProducts()
        const productFound = products.find( product => product.ID === req.params.id) //find the one that matches the id
        
        if(productFound) {
           const filteredProducts= products.filter( product => product.ID !== req.params.id) 
        
        await writeProducts(filteredProducts)
        
        res.statusCode(204).send("ok")

    } else {
        const err = new Error()
        err.httpStatusCode = 404
        next(err)
    }
        
    } catch (error) {
        next(error)
    }
}
)


productsRouter.put("/:id", productsValidation, async (req, res, next) => {
    try {
        const validationErrors = validationResult(req)

        const products = await getProducts()
        const productIndex = products.findIndex(product => product.ID === req.params.id)

        if(productIndex !== -1) //product found 
        {
            const updatedProduct = [...products.slice(0, productIndex), //slicing through the whole products array
        {...products[productIndex], ...req.body }, //everything that is coming from the (new)body will overwrite the previous one
        ...products.slice(productIndex + 1) ] 
        await writeProducts(updatedProduct) 
        res.send(updatedProduct)

    } else {
        err = new Error()
        err.httpStatusCode = 404
        next(err)
    }
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/:id/reviews", /*getting all the reviews of a specific product by id */
 async (req, res, next) => {
    try {

        const products = await getProducts()

        const productFound = products.find( product => product.ID === req.params.id)
        
        if(productFound) {
            res.send(productFound.reviews) // .reviews cuz reviews is a property that we gave to products object
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.post("/:id/reviews", reviewsValidation, async (req, res, next) => {
    try {
        const products = await getProducts()
        const productIndex = products.findIndex( product => product.ID === req.params.id)

        if(productIndex !== -1) /* product found */ {
            products[productIndex].reviews.push({...req.body, ID: uniqid(), createdAt: new Date()})
            // I find the product index and then i access the array of product then the reviews property and i push the new object
            await writeProducts(products)
            res.status(201).send(products)
        } else {
            const err = new Error()
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.delete("/:id/reviews/:reviewID", reviewsValidation, async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})

productsRouter.put("/id/reviews/:reviewID", reviewsValidation, async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
})

module.exports = productsRouter