function CheckoutOrderApp () {
  this.itemList = {}
  this.basket = {}

  this.scanItemsAndReturnTotalPrice = function (items) {
    items = this.makeArray(items)
    let totalPrice = 0
    let basket = this.basket

    // add items to basket and update the quantity of each item
    items.forEach(item => {
      if (basket[item]) {
        basket[item]++
      } else {
        basket[item] = 1
      }
    })

    // calculate totalPrice
    Object.keys(basket).forEach(item => {
      totalPrice += basket[item] * this.itemList[item]
    })

    return totalPrice
  }

  this.configurePricesAndReturnAnItemsList = function (items) {
    let result = 'Items:\n'
    items = this.makeArray(items)

    items.forEach(item => {
      result += `${item.name} @ $${item.price}\n`
      this.itemList[item.name] = item.price
    })

  
    return result
  }

  this.makeArray = function (arrayData){
    return Array.isArray(arrayData) ? arrayData : [arrayData]
  }
}

module.exports = {
  CheckoutOrderApp
}
