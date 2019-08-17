function checkoutOrderTotal (entry, details) {
  let result = ''

  if (entry === 'add') {
    result = 'Items:\n'
    let itemList = Array.isArray(details) ? details : [details]

    itemList.forEach(item => {
      result += `${item.name} @ $${item.price}\n`
    })

    console.log(result)
  }
  
  
  return result
}

module.exports = {
  checkoutOrderTotal
}
