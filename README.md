# nbg-exchange-rates

[![Build Status](https://travis-ci.org/sergio-code/nbg-exchange-rates.svg?branch=master)](https://travis-ci.org/sergio-code/nbg-exchange-rates)
[![Coverage Status](https://coveralls.io/repos/github/sergio-code/nbg-exchange-rates/badge.svg?branch=master)](https://coveralls.io/github/sergio-code/nbg-exchange-rates?branch=master)

Nodejs TypeScript/JavaScript wrapper around official National Bank of Georgia [RSS Feed](https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/rss) with exchange [rates](https://nbg.gov.ge/en/monetary-policy/currency)

### Features:
* convert from any [currency in the list](https://nbg.gov.ge/en/monetary-policy/currency) to another (through georgian lari)
* cache
* periodical/live update

### There are one main method:

**convert(currencyFrom, currencyTo, amount)** / convertSync(currencyFrom, currencyTo, amount) - converts specified amount (by default 1) from one to another currency

### Usages:
* Rates will be updated only when methods is called (if cache is expired):
```ts

import NbgRates from 'nbg-exchange-rates'
import { Currency } from 'nbg-exchange-rates' // Currency type

// Don't automatically updaty in background
// Update only when some of methods is called
let liveUpdate = false
// Set cache to be valid for 10 minutes (600 seconds)
let lifeTime = 600

let nbg: NbgRates = new NbgRates(lifeTime, liveUpdate)

// sample of main code
;(async function () {
    let currencyFrom: Currency = "USD"
    let currencyTo: Currency = "RUB"
    let amount = 100
    let result = await nbg.convert(currencyFrom, currencyTo, amount)
    console.log(`100 ${currencyFrom} equals ${result.toFixed(2)} ${currencyTo}, according to NBoG rates`)
})()


```

* Rates will be updated in background periodically:
```ts

import NbgRates from 'nbg-exchange-rates'
import { Currency } from 'nbg-exchange-rates'

// Don't automatically updaty in background
// Update only when some of methods is called
let liveUpdate = true
// Set cache to be valid for 10 minutes (600 seconds)
// When liveUpdate is set to true
// this also sets the period for automatical backround update
let lifeTime = 600

let nbg: NbgRates = new NbgRates(lifeTime, liveUpdate)

// main code
;(async function () {
    await nbg.updatingPromise // TO BE SURE THAT DATA IS READY
    let currencyFrom: Currency = "USD"
    let currencyTo: Currency = "GEL"
    let amount = 100
    let result = nbg.convertSync(currencyFrom, currencyTo, amount)
    console.log(`100 ${currencyFrom} equals ${result.toFixed(2)} ${currencyTo}, according to NBoG rates`)
})()

```
