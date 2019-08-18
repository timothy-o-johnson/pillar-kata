function CheckoutOrderApp () {
  this.itemList = {}
  this.basket = {}
  this.markDowns = {}

  let price = 0
  let quantity = 0

  this.scanItemsAndReturnTotalPrice = function (items) {
    items = this.makeArray(items)
    let totalPrice = 0
    let basket = this.basket
    let itemIsByWeight = null

    // add items to basket and update the quantity of each item
    items.forEach(item => {
      itemIsByWeight = Array.isArray(item)

      if (itemIsByWeight) {
        this.loadBasketItemByWeight(item)
      } else {
        this.loadBasketItemByUnit(item)
      }
    })

    // calculate totalPrice
    Object.keys(basket).forEach(item => {
      quantity = basket[item]
      price = this.itemList[item]

      totalPrice +=  price * quantity 
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

  this.makeArray = function (arrayData) {
    return Array.isArray(arrayData) ? arrayData : [arrayData]
  }

  this.loadBasketItemByWeight = function (item) {
    let basket = this.basket
    let itemName = item[0] 
    let itemWeight = parseFloat(item[1]) 

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

  this.addMarkDowns = function(markDowns){
    markDowns = this.makeArray(markDowns)

    markDowns.forEach(markDown => {
      this.markDowns[markDown.name] = markDown.amount
    })

    return this.markDowns
  }
}

module.exports = {
  CheckoutOrderApp
}

