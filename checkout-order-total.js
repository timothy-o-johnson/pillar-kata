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
        this.loadByWeightItemIntoBasket(item)
      } else {
        this.loadByUnitItemIntoBasket(item)
      }
    })

    return this.calculateBasketPriceAndReturnBasketPrice()
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

  this.loadByWeightItemIntoBasket = function (item) {
    let basket = this.basket
    let itemName = item[0]
    let itemWeight = parseFloat(item[1])

    if (basket[itemName]) {
      basket[itemName] += itemWeight
    } else {
      basket[itemName] = itemWeight
    }
  }

  this.loadByUnitItemIntoBasket = function (item) {
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

      // add limit if there is one
      special.limit && this.specials[special.name].push(special.limit)
    })

    return this.specials
  }

  this.calculateBasketPriceAndReturnBasketPrice = function () {
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
    let discountedPrice = 0
    let discountedQuantity = 0
    let regularPriceQuantity = basketQuantity

    switch (specialType) {
      case 'xOff': // "Buy N items get M at %X off."
        const xOffObj = this.calculateXOffSpecials(basketQuantity, special, regularPrice)

        discountedPrice = xOffObj.discountedPrice
        discountedQuantity = xOffObj.discountedQuantity
        regularPriceQuantity = xOffObj.regularPriceQuantity

        break
      case 'nForX':
        const nForXObj = this.calculateNforXSpecials(basketQuantity, special)

        discountedPrice = nForXObj.discountedPrice
        discountedQuantity = nForXObj.discountedQuantity
        regularPriceQuantity = nForXObj.regularPriceQuantity

        break
      default:
        break
    }

    return {
      discountedPrice: discountedPrice,
      discountedQuantity: discountedQuantity,
      regularPriceQuantity: regularPriceQuantity
    }
  }

  this.calculateXOffSpecials = function (basketQuantity, special, regularPrice) {
    let basketQuantityTemp = basketQuantity
    const buyQuantity = special[1]
    const getQuantity = special[2]
    const discount = special[3]
    const limit = special[4] ? special[4] : Number.MAX_SAFE_INTEGER
    let discountedQuantity = 0

    while (basketQuantityTemp > buyQuantity && basketQuantityTemp - buyQuantity >= getQuantity) {
      discountedQuantity += getQuantity
      basketQuantityTemp -= buyQuantity + getQuantity
      // console.log(discountedQuantity, limit)

      if (discountedQuantity === limit) break
    }

    return {
      discountedPrice: (1 - discount) * regularPrice,
      discountedQuantity: discountedQuantity,
      regularPriceQuantity: basketQuantity - discountedQuantity
    }
  }

  this.calculateNforXSpecials = function (basketQuantity, special) {
    let basketQuantityTemp = basketQuantity
    const buyQuantity = special[1]
    const discount = special[2]
    let discountedQuantity = 0
    const limit = special[3] ? special[3] : Number.MAX_SAFE_INTEGER

    while (basketQuantityTemp >= buyQuantity) {
      discountedQuantity += buyQuantity
      basketQuantityTemp -= buyQuantity

      if (discountedQuantity === limit) break
    }

    return {
      discountedPrice: discount,
      discountedQuantity: Math.floor(discountedQuantity / buyQuantity),
      regularPriceQuantity: basketQuantity - discountedQuantity
    }
  }

  this.removeScannedItemsAndReturnTotalPrice = function (items) {
    items = this.makeArray(items)
    let quantityOfItemInBasket

    items.forEach(item => {
      quantityOfItemInBasket = this.basket[item]

      if (quantityOfItemInBasket > 0) {
        this.basket[item]--
      }
    })

    return this.calculateBasketPriceAndReturnBasketPrice()
  }
}

module.exports = {
  CheckoutOrderApp
}
