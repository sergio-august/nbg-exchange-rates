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
// import * as mocha from 'mocha'
const chai_1 = require("chai");
const index_1 = require("./index");
describe(">>> Testing convertation... >>>", function () {
    // set maximum timeout for async calls to 1 minute
    this.timeout(1 * 60 * 1000);
    const currencies = ["GEL", "AED", "AMD", "AUD", "AZN", "BGN", "BRL", "BYN", "CAD", "CHF", "CNY", "CZK", "DKK", "EGP", "EUR", "GBP", "HKD", "HUF", "ILS", "INR", "IRR", "ISK", "JPY", "KGS", "KRW", "KWD", "KZT", "MDL", "NOK", "NZD", "PLN", "QAR", "RON", "RSD", "RUB", "SEK", "SGD", "TJS", "TMT", "TRY", "UAH", "USD", "UZS", "ZAR"];
    let nbg;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            nbg = new index_1.default(2);
            if (nbg._updatingPromise) {
                console.log('Updating exchange rates...');
                yield nbg._updatingPromise;
            }
        });
    });
    it(`#Downloads all rates:`, function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(yield nbg.ratesAsync);
        });
    });
    currencies.forEach((currency) => {
        // show exchange rates for GEL -> X
        it(`#Converts via "convertAsync()" from GEL to ${currency} and vice versa`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                let amount = 1;
                let gel = yield nbg.convertAsync(amount, currency, "GEL");
                chai_1.expect(gel).to.be.a('number');
                let xxx = yield nbg.convertAsync(amount, "GEL", currency);
                chai_1.expect(xxx).to.be.a('number');
                console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`);
                console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`);
            });
        });
        it(`#Converts via "convert()" from GEL to ${currency} and vice versa`, function () {
            let amount = 1;
            let gel = nbg.convert(amount, currency, "GEL");
            chai_1.expect(gel).to.be.a('number');
            let xxx = nbg.convert(amount, "GEL", currency);
            chai_1.expect(xxx).to.be.a('number');
            console.log(`${amount} ${currency} = ${gel.toFixed(6)} GEL`);
            console.log(`${amount} GEL = ${xxx.toFixed(6)} ${currency}`);
        });
    });
});
//# sourceMappingURL=index.spec.js.map