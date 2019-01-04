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
    updating: Promise<any>;
    _lifetime: number;
    _updatingFlag: boolean;
    constructor(lifetime?: number, liveUpdate?: boolean);
    convertSync(currencyFrom: Currency, currencyTo: Currency, amount?: number): number;
    convert(currencyFrom: Currency, currencyTo: Currency, amount?: number): Promise<number>;
    rateSync(currency: Currency): number;
    rate(currency: Currency): Promise<number>;
    _check(): Promise<void>;
    _update(): Promise<void>;
}
