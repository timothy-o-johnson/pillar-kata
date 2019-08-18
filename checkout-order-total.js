function CheckoutOrderApp () {
  this.itemList = {}
  this.basket = {}
  this.markDowns = {}
  this.totalPrice = 0


  this.scanItemsAndReturnTotalPrice = function (items) {
    items = this.makeArray(items)
    let basket = this.basket
    let itemIsByWeight = null

    let price = 0
    let quantity = 0

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
    this.totalPrice = 0

    Object.keys(basket).forEach(item => {
      
      quantity = basket[item]
      price = this.itemList[item]
      markdown= this.markDowns[item] ? this.markDowns[item] : 0

      console.log('item:', item)
      console.log(basket) 
      console.log(`quantity: ${quantity}, price: ${price}, markdown: ${markdown}`)
      

      this.totalPrice +=  (price - markdown) * quantity 
    })

    return this.totalPrice
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

