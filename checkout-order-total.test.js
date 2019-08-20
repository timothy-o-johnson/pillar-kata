let CheckoutOrderApp = require('./checkout-order-total').CheckoutOrderApp

/**********/
/* Set Up */
/**********/

let checkoutOrderApp = new CheckoutOrderApp()

// per-unit items
const soup = { name: 'soup', price: 1.89 }
const sardines = { name: 'sardines', price: 0.89 }
const cards = { name: 'cards', price: 4.0 }
const batteries = { name: 'batteries', price: 10.0 }
const lightbulbs = { name: 'lightbulbs', price: 2.0 }
const orangeJuice = { name: 'orange juice', price: 5.0 }

// by-weight items
const groundBeef = { name: 'ground beef', price: 2.5, byWeight: true }
const bananas = { name: 'bananas', price: 0.25, byWeight: true }

// mark-downs
const soupMarkDown = { name: 'soup', amount: 1.5 }
const bananasMarkDown = { name: 'bananas', amount: 0.1 }

// specials

// ..of type 'xOff'
const sardinesSpecial = { type: 'xOff', name: 'sardines', buyQuantity: 1, getQuantity: 1, getDiscount: 1 }
const cardSpecial = { type: 'xOff', name: 'cards', buyQuantity: 2, getQuantity: 1, getDiscount: 0.5 }

// ... of type 'nForX'
const batteriesSpecial = { type: 'nForX', name: 'batteries', buyQuantity: 3, salesPrice: 5.0 }

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
  test('a: add buy-N-get-M-at-X-off specials', () => {
    const specials = [sardinesSpecial, cardSpecial]
    const specialsObj = { sardines: ['xOff', 1, 1, 1], cards: ['xOff', 2, 1, 0.5] }

    expect(checkoutOrderApp.addSpecials(specials)).toEqual(expect.objectContaining(specialsObj))
  })

  test('b: buy 1, get 1 free', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['sardines', 'sardines', 'sardines', 'sardines', 'sardines']
    const totalPrice = sardines.price * (5 - 2)

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })

  test('c: buy 2, get 1 half off', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const items = [soup, sardines, bananas, cards, batteries]
    checkoutOrderApp.configurePricesAndReturnAnItemsList(items) // stock the items

    const scans = ['sardines', 'sardines', 'sardines', 'sardines', 'sardines', 'cards', 'cards', 'cards']
    const totalPrice = sardines.price * (5 - 2) + cards.price * 2.5

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })
})

// Use Case #5
describe('Use Case #5: Support a special in the form of "N for $X."', () => {
  test('a: add N-for-X specials', () => {
    const specials = [batteriesSpecial]
    const specialsObj = { sardines: ['xOff', 1, 1, 1], cards: ['xOff', 2, 1, 0.5], batteries: ['nForX', 3, 5.0] }

    expect(checkoutOrderApp.addSpecials(specials)).toEqual(expect.objectContaining(specialsObj))
  })

  test('b: buy 3 for $5.00', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const scans = ['batteries', 'batteries', 'batteries', 'batteries', 'batteries']
    const totalPrice = 5.0 + batteries.price * 2

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })
})

// Use Case #6
describe('Use Case #6: Support a limit on specials', () => {
  const lightbulbSpecial = {
    type: 'xOff',
    name: 'lightbulbs',
    buyQuantity: 2,
    getQuantity: 1,
    getDiscount: 1,
    limit: 6
  }

  const orangeJuiceSpecial = { type: 'nForX', name: 'orange juice', buyQuantity: 4, salesPrice: 10, limit: 12 }

  test('a: add limits to specials', () => {
    const specials = [lightbulbSpecial, orangeJuiceSpecial]
    const specialsObj = {
      sardines: ['xOff', 1, 1, 1],
      cards: ['xOff', 2, 1, 0.5],
      batteries: ['nForX', 3, 5.0],
      lightbulbs: ['xOff', 2, 1, 1, 6],
      'orange juice': ['nForX', 4, 10, 12]
    }

    expect(checkoutOrderApp.addSpecials(specials)).toEqual(expect.objectContaining(specialsObj))
  })

  test('b: buy 2, get 1 free, limit 6', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const items = [soup, sardines, bananas, cards, batteries, lightbulbs, orangeJuice]
    checkoutOrderApp.configurePricesAndReturnAnItemsList(items) // stock the item

    const scans = []
    for (let i = 0; i < 20; i++) scans.push('lightbulbs')
    const totalPrice = lightbulbs.price * (12 + 2)

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })

  test('c: buy 4 for 10, limit 12', () => {
    checkoutOrderApp.basket = {} // empty the basket
    const items = [soup, sardines, bananas, cards, batteries, lightbulbs, orangeJuice]
    checkoutOrderApp.configurePricesAndReturnAnItemsList(items) // stock the item

    const scans = []
    for (let i = 0; i < 20; i++) scans.push('orange juice')
    const totalPrice = 30 + orangeJuice.price * 8

    expect(checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)).toEqual(totalPrice)
  })
})

