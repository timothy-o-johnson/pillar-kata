let CheckoutOrderApp = require('./checkout-order-total').CheckoutOrderApp

/**********/
/* Set Up */
/**********/

let checkoutOrderApp = new CheckoutOrderApp()

// per-unit items
const soup = { name: 'soup', price: 1.89 }
const sardines = { name: 'sardines', price: 0.89 }
const cards = {name: 'cards', price: 4.00}
const batteries = {name: 'batteries', price: 10.00}

// by-weight items
const groundBeef = { name: 'ground beef', price: 2.5, byWeight: true }
const bananas = { name: 'bananas', price: 0.25, byWeight: true }

// mark-downs
const soupMarkDown = { name: 'soup', amount: 1.5 }
const bananasMarkDown = { name: 'bananas', amount: 0.1 }

/**********/
/* Tests */
/**********/

// Use Case #1
describe('Use Case #1: accepts a scanned item', () => {
  test('a: configure the price of a per-unit item', () => {
    const itemList = `Items:\nsoup @ $1.89`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(soup)).toMatch(itemList)
  })

  test('b: configure the price of several per-unit items', () => {
    const items = [soup, sardines]
    const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(items)).toMatch(itemList)
  })

  test('c: total reflects an increase by the per-unit price after a scan', () => {
    const scan = 'soup'
    const total = 1.89

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scan)).toEqual(total)
  })

  test('d: total reflects an increase by the per-unit price after several scans', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['soup', 'soup']
    const total = 1.89 * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })
})

// Use Case #2
describe('Use Case #2: accepts a scanned item and weight', () => {
  test('a: configure the price of a by-weight item', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const items = [soup, sardines, bananas]
    const itemList = `Items:\nsoup @ $1.89\nsardines @ $0.89\nbananas @ $0.25`

    expect(checkoutOrderApp.configurePricesAndReturnAnItemsList(items)).toMatch(itemList)
  })

  test("b: total reflects an increase by an item's given weight", () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['soup', 'soup', ['bananas', 1.3], ['bananas', 5], 'sardines', 'sardines']
    const total = soup.price * 2 + bananas.price * 1.3 + bananas.price * 5 + sardines.price * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })
})

// Use Case #3
describe('Use Case #3: support a mark-down', () => {
  test('a: add mark-downs', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const markDowns = [soupMarkDown, bananasMarkDown]
    const markDownsObj = { soup: 1.5, bananas: 0.1 }

    expect(checkoutOrderApp.addMarkDowns(markDowns)).toEqual(expect.objectContaining(markDownsObj))
  })

  test('b: a single, by-weight item reflects the by-weight cost less the markdown when scanned', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = [['bananas', 5]]
    const totalPrice = (bananas.price - bananasMarkDown.amount) * 5

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })

  test('c: by-weight items reflect the by-weight cost less the markdown when scanned', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = [['bananas', 1.3], ['bananas', 5], 'sardines', 'sardines']
    const total =
      (bananas.price - bananasMarkDown.amount) * 1.3 + (bananas.price - bananasMarkDown.amount) * 5 + sardines.price * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })

  test('d: a single, per-unit item reflects the per-unit cost less the markdown when scanned', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['soup']
    const totalPrice = (soup.price - soupMarkDown.amount) * 1

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })

  test('e: per-unit items reflect the per-unit cost less the markdown when scanned', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['soup', 'soup', ['bananas', 1.3], ['bananas', 5], 'sardines', 'sardines']
    const total =
      (soup.price - soupMarkDown.amount) * 2 +
      (bananas.price - bananasMarkDown.amount) * 1.3 +
      (bananas.price - bananasMarkDown.amount) * 5 +
      sardines.price * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(total)
  })
})

// Use Case #4
describe('Use Case #4: support a special in the form of "Buy N items get M at %X off" ', () => {
  // specials
  const sardinesSpecial ={name: "sardines", buyQuantity: 1, getQuantity: 1, getDiscount: 1}
  const cardSpecial= {name: "cards", buyQuantity: 2, getQuantity: 1, getDiscount: .50}
  
  test('a: add specials', () => {
    const specials = [sardinesSpecial, cardSpecial]
    const specialsObj = { sardines: [1, 1, 1], cards: [2, 1, .50] }

    expect(checkoutOrderApp.addSpecials(specials)).toEqual(expect.objectContaining(specialsObj))
    console.log(checkoutOrderApp.specials)
    
  })

  // test('b: buy 1, get 1 free', () => {
  //   checkoutOrderApp.basket = {} // empty the basket
  //   const markDowns = [soupMarkDown, bananasMarkDown]
  //   const markDownsObj = { soup: 1.5, bananas: 0.1 }
  //   checkoutOrderApp.addMarkDowns(markDowns)
  // })

})