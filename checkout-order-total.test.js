let CheckoutOrderApp = require('./checkout-order-total').CheckoutOrderApp

let checkoutOrderApp = new CheckoutOrderApp()

// per-unit items
const soup = { name: 'soup', price: 1.89 }
const sardines = { name: 'sardines', price: 0.89 }

// by-weight items
const groundBeef = { name: 'ground beef', price: 2.5, byWeight: true }
const bananas = { name: 'bananas', price: 0.25, byWeight: true }

describe('Use Case #1: accepts a scanned item', () => {
  test('configure the price of a per-unit item', () => {
    const itemList = `Items:\nsoup @ $1.89`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(soup)).toMatch(itemList)
  })

  test('configure the price of several per-unit items', () => {
    const items = [soup, sardines]
    const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(items)).toMatch(itemList)
  })

  test('total reflects an increase by the per-unit price after a scan', () => {
    const scan = 'soup'
    const total = 1.89

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scan)).toEqual(total)
  })

  test('total reflects an increase by the per-unit price after several scans', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['soup', 'soup']
    const total = 1.89 * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })
})

describe('Use Case #2: accepts a scanned item and weight', () => {
  test('configure the price of a by-weight item', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const items = [soup, sardines, bananas]
    const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89\nbananas @ $0.25`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(items)).toMatch(itemList)
  })

  test("total reflects an increase by an item's given weight", () => {
    const scans = ['soup', 'soup', ['bananas', 1.3], ['bananas', 5], 'sardines', 'sardines']
    const total = 1.89 * 2 + 0.25 * 1.3 + 0.25 * 5 + 0.89 * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })
})

describe('Use Case #3: support a mark-down', () => {
  // mark-downs
  const soupMarkDown = {name: "soup", amount: 1.50}
  const bananasMarkDown = {name: "bananas", amount: .10}

  test('add mark-downs', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const markDowns = [soupMarkDown, bananasMarkDown]
    const markDownsObj = {'soup': 1.50, 'bananas': .10}

    expect(checkoutOrderApp.addMarkDowns(markDowns)).toEqual(expect.objectContaining(markDownsObj))
  })

  // test('A marked-down item will reflect the per-unit cost less the markdown when scanned', () => {
  //   checkoutOrderApp.basket = {} // empty the basket
  //   const items = [soup, sardines, bananas]
  //   const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89\nbananas @ $0.25`

  //   expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(items)).toMatch(itemList)
  // })
})
