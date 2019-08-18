function CheckoutOrderApp () {
  this.itemList = {}
  this.basket = {}
  let price = 0
  let quantity = 0

  this.scanItemsAndReturnTotalPrice = function (items) {
    items = this.makeArray(items)
    let totalPrice = 0
    let basket = this.basket

    // add items to basket and update the quantity of each item
    items.forEach(item => {
      
      if (Array.isArray(item)) {
        this.loadBasketItemByWeight(item)
      } else {
        this.loadBasketItemByUnit(item)
      }
    })

    // calculate totalPrice
    Object.keys(basket).forEach(item => {
      quantity = basket[item]
      price = this.itemList[item]

      totalPrice +=  price * quantity /*?+*/
    })

    return totalPrice
  }

  this.configurePricesAndReturnAnItemsList = function (items) {
    let result = 'Items:\n'
    items = this.makeArray(items) /*?+*/

    items.forEach(item => {
      result += `${item.name} @ $${item.price}\n`
      this.itemList[item.name] = item.price
    })

    return result
  }

  this.makeArray = function (arrayData) {
    return Array.isArray(arrayData) ? arrayData : [arrayData]
  }

  this.loadBasketItemByWeight = function (item) {
    console.log(item)
    let basket = this.basket
    let itemName = item[0] /*?+*/
    let itemWeight = parseFloat(item[1]) /*?+*/

    if (basket[itemName]) {
      basket[itemName] += itemWeight
    } else {
      basket[itemName] = itemWeight
    }

    basket
  }

  this.loadBasketItemByUnit = function (item) {
    let basket = this.basket

    if (basket[item]) {
      basket[item]++
    } else {
      basket[item] = 1
    }
  }
}

module.exports = {
  CheckoutOrderApp
}

let checkoutOrderApp = new CheckoutOrderApp()
// per-unit items
const soup = { name: 'soup', price: 1.89 }
const sardines = { name: 'sardines', price: 0.89 }
const groundBeef = { name: 'ground beef', price: 2.5, byWeight: true }
const bananas = { name: 'bananas', price: 0.25, byWeight: true }

const items = [soup, sardines, bananas]    

const scans = ['soup', 'soup', ['bananans', 1.3]]
const total = 1.89 * 2 + 0.25 * 1.3

checkoutOrderApp.configurePricesAndReturnAnItemsList(items)
let totalPrice = checkoutOrderApp.scanItemsAndReturnTotalPrice(scans) /*?+*/
