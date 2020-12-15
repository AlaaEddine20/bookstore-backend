const express = require("express")
const { readJSON, writeJSON } = require("fs-extra")
const { join } = require("path")
const { getProducts } = require("../../lib/utilities")
const router = express.Router()

const cartPath = join(__dirname, "cart.json")
const cartsRouter = express.Router() 

cartsRouter.get(("/:cartID"), async (req, res, next) => {
    try {

        const carts = await readJSON(cartPath)
        const cart = carts.find( cart => cart._id === req.params.cartID)
        res.send(cart)

    } catch (error) {
        next(error)
    }
})

cartsRouter.post(("/:cartID/add-to-cart/:id"), async (req, res, next) => {
    try {
        const products = await getProducts()
        const carts = await readJSON(cartPath)

        // if the current id matches the one i need then replase the object with the 
        // new one, otherwise return the actual cart
        const updatedCart = carts.map( cart => cart._id === req.params.cartID ? {
            ...cart,
            products:[req.params.id]
        } : cart)

        // when i checked i write the new infos 
        await writeJSON(cartPath, updatedCart)
        res.send(updatedCart)
    } catch (error) {
        next(error)
    }
})

module.exports = cartsRouter