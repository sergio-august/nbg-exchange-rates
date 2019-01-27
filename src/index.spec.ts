import { expect } from 'chai'
import NbgRates, { Currency } from './index'

describe(">>> Testing convertation... >>>", function () {

    // set maximum timeout for async calls to 20 seconds
    this.timeout(1 * 20 * 1000)

    const currencies: Currency[] = ["GEL", "AED", "AMD", "AUD", "AZN", "BGN", "BRL", "BYN", "CAD", "CHF", "CNY", "CZK", "DKK", "EGP", "EUR", "GBP", "HKD", "HUF", "ILS", "INR", "IRR", "ISK", "JPY", "KGS", "KRW", "KWD", "KZT", "MDL", "NOK", "NZD", "PLN", "QAR", "RON", "RSD", "RUB", "SEK", "SGD", "TJS", "TMT", "TRY", "UAH", "USD", "UZS", "ZAR"]
    let nbg: NbgRates

    it(`#Updating exchange rates:`, async function() {
        nbg = new NbgRates(3, false)
        if (nbg.updatingPromise) {
            await nbg.updatingPromise
        }
        console.log(nbg.cache)
    })

    currencies.forEach(currency => {
        // show exchange rates for GEL -> X

        it(`#Shows exchange rate via async "rate()" from ${currency} to GEL`, async function() {
            let gel = await nbg.rate(currency)
            console.log(`1 ${currency} = ${gel.toFixed(6)} GEL`)
            expect(gel).to.be.a('number')
        })

        it(`#Shows exchange rate via "rateSync()" from ${currency} to GEL`, function() {
            let gel = nbg.rateSync(currency)
            console.log(`1 ${currency} = ${gel.toFixed(6)} GEL`)
            expect(gel).to.be.a('number')
        })

        it(`#Converts via async "convert()" from GEL to ${currency} and vice versa`, async function() {
            let amount = 100

            let gel = await nbg.convert(currency, "GEL", amount)
            expect(gel).to.be.a('number')

            let xxx = await nbg.convert("GEL", currency, amount)
            expect(xxx).to.be.a('number')

            console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`)
            console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`)
        })

        it(`#Converts via "convertSync()" from GEL to ${currency} and vice versa`, function() {
            let amount = 100

            let gel = nbg.convertSync(currency, "GEL", amount)
            expect(gel).to.be.a('number')

            let xxx = nbg.convertSync("GEL", currency, amount)
            expect(xxx).to.be.a('number')

            console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`)
            console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`)
        })

    })

})