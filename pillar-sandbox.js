let CheckoutOrderApp = require('./checkout-order-total').CheckoutOrderApp

let checkoutOrderApp = new CheckoutOrderApp()

// creating and adding items
const soup = { name: 'soup', price: 1.89 }
const sardines = { name: 'sardines', price: 0.89 }
const groundBeef = { name: 'ground beef', price: 2.5, byWeight: true }
const bananas = { name: 'bananas', price: 0.25, byWeight: true }
const cards = { name: 'cards', price: 4.0 }
const batteries = { name: 'batteries', price: 10.0 }
const lightbulbs = { name: 'lightbulbs', price: 2.0 }
const orangeJuice = { name: 'orange juice', price: 5.0 }

let items = [soup, sardines, bananas, batteries]
checkoutOrderApp.configurePricesAndReturnAnItemsList(items)

// creating and adding markdowns
const soupMarkDown = { name: 'soup', amount: 1.5 }
const bananasMarkDown = { name: 'bananas', amount: 0.1 }
const markDowns = [soupMarkDown, bananasMarkDown]

checkoutOrderApp.addMarkDowns(markDowns)

// scans
let scans = [['bananas', 5]]
const total = 1.89 * 2 + 0.25 * 1.3
const markDownprice = (bananas.price - bananasMarkDown.amount) * 5

let totalPrice = checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)

console.log(JSON.stringify(checkoutOrderApp))

// Use Case #4: support a special in the form of "Buy N items get M at %X off"
const sardinesSpecial = { name: 'sardines', buyQuantity: 1, getQuantity: 1, getDiscount: 1 }
const cardSpecial = { name: 'cards', buyQuantity: 2, getQuantity: 1, getDiscount: 0.5 }

let specials = [sardinesSpecial, cardSpecial]
let specialsObj = { sardines: [1, 1, 1], cards: [2, 1, 0.5] }

checkoutOrderApp.addSpecials(specials)

// Test 4b: buy 1, get 1 free'
checkoutOrderApp.basket = {} // empty the basket
scans = ['sardines', 'sardines', 'sardines', 'sardines', 'sardines']
totalPrice = sardines.price * (5 - 2)

checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)

// Test 4c: buy 2, get 1 half off'
checkoutOrderApp.basket = {} // empty the basket
scans = ['sardines', 'sardines', 'sardines', 'sardines', 'sardines', 'cards', 'cards', 'cards']
totalPrice = sardines.price * (5 - 2) + cards.price * 2.5

checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)

// Use Case #5: Support a special in the form of "N for $X."', () => {
// specials
const batteriesSpecial = { type: 'nForX', name: 'batteries', buyQuantity: 3, salesPrice: 5.0 }

// Test 5a: add N-for-X specials'
specials = [batteriesSpecial]
// const specialsObj = { sardines: [1, 1, 1], cards: [2, 1, 0.5], batteries: [3, 5.0] }

checkoutOrderApp.addSpecials(specials)

// Test 6b: buy 3 for $5.00'
checkoutOrderApp.basket = {} // empty the basket
scans = ['batteries', 'batteries', 'batteries', 'batteries', 'batteries']
totalPrice = 5.0 + batteries.price * 2

checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)

// Use Case #7
// Test 7a: keep the total correct after invalidating a X-for-N special'

checkoutOrderApp.basket = {}

// calculate price with special
scans = []
for (let i = 0; i < 20; i++) scans.push('orange juice')
let expectedTotalWithSpecial = 30 + orangeJuice.price * 8
let actualTotalWithSpecial = checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)
let part1IsOkay = expectedTotalWithSpecial === actualTotalWithSpecial

// delete enough items to invalidate a special
let scansForRemoval = []
checkoutOrderApp.basket = {} // empty the basket
for (let i = 0; i < 10; i++) scansForRemoval.push('orange juice')
// verify that the new price without (special: price 4 for $10)
// 10 items = 4 @ $10 + 4 @ $10 + 2 @ reg price
let totalWithoutSpecial = 20 + orangeJuice.price * 2

// determine if there's a problem with the set up
totalWithoutSpecial = part1IsOkay ? totalWithoutSpecial : "part 1 ain't okay"

checkoutOrderApp.removeScannedItemsAndReturnTotalPrice(scansForRemoval)
console.log('is part1IsOkay?', part1IsOkay)

// Use Case #8: Support "Buy N, get M of equal or lesser value for %X off" on weighted items'
// Test 8a: add "equalOrLesser" special
const groundBeefSpecial = { type: 'equalOrLesser', name: 'ground beef', buyQuantity: 2, getDiscount: 0.5 }

specialsObj = {
  sardines: ['xOff', 1, 1, 1],
  cards: ['xOff', 2, 1, 0.5],
  batteries: ['nForX', 3, 5.0],
  lightbulbs: ['xOff', 2, 1, 1, 6],
  'orange juice': ['nForX', 4, 10, 12],
  'ground beef': ['equalOrLesser', 2, 0.5]
}

checkoutOrderApp.addSpecials(groundBeefSpecial)

// Test 8b: buy 2 pounds of ground beef, get 1 pound half off',
checkoutOrderApp.basket = {} // empty the basket
items = [soup, sardines, bananas, cards, batteries, lightbulbs, orangeJuice, groundBeef]
checkoutOrderApp.configurePricesAndReturnAnItemsList(items) // stock the item

scans = [['ground beef', 4]]
// special price = 2 @ reg price + 1 @ 1/2 price + 1 @ reg price
 totalPrice = 2 * groundBeef.price + (1 * groundBeef.price) / 2 + 1 * groundBeef.price

let actualPrice = checkoutOrderApp.scanItemsAndReturnTotalPrice(scans)

let rightAnswer = totalPrice === actualPrice

console.log('rightAnswer?', rightAnswer)

debugger
