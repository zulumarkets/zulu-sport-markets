import { Position } from 'constants/options';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { MarketTransaction, ParlayMarket, LosingInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    updateTotalQuoteAndAmountFromContract,
} from 'utils/markets';

const useLosingInfoQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<LosingInfo>) => {
    return useQuery<LosingInfo>(
        QUERY_KEYS.LosingInfo(walletAddress, networkId),
        async () => {
            try {
                const [marketTransactions, parlayMarkets] = await Promise.all([
                    thalesData.sportMarkets.marketTransactions({
                        account: walletAddress,
                        network: networkId,
                    }),
                    thalesData.sportMarkets.parlayMarkets({
                        account: walletAddress,
                        network: networkId,
                    }),
                ]);

                const allSinglesBuyLosingAmounts = marketTransactions
                    .map((tx: MarketTransaction) => ({
                        ...tx,
                        position: Position[tx.position],
                    }))
                    .filter((tx: any) => tx.type === 'buy')
                    .map((tx: MarketTransaction) => tx.paid);

                const isMarketPositionWonPresent = (address: string, position: any) => {
                    // Check if there is the same market with the same position that user won
                    const wonTransactions = marketTransactions.filter(
                        (tx: any) =>
                            tx.wholeMarket.address === address &&
                            tx.position == position &&
                            convertPositionNameToPosition(Position[tx.position]) ===
                                convertFinalResultToResultType(tx.wholeMarket.finalResult) &&
                            tx.type === 'buy'
                    );

                    return wonTransactions.length > 0;
                };
                const allSinglesSellLosingAmounts = marketTransactions
                    .filter(
                        (tx: any) =>
                            tx.type === 'sell' &&
                            !tx.wholeMarket.isCanceled &&
                            isMarketPositionWonPresent(tx.wholeMarket.address, tx.position)
                    )
                    .map((tx: MarketTransaction) => tx.amount);

                const allParlaysLosingAmounts = updateTotalQuoteAndAmountFromContract(parlayMarkets).map(
                    (parlayMarket: ParlayMarket) => parlayMarket.sUSDPaid
                );

                const totalLoss: number =
                    allSinglesBuyLosingAmounts.reduce((acc: number, val: number) => acc + val, 0) +
                    allSinglesSellLosingAmounts.reduce((acc: number, val: number) => acc + val, 0) +
                    allParlaysLosingAmounts.reduce((acc: number, val: number) => acc + val, 0);

                return {
                    totalLoss,
                };
            } catch (e) {
                console.log(e);
                return { totalLoss: 0 };
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useLosingInfoQuery;
