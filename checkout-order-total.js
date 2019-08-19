function CheckoutOrderApp () {
  this.itemList = {}
  this.basket = {}
  this.markDowns = {}
  this.specials = {}
  this.totalPrice = 0

  this.scanItemsAndReturnTotalPrice = function (items) {
    items = this.makeArray(items)
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

    return this.calculateBasketPrice()
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
  }

  this.loadBasketItemByUnit = function (item) {
    let basket = this.basket

    if (basket[item]) {
      basket[item]++
    } else {
      basket[item] = 1
    }
  }

  this.addMarkDowns = function (markDowns) {
    markDowns = this.makeArray(markDowns)

    markDowns.forEach(markDown => {
      this.markDowns[markDown.name] = markDown.amount
    })

    return this.markDowns
  }

  this.addSpecials = function (specials) {
    specials = this.makeArray(specials)
    let type = ''

    specials.forEach(special => {
      type = special.type

      switch (type) {
        case 'xOff':
          // buy-N-get-M-at-X-off Special =
          // {type: 'xOff', name: "itemName", buyQuantity: 1, getQuantity: 1, getDiscount: .25}
          this.specials[special.name] = [type, special.buyQuantity, special.getQuantity, special.getDiscount]
          break
        case 'nForX':
          //  N-for-X specials =
          //  {type: 'nForX', name: 'batteries', buyQuantity: 3, salesPrice: 5.00 }
          this.specials[special.name] = [type, special.buyQuantity, special.salesPrice]
          break
        default:
          break
      }
    })

    return this.specials
  }

  this.calculateBasketPrice = function () {
    this.totalPrice = 0
    let regularPrice = 0
    let regularPriceQuantity = 0
    basket = this.basket

    Object.keys(basket).forEach(item => {
      regularPriceQuantity = basket[item]
      regularPrice = this.itemList[item]
      markdown = this.markDowns[item] ? this.markDowns[item] : 0

      specialsObj = this.applySpecials(item, regularPriceQuantity, regularPrice)
      regularPriceQuantity = specialsObj.regularPriceQuantity
      discountedQuantity = specialsObj.discountedQuantity
      discountedPrice = specialsObj.discountedPrice

      // console.log('item:', item)
      // console.log(basket)
      // console.log(`quantity: ${quantity}, price: ${price}, markdown: ${markdown}`)

      this.totalPrice += (regularPrice - markdown) * regularPriceQuantity + discountedPrice * discountedQuantity
    })

    return this.totalPrice
  }

  this.applySpecials = function (item, basketQuantity, regularPrice) {
    const special = this.specials[item] || []
    const specialType = special[0]
    let basketQuantityTemp = 0
    let buyQuantity = 0
    let getQuantity = 0
    let discount = 0
    let discountedQuantity = 0
    let regularPriceQuantity = 0 + basketQuantity
    let discountedPrice = 0

    switch (specialType) {
      case 'xOff': // "Buy N items get M at %X off."
        basketQuantityTemp = 0 + basketQuantity
        buyQuantity = special[1]
        getQuantity = special[2]
        discount = special[3]
        discountedQuantity = 0

        while (basketQuantityTemp > buyQuantity && basketQuantityTemp - buyQuantity >= getQuantity) {
          discountedQuantity += getQuantity
          basketQuantityTemp -= buyQuantity + getQuantity
        }

        regularPriceQuantity = basketQuantity - discountedQuantity
        discountedPrice = (1 - discount) * regularPrice
        break
      case 'nForX':
        basketQuantityTemp = 0 + basketQuantity
        buyQuantity = special[1]
        discount = special[2]
        discountedQuantity = 0

        while (basketQuantityTemp >= buyQuantity) {
          discountedQuantity += buyQuantity
          basketQuantityTemp -= buyQuantity
        }

        regularPriceQuantity = basketQuantity - discountedQuantity
        discountedQuantity = Math.floor(discountedQuantity / buyQuantity)
        discountedPrice = discount
        break
      default:
        break
    }
    // the math final math
    return {
      regularPriceQuantity: regularPriceQuantity,
      discountedQuantity: discountedQuantity,
      discountedPrice: discountedPrice
    }
  }
}

module.exports = {
  CheckoutOrderApp
}
