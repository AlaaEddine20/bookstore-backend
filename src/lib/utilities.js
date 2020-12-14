const { writeJSON, readJSON } = require("fs-extra")
const { join } = require("path")

const productsFilePath = join(__dirname, "../backend/products.json")


const readProducts = async filePath => {
  try {
    const fileJSON = await readJSON(filePath)
    return fileJSON
  } catch (error) {
    throw new Error(error)
  }
}

const writeProducts = async (filePath, data) => {
  try {
    await writeJSON(filePath, data)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  getProducts: async () => readProducts(productsFilePath),
  writeProducts: async (productsData) => writeProducts(productsFilePath, productsData)
}
