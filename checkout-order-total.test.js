const checkoutOrderTotal = require('./checkout-order-total')

describe('accepts a scanned item', () => {
  test('configure the price of a per-unit items', () => {
    const entry = "add"
    const item = {name: 'soup', price: 1.89}
    const itemList = "Items: soup @ $1.89"

    expect(checkoutOrderTotal.checkoutOrderTotal(entry, item)).toEqual(itemList)
  })
})