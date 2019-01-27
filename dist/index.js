"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
// @ts-ignore
const cheerio_tableparser_1 = __importDefault(require("cheerio-tableparser"));
const moment_1 = __importDefault(require("moment"));
const rssUrl = "http://www.nbg.ge/rss.php";
class NbgRates {
    constructor(lifetime, liveUpdate = false, verbose = false) {
        this.cache = undefined;
        this.dateUpdated = undefined;
        this.updatingPromise = undefined;
        this.updatingFlag = false;
        this.convertSync = (currencyFrom, currencyTo, amount = 1) => {
            if (currencyFrom === currencyTo) {
                // no convertation
                return amount;
            }
            else if (currencyTo === "GEL") {
                // For example 100 USD = 266 GEL
                const rate = this.rateSync(currencyFrom);
                return amount * rate;
            }
            else if (currencyFrom === "GEL") {
                // For example 100 GEL = 37.57 USD
                const rate = this.rateSync(currencyTo);
                return amount / rate;
            }
            else {
                // For example 100 UAH = 3.65 USD
                const rateFrom = this.rateSync(currencyFrom);
                const rateTo = this.rateSync(currencyTo);
                return (amount * rateFrom) / rateTo;
            }
        };
        this.convert = (currencyFrom, currencyTo, amount = 1) => __awaiter(this, void 0, void 0, function* () {
            if (currencyFrom === currencyTo) {
                // no convertation
                return amount;
            }
            else if (currencyTo === "GEL") {
                // For example 100 USD = 266 GEL
                const rate = yield this.rate(currencyFrom);
                return amount * rate;
            }
            else if (currencyFrom === "GEL") {
                // For example 100 GEL = 37.57 USD
                const rate = yield this.rate(currencyTo);
                return amount / rate;
            }
            else {
                // For example 100 UAH = 3.65 USD
                const rateFrom = yield this.rate(currencyFrom);
                const rateTo = yield this.rate(currencyTo);
                return (amount * rateFrom) / rateTo;
            }
        });
        this.rateSync = (currency) => {
            if (currency === "GEL") {
                return 1;
            }
            if (!this.cache) {
                throw new Error(`NBG Rates ERROR: cache is empty`);
            }
            if (!this.cache[currency]) {
                throw new Error(`NBG Rates ERROR: no ${currency} in cache`);
            }
            return this.cache[currency].rate;
        };
        this.rate = (currency) => __awaiter(this, void 0, void 0, function* () {
            if (currency === "GEL") {
                return 1;
            }
            yield this.check();
            if (!this.cache) {
                throw new Error(`NBG Rates ERROR: cache is empty`);
            }
            if (!this.cache[currency]) {
                throw new Error(`NBG Rates ERROR: no ${currency} in cache`);
            }
            return this.cache[currency].rate;
        });
        this.check = () => __awaiter(this, void 0, void 0, function* () {
            if (this.updatingPromise !== null) {
                yield this.updatingPromise;
            }
            if (moment_1.default().diff(this.dateUpdated, "seconds") > this.lifetime) {
                yield this.update();
            }
        });
        this.update = () => __awaiter(this, void 0, void 0, function* () {
            if (this.verbose) {
                console.info("[nbg-exchange-rates]: updating exchange rates...");
            }
            this.updatingFlag = true;
            try {
                this.updatingPromise = axios_1.default.get(rssUrl);
                const response = yield this.updatingPromise;
                const rss = cheerio_1.default.load(response.data, { xmlMode: true });
                const doc = cheerio_1.default.load(rss("description").text());
                cheerio_tableparser_1.default(doc); // add .parsetable() method
                // @ts-ignore
                const parsed = doc("table").parsetable(false, false, true);
                const data = {};
                parsed[0].forEach((item, i) => {
                    const amount = parseInt(parsed[1][i], 10);
                    data[item] = {
                        ratePerAmount: parsed[2][i],
                        amount,
                        rate: parsed[2][i] / amount,
                        spell: parsed[1][i]
                    };
                });
                this.cache = data;
                this.dateUpdated = new Date();
            }
            catch (error) {
                if (this.cache === null) {
                    // throw error if no failback data (in cache)
                    throw error;
                }
                else {
                    console.error("FALLBACK TO CACHE");
                    console.error(error); // will fallback to cache
                }
            }
            finally {
                this.updatingFlag = false;
            }
        });
        this.verbose = verbose;
        this.lifetime = lifetime || 2 * 60 * 60; // 7200 seconds = 2 hours
        this.update();
        if (liveUpdate) {
            setInterval(() => {
                this.update();
            }, this.lifetime * 1000);
        }
    }
}
exports.default = NbgRates;
//# sourceMappingURL=index.js.map