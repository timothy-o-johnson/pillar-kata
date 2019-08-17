let CheckoutOrderApp = require('./checkout-order-total').CheckoutOrderApp

let checkoutOrderApp = new CheckoutOrderApp()
// per-unit items
const soup = {name: 'soup', price: 1.89}
const sardines = {name: 'sardines', price: 0.89}

describe('accepts a scanned item', () => {

  test('configure the price of a per-unit item', () => {    
    const itemList = `Items:\nsoup @ $1.89`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(soup)).toMatch(itemList)

  })

  test('configure the price of several per-unit items', () => {
    
    const items = [soup, sardines]
    const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(items)).toMatch(itemList)
  })

  test('reflect an increase in the per-unit price after a scan', () => {
    const scan = "soup"
    const total = 1.89

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scan)).toEqual(total)
  })

  test('reflect an increase in the per-unit price after several scans', () => {
    checkoutOrderApp.basket = {} //empty the basket
    const scans = ["soup","soup"]
    const total = 1.89 * 2
    
    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })
})