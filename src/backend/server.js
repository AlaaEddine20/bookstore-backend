const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
// const listEndpoints = require("express-list-endpoints")
const cors = require("cors")
const productsRouter = require("./productsDB")
const {
    notFoundHandler,
    unauthorizedHandler,
    forbiddenHandler,
    badRequestHandler,
    catchAllHandler
} = require("./errorHandler")

const server = express()

const port = process.env.PORT || 3005

const loggerMiddleware = (req, res, next) => {
    console.log(`Logged ${req.url} ${req.method} -- ${new Date()} `)
    next()
}

server.use(cors())
server.use(express.json())
server.use(loggerMiddleware)

server.use("/products", productsRouter)




server.use(notFoundHandler)
server.use(unauthorizedHandler)
server.use(badRequestHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)


server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})