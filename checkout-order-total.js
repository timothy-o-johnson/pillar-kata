function CheckoutOrderApp () {
  this.itemList = {}
  this.basket = {}

  this.scanItems = function (items) {
    // make sure the scans are in an array
    items = Array.isArray(items) ? items : [items]
    let totalPrice = 0
    let basket = this.basket

    items.forEach(item => {
      if (basket[item]) {
        basket[item]++
      } else {
        basket[item] = 1
      }
    })

    Object.keys(basket).forEach(item => {
      totalPrice += basket[item] * this.itemList[item]
    })

    return totalPrice
  }

  this.configurePrices = function (items) {
    let result = 'Items:\n'
    items = Array.isArray(items) ? items : [items]

    items.forEach(item => {
      result += `${item.name} @ $${item.price}\n`
      this.itemList[item.name] = item.price
    })

    console.log(result, this.itemList)
    return result
  }
}

module.exports = {
  CheckoutOrderApp
}
