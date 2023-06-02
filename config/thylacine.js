const puppeteerOpts = require('./puppeteer').options
const puppeteer = require('puppeteer')
const discord = require('./discord')

const thylacine = {
  log: false,
  browser: null,
  page: null,
  url: 'https://bourseauxbillets.philharmoniedeparis.fr/list/resaleProducts/?lang=fr&_ga=2.1430001.1932260610.1685699146-682790030.1685699146&dateFrom=07.07.2023&dateTo=07.07.2023',
  close: async () => {
    if (!thylacine.browser) return true
    await thylacine.browser.close().then(async () => {
      thylacine.browser = null
      if (thylacine.log) console.log(`Scrap finished for ${thylacine.url}`)
    })
  },
  init: async () => {
    try {
      thylacine.browser = await puppeteer.launch(puppeteerOpts)
      thylacine.page = await thylacine.browser.newPage()
      await thylacine.page.setViewport({width: 1900, height: 1000, deviceScaleFactor: 1})

      await thylacine.page.goto(thylacine.url, {waitUntil: 'networkidle2'})

      const title = await thylacine.page.title()

      await thylacine.page.waitForFunction(
        'document.querySelector("body").innerText.includes("Thylacine")'
      )
      if (thylacine.log) console.log(title)
      await thylacine.checkTicket()
    } catch (e) {
      console.error('[INIT] Failed', e)
    } finally {
      await thylacine.close()
    }
  },
  checkTicket: async () => {
    try {
      const ticketSoldOut = await thylacine.page.evaluate(() => {
        let xpath = '//div[text()="Thylacine"]'
        let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
        return matchingElement.closest('.product').matches('.no_availability')
      })

      if (!ticketSoldOut) {
        console.log('TICKET DISPONIBLE')
        await discord(`<@141895511643914240> TICKET THYLACINE DISPONIBLE -> https://bourseauxbillets.philharmoniedeparis.fr/list/resaleProducts/?lang=fr&_ga=2.1430001.1932260610.1685699146-682790030.1685699146&dateFrom=07.07.2023&dateTo=07.07.2023`)
      }
    } catch (e) {
      console.error('[checkTicket] Error', e)
      await thylacine.close()
    }
  },
}

module.exports = thylacine