// Use Case #7
describe('Use Case #7: Support removing a scanned item', () => {
  test('a: keep the correct total after invalidating a X-for-N special', () => {
    // empty the basket
    checkoutOrderApp.basket = {}

    // calculate price with special
    let scans = []
    for (let i = 0; i < 20; i++) scans.push('orange juice')
    let expectedTotalWithSpecial = 30 + orangeJuice.price * 8
    let actualTotalWithSpecial = checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)
    let part1IsOkay = expectedTotalWithSpecial === actualTotalWithSpecial

    // delete enough items to invalidate a special
    let scansForRemoval = []
    for (let i = 0; i < 10; i++) scansForRemoval.push('orange juice')

    // verify that the new price without special
    // 10 items = 4 @ $10 + 4 @ $10 + 2 @ reg price
    let totalWithoutSpecial = 20 + orangeJuice.price * 2

    // determine if there's a problem with the set up
    totalWithoutSpecial = part1IsOkay ? totalWithoutSpecial : "part 1 ain't okay"

    expect(checkoutOrderApp.removeScannedItemsAndReturnTotalPrice(scansForRemoval)).toEqual(totalWithoutSpecial)
    console.log('is part1IsOkay?', part1IsOkay)
  })

  test('b: keep the correct total after invalidating an X-Off special', () => {
    // empty the basket
    checkoutOrderApp.basket = {}

    // calculate price with special
    let scans = []
    for (let i = 0; i < 20; i++) scans.push('lightbulbs')
    let expectedTotalWithSpecial = lightbulbs.price * (12 + 2)
    let actualTotalWithSpecial = checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)
    let part1IsOkay = expectedTotalWithSpecial === actualTotalWithSpecial

    // delete enough items to invalidate a special
    let scansForRemoval = []
    for (let i = 0; i < 13; i++) scansForRemoval.push('lightbulbs')

    // verify that the new price without special (buy 2, get 1 free, limit 6)
    // 7 items = 4 @ reg price + 2 @ free + 1 @ reg price
    let totalWithoutSpecial = 4 * lightbulbs.price + 2 * 0 + 1 * lightbulbs.price

    // determine if there's a problem with the set up
    totalWithoutSpecial = part1IsOkay ? totalWithoutSpecial : "part 1 ain't okay"

    expect(checkoutOrderApp.removeScannedItemsAndReturnTotalPrice(scansForRemoval)).toEqual(totalWithoutSpecial)
    console.log('is part1IsOkay?', part1IsOkay)
  })
})


// Use Case #8
describe('Use Case #8: Support "Buy N, get M of equal or lesser value for %X off" on weighted items', () => {
  test('a: add "equalOrLesser" special', () => {
   const beefSpecial = {type: 'equalOrLesser', name: 'beef', discount: .5 }

   const specialsObj = {
    sardines: ['xOff', 1, 1, 1],
    cards: ['xOff', 2, 1, 0.5],
    batteries: ['nForX', 3, 5.0],
    lightbulbs: ['xOff', 2, 1, 1, 6],
    'orange juice': ['nForX', 4, 10, 12],
    beef: ['equalOrLesser', .5]
  }

  expect(checkoutOrderApp.addSpecials(beefSpecial)).toEqual(expect.objectContaining(specialsObj))
  })

})
// Error checking -- what if an item is scanned but in the system

// clean up: arrange things in alphabetical order
