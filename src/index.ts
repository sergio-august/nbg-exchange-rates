import axios from 'axios'
import * as cheerio from 'cheerio'
import * as tableparser from 'cheerio-tableparser'
import * as moment from 'moment'

const rssUrl = 'http://www.nbg.ge/rss.php'

export type ForeignCurrency = 'AED'
    | 'AMD'
    | 'AUD'
    | 'AZN'
    | 'BGN'
    | 'BRL'
    | 'BYN'
    | 'CAD'
    | 'CHF'
    | 'CNY'
    | 'CZK'
    | 'DKK'
    | 'EGP'
    | 'EUR'
    | 'GBP'
    | 'HKD'
    | 'HUF'
    | 'ILS'
    | 'INR'
    | 'IRR'
    | 'ISK'
    | 'JPY'
    | 'KGS'
    | 'KRW'
    | 'KWD'
    | 'KZT'
    | 'MDL'
    | 'NOK'
    | 'NZD'
    | 'PLN'
    | 'QAR'
    | 'RON'
    | 'RSD'
    | 'RUB'
    | 'SEK'
    | 'SGD'
    | 'TJS'
    | 'TMT'
    | 'TRY'
    | 'UAH'
    | 'USD'
    | 'UZS'
    | 'ZAR'

export type Currency = ForeignCurrency | 'GEL'

export interface CurrencyRateData {
    ratePerAmount: number // GEL per X foreign currency
    amount: number // X foreign currency
    rate: number // GEL per 1 foreign currency
    spell: string
}

export default class NbgRates {
    cache: object = null
    updated: Date
    _lifetime: number
    _updating: boolean = false
    _updatingPromise: Promise<any> = null
    _updateIntervalId: number

    constructor(lifetime?: number, liveUpdate: boolean = false) {
        this._lifetime = lifetime || 2 * 60 * 60 // 7200 seconds = 2 hours
        this._update()
        if (liveUpdate) {
            this._updateIntervalId = setInterval(() => {
                this._update(), this._lifetime
            })
        }
    }

    get rates(): object {
        return this.cache
    }

    get ratesAsync(): Promise<object> {
        return this.getAllRatesAsync()
    }

    async getAllRatesAsync(): Promise<object> {
        await this._check()
        return this.cache
    }

    convert(amount: number, currencyFrom: Currency, currencyTo: Currency): number {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount
        } else if (currencyTo === 'GEL') {
            // For example 100 USD = 266 GEL
            let rate = this.rate(currencyFrom as ForeignCurrency)
            return amount * rate
        } else if (currencyFrom === 'GEL') {
            // For example 100 GEL = 37.57 USD
            let rate = this.rate(currencyTo as ForeignCurrency)
            return amount / rate
        } else {
            // For example 100 UAH = 3.65 USD
            let rateFrom = this.rate(currencyFrom as ForeignCurrency)
            let rateTo = this.rate(currencyTo as ForeignCurrency)
            return (amount * rateFrom) / rateTo
        }
    }

    async convertAsync(amount: number, currencyFrom: Currency, currencyTo: Currency): Promise<number> {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount
        } else if (currencyTo === 'GEL') {
            // For example 100 USD = 266 GEL
            let rate = await this.rateAsync(currencyFrom as ForeignCurrency)
            return amount * rate
        } else if (currencyFrom === 'GEL') {
            // For example 100 GEL = 37.57 USD
            let rate = await this.rateAsync(currencyTo as ForeignCurrency)
            return amount / rate
        } else {
            // For example 100 UAH = 3.65 USD
            let rateFrom = await this.rateAsync(currencyFrom as ForeignCurrency)
            let rateTo = await this.rateAsync(currencyTo as ForeignCurrency)
            return (amount * rateFrom) / rateTo
        }
    }

    rate(currency: ForeignCurrency): number {
        return this.cache[currency]['rate']
    }

    async rateAsync(currency: ForeignCurrency): Promise<number> {
        await this._check()
        return this.cache[currency]['rate']
    }

    async _check(): Promise<void> {
        if (this._updatingPromise !== null) {
            await this._updatingPromise
        }

        if (moment().diff(this.updated, 'seconds') > this._lifetime) {
            await this._update()
        }
    }

    async _update(): Promise<void> {
        console.log("DEBUG: updating exchange rates...") // DEBUG
        this._updating = true

        try {
            this._updatingPromise = axios.get(rssUrl)
            const response = await this._updatingPromise
            const rss = cheerio.load(response.data, { xmlMode: true })
            const doc = cheerio.load(rss('description').text())
            tableparser(doc) // add .parsetable() method
            // @ts-ignore
            const parsed = doc('table').parsetable(false, false, true)
            const data = {}
            parsed[0].forEach((item, i) => {
                const amount = parseInt(parsed[1][i])
                data[item] = {
                    ratePerAmount: parsed[2][i], // GEL per X foreign currency
                    amount, // X foreign currency
                    rate: parsed[2][i] / amount, // GEL per 1 foreign currency
                    spell: parsed[1][i]
                }
            })
            this.cache = data
            this.updated = new Date()
        } catch (error) {
            if (this.cache === null) {
                // throw error if no failback data (in cache)
                throw error
            } else {
                console.error(error) // will fallback to cache
            }
        } finally {
            this._updating = false
        }
    }
}
