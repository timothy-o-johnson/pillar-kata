const checkoutOrderTotal = require('./checkout-order-total')

describe('accepts a scanned item', () => {
  test('configure the price of a per-unit item', () => {
    const entry = "add"
    const item = {name: 'soup', price: 1.89}
    const itemList = `Items:\nsoup @ $1.89`

    expect(checkoutOrderTotal.checkoutOrderTotal(entry, item)).toMatch(itemList)
  })

  test('configure the price of several per-unit items', () => {
    const entry = "add"
    const soup = {name: 'soup', price: 1.89}
    const sardines = {name: 'sardines', price: 0.89}
    const items = [soup, sardines]
    const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89`

    expect(checkoutOrderTotal.checkoutOrderTotal(entry, items)).toMatch(itemList)
  })

  test('reflect an increase in the per-unit price after a scan', () => {
    const entry = "soup"
    const total = "$1.89"

    expect(checkoutOrderTotal.checkoutOrderTotal(entry)).toMatch(total)
  })
})