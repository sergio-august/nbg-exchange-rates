import axios from "axios"
import cheerio from "cheerio"
// @ts-ignore
import tableparser from "cheerio-tableparser"
import moment from "moment"

const rssUrl = "https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/rss"

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

export interface ICurrencyRateData {
    ratePerAmount: number // GEL per X foreign currency
    amount: number // X foreign currency
    rate: number // GEL per 1 foreign currency
    spell: string
}

export type IRatesCache = { [key in ForeignCurrency]?: ICurrencyRateData | undefined }

export default class NbgRates {
    public cache: IRatesCache | undefined = undefined
    public dateUpdated: Date | undefined = undefined
    public updatingPromise: Promise<any> | undefined = undefined
    public verbose: boolean
    public updatingFlag: boolean = false
    private lifetime: number

    constructor(lifetime?: number, liveUpdate: boolean = false, verbose: boolean = false) {
        this.verbose = verbose
        this.lifetime = lifetime || 2 * 60 * 60 // 7200 seconds = 2 hours
        this.update()
        if (liveUpdate) {
            setInterval(() => {
                this.update()
            }, this.lifetime * 1000)
        }
    }

    public convertSync = (currencyFrom: Currency, currencyTo: Currency, amount: number = 1): number => {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount
        } else if (currencyTo === "GEL") {
            // For example 100 USD = 266 GEL
            const rate = this.rateSync(currencyFrom as ForeignCurrency)
            return amount * rate
        } else if (currencyFrom === "GEL") {
            // For example 100 GEL = 37.57 USD
            const rate = this.rateSync(currencyTo as ForeignCurrency)
            return amount / rate
        } else {
            // For example 100 UAH = 3.65 USD
            const rateFrom = this.rateSync(currencyFrom as ForeignCurrency)
            const rateTo = this.rateSync(currencyTo as ForeignCurrency)
            return (amount * rateFrom) / rateTo
        }
    }

    public convert = async (currencyFrom: Currency, currencyTo: Currency, amount: number = 1): Promise<number> => {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount
        } else if (currencyTo === "GEL") {
            // For example 100 USD = 266 GEL
            const rate = await this.rate(currencyFrom as ForeignCurrency)
            return amount * rate
        } else if (currencyFrom === "GEL") {
            // For example 100 GEL = 37.57 USD
            const rate = await this.rate(currencyTo as ForeignCurrency)
            return amount / rate
        } else {
            // For example 100 UAH = 3.65 USD
            const rateFrom = await this.rate(currencyFrom as ForeignCurrency)
            const rateTo = await this.rate(currencyTo as ForeignCurrency)
            return (amount * rateFrom) / rateTo
        }
    }

    public rateSync = (currency: Currency): number => {
        if (currency === "GEL") {
            return 1
        }
        if (!this.cache) {
            throw new Error(`NBG Rates ERROR: cache is empty`)
        }
        if (!this.cache[currency]) {
            throw new Error(`NBG Rates ERROR: no ${currency} in cache`)
        }
        return this.cache[currency as ForeignCurrency]!.rate
    }

    public rate = async (currency: Currency): Promise<number> => {
        if (currency === "GEL") {
            return 1
        }
        await this.check()
        if (!this.cache) {
            throw new Error(`NBG Rates ERROR: cache is empty`)
        }
        if (!this.cache[currency]) {
            throw new Error(`NBG Rates ERROR: no ${currency} in cache`)
        }
        return this.cache[currency]!.rate
    }

    private check = async (): Promise<void> => {
        if (this.updatingPromise !== null) {
            await this.updatingPromise
        }

        if (moment().diff(this.dateUpdated, "seconds") > this.lifetime) {
            await this.update()
        }
    }

    private update = async (): Promise<void> => {
        if (this.verbose) {
            console.info("[nbg-exchange-rates]: updating exchange rates...")
        }

        this.updatingFlag = true

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
                const amount = parseInt(parsed[1][i], 10)
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
                console.error("FALLBACK TO CACHE")
                console.error(error) // will fallback to cache
            }
        } finally {
            this.updatingFlag = false
        }
    }
}
