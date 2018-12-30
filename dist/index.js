"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio = require("cheerio");
const tableparser = require("cheerio-tableparser");
const moment = require("moment");
const rssUrl = 'http://www.nbg.ge/rss.php';
class NbgRates {
    constructor(lifetime, liveUpdate = false) {
        this.cache = null;
        this._updating = false;
        this._updatingPromise = null;
        this._lifetime = lifetime || 2 * 60 * 60; // 7200 seconds = 2 hours
        this._update();
        if (liveUpdate) {
            this._updateIntervalId = setInterval(() => {
                this._update(), this._lifetime;
            });
        }
    }
    get rates() {
        return this.cache;
    }
    get ratesAsync() {
        return this.getAllRatesAsync();
    }
    getAllRatesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._check();
            return this.cache;
        });
    }
    convert(amount, currencyFrom, currencyTo) {
        if (currencyFrom === currencyTo) {
            // no convertation
            return amount;
        }
        else if (currencyTo === 'GEL') {
            // For example 100 USD = 266 GEL
            let rate = this.rate(currencyFrom);
            return amount * rate;
        }
        else if (currencyFrom === 'GEL') {
            // For example 100 GEL = 37.57 USD
            let rate = this.rate(currencyTo);
            return amount / rate;
        }
        else {
            // For example 100 UAH = 3.65 USD
            let rateFrom = this.rate(currencyFrom);
            let rateTo = this.rate(currencyTo);
            return (amount * rateFrom) / rateTo;
        }
    }
    convertAsync(amount, currencyFrom, currencyTo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (currencyFrom === currencyTo) {
                // no convertation
                return amount;
            }
            else if (currencyTo === 'GEL') {
                // For example 100 USD = 266 GEL
                let rate = yield this.rateAsync(currencyFrom);
                return amount * rate;
            }
            else if (currencyFrom === 'GEL') {
                // For example 100 GEL = 37.57 USD
                let rate = yield this.rateAsync(currencyTo);
                return amount / rate;
            }
            else {
                // For example 100 UAH = 3.65 USD
                let rateFrom = yield this.rateAsync(currencyFrom);
                let rateTo = yield this.rateAsync(currencyTo);
                return (amount * rateFrom) / rateTo;
            }
        });
    }
    rate(currency) {
        return this.cache[currency]['rate'];
    }
    rateAsync(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._check();
            return this.cache[currency]['rate'];
        });
    }
    _check() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._updatingPromise !== null) {
                yield this._updatingPromise;
            }
            if (moment().diff(this.updated, 'seconds') > this._lifetime) {
                yield this._update();
            }
        });
    }
    _update() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DEBUG: updating exchange rates..."); // DEBUG
            this._updating = true;
            try {
                this._updatingPromise = axios_1.default.get(rssUrl);
                const response = yield this._updatingPromise;
                const rss = cheerio.load(response.data, { xmlMode: true });
                const doc = cheerio.load(rss('description').text());
                tableparser(doc); // add .parsetable() method
                // @ts-ignore
                const parsed = doc('table').parsetable(false, false, true);
                const data = {};
                parsed[0].forEach((item, i) => {
                    const amount = parseInt(parsed[1][i]);
                    data[item] = {
                        ratePerAmount: parsed[2][i],
                        amount,
                        rate: parsed[2][i] / amount,
                        spell: parsed[1][i]
                    };
                });
                this.cache = data;
                this.updated = new Date();
            }
            catch (error) {
                if (this.cache === null) {
                    // throw error if no failback data (in cache)
                    throw error;
                }
                else {
                    console.error(error); // will fallback to cache
                }
            }
            finally {
                this._updating = false;
            }
        });
    }
}
exports.default = NbgRates;
//# sourceMappingURL=index.js.map