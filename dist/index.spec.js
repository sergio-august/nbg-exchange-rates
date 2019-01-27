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
const chai_1 = require("chai");
const index_1 = __importDefault(require("./index"));
describe(">>> Testing convertation... >>>", function () {
    // set maximum timeout for async calls to 20 seconds
    this.timeout(1 * 20 * 1000);
    const currencies = ["GEL", "AED", "AMD", "AUD", "AZN", "BGN", "BRL", "BYN", "CAD", "CHF", "CNY", "CZK", "DKK", "EGP", "EUR", "GBP", "HKD", "HUF", "ILS", "INR", "IRR", "ISK", "JPY", "KGS", "KRW", "KWD", "KZT", "MDL", "NOK", "NZD", "PLN", "QAR", "RON", "RSD", "RUB", "SEK", "SGD", "TJS", "TMT", "TRY", "UAH", "USD", "UZS", "ZAR"];
    let nbg;
    it(`#Updating exchange rates:`, function () {
        return __awaiter(this, void 0, void 0, function* () {
            nbg = new index_1.default(3, false);
            if (nbg.updatingPromise) {
                yield nbg.updatingPromise;
            }
            console.log(nbg.cache);
        });
    });
    currencies.forEach(currency => {
        // show exchange rates for GEL -> X
        it(`#Shows exchange rate via async "rate()" from ${currency} to GEL`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                let gel = yield nbg.rate(currency);
                console.log(`1 ${currency} = ${gel.toFixed(6)} GEL`);
                chai_1.expect(gel).to.be.a('number');
            });
        });
        it(`#Shows exchange rate via "rateSync()" from ${currency} to GEL`, function () {
            let gel = nbg.rateSync(currency);
            console.log(`1 ${currency} = ${gel.toFixed(6)} GEL`);
            chai_1.expect(gel).to.be.a('number');
        });
        it(`#Converts via async "convert()" from GEL to ${currency} and vice versa`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                let amount = 100;
                let gel = yield nbg.convert(currency, "GEL", amount);
                chai_1.expect(gel).to.be.a('number');
                let xxx = yield nbg.convert("GEL", currency, amount);
                chai_1.expect(xxx).to.be.a('number');
                console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`);
                console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`);
            });
        });
        it(`#Converts via "convertSync()" from GEL to ${currency} and vice versa`, function () {
            let amount = 100;
            let gel = nbg.convertSync(currency, "GEL", amount);
            chai_1.expect(gel).to.be.a('number');
            let xxx = nbg.convertSync("GEL", currency, amount);
            chai_1.expect(xxx).to.be.a('number');
            console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`);
            console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`);
        });
    });
});
//# sourceMappingURL=index.spec.js.map