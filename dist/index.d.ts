export declare type ForeignCurrency = 'AED' | 'AMD' | 'AUD' | 'AZN' | 'BGN' | 'BRL' | 'BYN' | 'CAD' | 'CHF' | 'CNY' | 'CZK' | 'DKK' | 'EGP' | 'EUR' | 'GBP' | 'HKD' | 'HUF' | 'ILS' | 'INR' | 'IRR' | 'ISK' | 'JPY' | 'KGS' | 'KRW' | 'KWD' | 'KZT' | 'MDL' | 'NOK' | 'NZD' | 'PLN' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'SEK' | 'SGD' | 'TJS' | 'TMT' | 'TRY' | 'UAH' | 'USD' | 'UZS' | 'ZAR';
export declare type Currency = ForeignCurrency | 'GEL';
export interface CurrencyRateData {
    ratePerAmount: number;
    amount: number;
    rate: number;
    spell: string;
}
export default class NbgRates {
    cache: object;
    updated: Date;
    _lifetime: number;
    _updating: boolean;
    _updatingPromise: Promise<any>;
    _updateIntervalId: number;
    constructor(lifetime?: number, liveUpdate?: boolean);
    readonly rates: object;
    readonly ratesAsync: Promise<object>;
    getAllRatesAsync(): Promise<object>;
    convert(amount: number, currencyFrom: Currency, currencyTo: Currency): number;
    convertAsync(amount: number, currencyFrom: Currency, currencyTo: Currency): Promise<number>;
    rate(currency: ForeignCurrency): number;
    rateAsync(currency: ForeignCurrency): Promise<number>;
    _check(): Promise<void>;
    _update(): Promise<void>;
}
