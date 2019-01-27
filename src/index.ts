import axios from "axios"
import cheerio from "cheerio"
// @ts-ignore
import tableparser from "cheerio-tableparser"
import moment from "moment"

const rssUrl = "http://www.nbg.ge/rss.php"

export type ForeignCurrency =
    | "AED"
    | "AMD"
    | "AUD"
    | "AZN"
    | "BGN"
    | "BRL"
    | "BYN"
    | "CAD"
    | "CHF"
    | "CNY"
    | "CZK"
    | "DKK"
    | "EGP"
    | "EUR"
    | "GBP"
    | "HKD"
    | "HUF"
    | "ILS"
    | "INR"
    | "IRR"
    | "ISK"
    | "JPY"
    | "KGS"
    | "KRW"
    | "KWD"
    | "KZT"
    | "MDL"
    | "NOK"
    | "NZD"
    | "PLN"
    | "QAR"
    | "RON"
    | "RSD"
    | "RUB"
    | "SEK"
    | "SGD"
    | "TJS"
    | "TMT"
    | "TRY"
    | "UAH"
    | "USD"
    | "UZS"
    | "ZAR"

export type Currency = ForeignCurrency | "GEL"

export interface CurrencyRateData {
    ratePerAmount: number // GEL per X foreign currency
    amount: number // X foreign currency
    rate: number // GEL per 1 foreign currency
    spell: string
}

export type IRatesCache = {
    [key in ForeignCurrency]?: CurrencyRateData | undefined
}

export default class NbgRates {
    cache: IRatesCache | undefined = undefined
    dateUpdated: Date | undefined = undefined
    updatingPromise: Promise<any> | undefined = undefined
    _lifetime: number
    _updatingFlag: boolean = false

    constructor(lifetime?: number, liveUpdate: boolean = false) {
        this._lifetime = lifetime || 2 * 60 * 60 // 7200 seconds = 2 hours
        this._update()
        if (liveUpdate) {
            setInterval(() => {
                this._update()
            }, this._lifetime * 1000)
        }
    }

    convertSync(currencyFrom: Currency, currencyTo: Currency, amount: number = 1): number {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount
        } else if (currencyTo === "GEL") {
            // For example 100 USD = 266 GEL
            let rate = this.rateSync(currencyFrom as ForeignCurrency)
            return amount * rate
        } else if (currencyFrom === "GEL") {
            // For example 100 GEL = 37.57 USD
            let rate = this.rateSync(currencyTo as ForeignCurrency)
            return amount / rate
        } else {
            // For example 100 UAH = 3.65 USD
            let rateFrom = this.rateSync(currencyFrom as ForeignCurrency)
            let rateTo = this.rateSync(currencyTo as ForeignCurrency)
            return (amount * rateFrom) / rateTo
        }
    }

    async convert(currencyFrom: Currency, currencyTo: Currency, amount: number = 1): Promise<number> {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount
        } else if (currencyTo === "GEL") {
            // For example 100 USD = 266 GEL
            let rate = await this.rate(currencyFrom as ForeignCurrency)
            return amount * rate
        } else if (currencyFrom === "GEL") {
            // For example 100 GEL = 37.57 USD
            let rate = await this.rate(currencyTo as ForeignCurrency)
            return amount / rate
        } else {
            // For example 100 UAH = 3.65 USD
            let rateFrom = await this.rate(currencyFrom as ForeignCurrency)
            let rateTo = await this.rate(currencyTo as ForeignCurrency)
            return (amount * rateFrom) / rateTo
        }
    }

    rateSync(currency: Currency): number {
        if (currency === "GEL") {
            return 1
        }
        if (!this.cache) {
            throw new Error(`NBG Rates ERROR: cache is empty`)
        }
        if (!this.cache[currency]) {
            throw new Error(`NBG Rates ERROR: no ${currency} in cache`)
        }
        return this.cache[currency as ForeignCurrency]!["rate"]
    }

    async rate(currency: Currency): Promise<number> {
        if (currency === "GEL") {
            return 1
        }
        await this._check()
        if (!this.cache) {
            throw new Error(`NBG Rates ERROR: cache is empty`)
        }
        if (!this.cache[currency]) {
            throw new Error(`NBG Rates ERROR: no ${currency} in cache`)
        }
        return this.cache[currency]!["rate"]
    }

    private async _check(): Promise<void> {
        if (this.updatingPromise !== null) {
            await this.updatingPromise
        }

        if (moment().diff(this.dateUpdated, "seconds") > this._lifetime) {
            await this._update()
        }
    }

    private async _update(): Promise<void> {
        console.log("DEBUG: updating exchange rates...") // DEBUG
        this._updatingFlag = true

        try {
            this.updatingPromise = axios.get(rssUrl)
            const response = await this.updatingPromise
            const rss = cheerio.load(response.data, { xmlMode: true })
            const doc = cheerio.load(rss("description").text())
            tableparser(doc) // add .parsetable() method
            // @ts-ignore
            const parsed = doc("table").parsetable(false, false, true)
            const data: IRatesCache = {}
            parsed[0].forEach((item: ForeignCurrency, i: number) => {
                const amount = parseInt(parsed[1][i])
                data[item] = {
                    ratePerAmount: parsed[2][i], // GEL per X foreign currency
                    amount, // X foreign currency
                    rate: parsed[2][i] / amount, // GEL per 1 foreign currency
                    spell: parsed[1][i]
                }
            })
            this.cache = data
            this.dateUpdated = new Date()
        } catch (error) {
            if (this.cache === null) {
                // throw error if no failback data (in cache)
                throw error
            } else {
                console.error(error) // will fallback to cache
            }
        } finally {
            this._updatingFlag = false
        }
    }
}
