// import * as mocha from 'mocha'
import { expect } from 'chai'
import NbgRates from './index'
import { Currency } from './index'

describe(">>> Testing convertation... >>>", function () {

    // set maximum timeout for async calls to 1 minute
    this.timeout(1 * 60 * 1000)

    const currencies = ["GEL", "AED", "AMD", "AUD", "AZN", "BGN", "BRL", "BYN", "CAD", "CHF", "CNY", "CZK", "DKK", "EGP", "EUR", "GBP", "HKD", "HUF", "ILS", "INR", "IRR", "ISK", "JPY", "KGS", "KRW", "KWD", "KZT", "MDL", "NOK", "NZD", "PLN", "QAR", "RON", "RSD", "RUB", "SEK", "SGD", "TJS", "TMT", "TRY", "UAH", "USD", "UZS", "ZAR"]

    let nbg: NbgRates

    before(async function() {
        nbg = new NbgRates(2)
        if (nbg._updatingPromise) {
            console.log('Updating exchange rates...')
            await nbg._updatingPromise
        }
    })

    it(`#Downloads all rates:`, async function() {
        console.log(await nbg.ratesAsync)
    })

    currencies.forEach((currency: Currency) => {
        // show exchange rates for GEL -> X
        it(`#Converts via "convertAsync()" from GEL to ${currency} and vice versa`, async function() {
            let amount = 1

            let gel = await nbg.convertAsync(amount, currency, "GEL")
            expect(gel).to.be.a('number')

            let xxx = await nbg.convertAsync(amount, "GEL", currency)
            expect(xxx).to.be.a('number')

            console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`)
            console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`)
        })

        it(`#Converts via "convert()" from GEL to ${currency} and vice versa`, function() {
            let amount = 1

            let gel = nbg.convert(amount, currency, "GEL")
            expect(gel).to.be.a('number')

            let xxx = nbg.convert(amount, "GEL", currency)
            expect(xxx).to.be.a('number')

            console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`)
            console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`)
        })
    })

})