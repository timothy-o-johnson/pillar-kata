function CheckoutOrderApp () {
  this.itemList = {} // collection of items and prices saved in the system
  this.basket = {} // count of items in the customers basket
  this.markDowns = {} // collection of markdowns
  this.specials = {} // collection of current specials
  this.totalPrice = 0 // total price of all items after specials and mark-downs

  this.scanItemsAddToGlobalBasketAndReturnGlobalTotalPrice = function (items) {
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

    return this.calculateBasketPriceAddToGlobalTotalPriceObjectAndReturnGlobalPriceObject()
  }

  this.addItemsToGlobalItemListObjectAndReturnGlobalItemListObject = function (items) {
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

  this.addMarkDownsToGlobalMarkDownObjectReturnGlobalMarkDownObject = function (markDowns) {
    markDowns = this.makeArray(markDowns)

    markDowns.forEach(markDown => {
      this.markDowns[markDown.name] = markDown.amount
    })

    return this.markDowns
  }

  this.addSpecialsToGlobalSpecialsObjectAndReturnGlobalSpecialsObject = function (specials) {
    specials = this.makeArray(specials)
    let type = ''

    specials.forEach(special => {
      type = special.type

      switch (type) {
        case 'nForX':
          //  N-for-X specials =
          //  {type: 'nForX', name: 'batteries', buyQuantity: 3, salesPrice: 5.00 }
          this.specials[special.name] = [type, special.buyQuantity, special.salesPrice]
          break
        case 'equalOrLesser': // set up is similar to XOff special so just continue below
        case 'xOff':
          // buy-N-get-M-at-X-off Special =
          // {type: 'xOff', name: "itemName", buyQuantity: 1, getQuantity: 1, getDiscount: .25}
          this.specials[special.name] = [type, special.buyQuantity, special.getQuantity, special.getDiscount]
          break
        default:
          break
      }

      // add limit to special if there is one (ex. 'buy 2, get 1 free, limit 6')
      special.limit && this.specials[special.name].push(special.limit)
    })

    return this.specials
  }

  this.calculateBasketPriceAddToGlobalTotalPriceObjectAndReturnGlobalPriceObject = function () {
    this.totalPrice = 0
    let regularPrice = 0
    let regularPriceQuantity = 0
    basket = this.basket

    // for each item in the basket calculate it's price by adding mark-downs and applying specials
    Object.keys(basket).forEach(item => {
      regularPriceQuantity = basket[item]
      regularPrice = this.itemList[item]
      markdown = this.markDowns[item] ? this.markDowns[item] : 0

      specialsObj = this.applyApplicableSpecialsFromGlobalSpecialsObjectReturnAnObjectContainingDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity(item, regularPriceQuantity, regularPrice)
      regularPriceQuantity = specialsObj.regularPriceQuantity
      discountedQuantity = specialsObj.discountedQuantity
      discountedPrice = specialsObj.discountedPrice

      this.totalPrice += (regularPrice - markdown) * regularPriceQuantity + discountedPrice * discountedQuantity
    })

    return this.totalPrice
  }

  this.applyApplicableSpecialsFromGlobalSpecialsObjectReturnAnObjectContainingDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity = function (item, basketQuantity, regularPrice) {
    const special = this.specials[item] || []
    const specialType = special[0]
    let discountedPrice = 0
    let discountedQuantity = 0
    let regularPriceQuantity = basketQuantity

    switch (specialType) {
      case 'equalOrLesser': // "Buy N, get M of equal or lesser value for %X off" on weighted items
        const equalOrLesserObj = this.calculateEqualOrLesserObjSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity(basketQuantity, special, regularPrice)

        discountedPrice = equalOrLesserObj.discountedPrice
        discountedQuantity = equalOrLesserObj.discountedQuantity
        regularPriceQuantity = equalOrLesserObj.regularPriceQuantity
        break

      case 'nForX': // "N items for $X"
        const nForXObj = this.calculateNforXSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity(basketQuantity, special)

        discountedPrice = nForXObj.discountedPrice
        discountedQuantity = nForXObj.discountedQuantity
        regularPriceQuantity = nForXObj.regularPriceQuantity
        break

      case 'xOff': // "Buy N items get M at %X off."
        const xOffObj = this.calculateXOffSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity(basketQuantity, special, regularPrice)

        discountedPrice = xOffObj.discountedPrice
        discountedQuantity = xOffObj.discountedQuantity
        regularPriceQuantity = xOffObj.regularPriceQuantity
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

  this.calculateEqualOrLesserObjSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity = function (basketQuantity, special, regularPrice) {
    return this.calculateXOffSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity(basketQuantity, special, regularPrice)
  }

  this.calculateNforXSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity = function (basketQuantity, special) {
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

  this.calculateXOffSpecialsReturnAnObjectWithDiscountedPriceDiscountedQuantityAndRegularyPriceQuantity = function (basketQuantity, special, regularPrice) {
    let basketQuantityTemp = basketQuantity
    const buyQuantity = special[1]
    const getQuantity = special[2]
    const discount = special[3]
    const limit = special[4] ? special[4] : Number.MAX_SAFE_INTEGER
    let discountedQuantity = 0

    while (basketQuantityTemp > buyQuantity && basketQuantityTemp - buyQuantity >= getQuantity) {
      discountedQuantity += getQuantity
      basketQuantityTemp -= buyQuantity + getQuantity

      if (discountedQuantity === limit) break
    }

    return {
      discountedPrice: (1 - discount) * regularPrice,
      discountedQuantity: discountedQuantity,
      regularPriceQuantity: basketQuantity - discountedQuantity
    }
  }

  this.removeScannedItemsFromGlobalBasketObjectAndReturnGlobalTotalPrice = function (items) {
    items = this.makeArray(items)
    let quantityOfItemInBasket

    items.forEach(item => {
      quantityOfItemInBasket = this.basket[item]

      if (quantityOfItemInBasket > 0) {
        this.basket[item]--
      }
    })

    return this.calculateBasketPriceAddToGlobalTotalPriceObjectAndReturnGlobalPriceObject()
  }
}

module.exports = {
  CheckoutOrderApp
}
