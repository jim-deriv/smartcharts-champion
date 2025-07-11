import { TGetQuotesRequest, TickSpotData } from 'src/types/api-types';
import { action, computed, observable, when, makeObservable } from 'mobx';
import Context from 'src/components/ui/Context';
import MainStore from '.';
import { TBar, TGetQuotesResult, TQuote } from '../types';

export default class LastDigitStatsStore {
    mainStore: MainStore;
    bars: TBar[] = [];
    // api tick
    lastTick?: TickSpotData | null = null;

    constructor(mainStore: MainStore) {
        makeObservable(this, {
            bars: observable,
            lastTick: observable,
            decimalPlaces: computed,
            isVisible: computed,
            marketDisplayName: computed,
            shouldMinimiseLastDigits: computed,
            updateLastDigitStats: action.bound,
            onMasterDataUpdate: action.bound,
            updateBars: action.bound,
        });

        this.mainStore = mainStore;
        // since last digits stats is going to be rendered in deriv-app
        // we always keep track of the last digit stats.
        when(
            () => !!this.context,
            () => {
                this.lastSymbol = this.marketDisplayName;
                // TODO: call onMasterDataUpdate on symbol change.
                this.mainStore.chart.feed?.onMasterDataUpdate(this.onMasterDataUpdate);
                this.mainStore.chart.feed?.onMasterDataReinitialize(() => {
                    if (this.context && this.mainStore.chart.feed) {
                        this.mainStore.chart.feed.offMasterDataUpdate(this.onMasterDataUpdate);
                        this.mainStore.chart.feed.onMasterDataUpdate(this.onMasterDataUpdate);
                    }
                });
            }
        );
    }
    get context(): Context | null {
        return this.mainStore.chart.context;
    }

    count = 1000;
    digits: number[] = [];
    latestData: number[] = [];
    lastSymbol = '';

    get api() {
        return this.mainStore.chart.api;
    }
    get decimalPlaces() {
        return this.mainStore.chart.currentActiveSymbol?.decimal_places || 2;
    }
    get isVisible() {
        return this.mainStore.state.showLastDigitStats;
    }
    get marketDisplayName(): string {
        return this.mainStore.chart.currentActiveSymbol ? this.mainStore.chart.currentActiveSymbol.name : '';
    }
    get shouldMinimiseLastDigits() {
        return this.mainStore.state.shouldMinimiseLastDigits;
    }

    async updateLastDigitStats(response?: TGetQuotesResult) {
        if (!this.context || !this.mainStore.chart.currentActiveSymbol) return;
        this.digits = [];
        this.bars = [];
        this.latestData = [];
        for (let i = 0; i < 10; i++) {
            this.digits.push(0);
            this.bars.push({ height: 0, cName: '' });
        }

        const quotes =
            response ||
            (await this.api?.getQuotes({
                symbol: this.mainStore.chart.currentActiveSymbol.symbol,
                count: this.count,
            } as TGetQuotesRequest));
        this.latestData = quotes?.history?.prices ? quotes.history.prices : [];

        if (!this.context || !this.mainStore.chart.currentActiveSymbol) return;
        this.latestData.forEach(price => {
            const lastDigit = (+price).toFixed(this.decimalPlaces).slice(-1);
            this.digits[+lastDigit]++;
        });
        this.updateBars();
    }
    onMasterDataUpdate({ Close, tick }: TQuote & { Close: number }) {
        if (!this.context || !this.mainStore.chart.currentActiveSymbol || !this.mainStore.lastDigitStats.isVisible) return;
        this.lastTick = tick;
        if (this.marketDisplayName !== this.lastSymbol) {
            this.lastSymbol = this.marketDisplayName;
            // Symbol has changed
            this.updateLastDigitStats();
        } else if (this.latestData.length) {
            const firstDigit = (+(this.latestData.shift() as number)).toFixed(this.decimalPlaces).slice(-1);
            const price = (+Close).toFixed(this.decimalPlaces);
            const lastDigit = price.slice(-1);
            this.latestData.push(+price);
            this.digits[+lastDigit]++;
            this.digits[+firstDigit]--;
            this.updateBars();
        }
    }
    updateBars() {
        const min = Math.min(...this.digits);
        const max = Math.max(...this.digits);
        this.digits.forEach((digit, idx) => {
            this.bars[idx].height = (digit * 100) / this.count;
            if (digit === min) this.bars[idx].cName = 'min';
            else if (digit === max) this.bars[idx].cName = 'max';
            else this.bars[idx].cName = '';
        });
        this.bars = this.bars.slice(0); // force array update
    }
}
