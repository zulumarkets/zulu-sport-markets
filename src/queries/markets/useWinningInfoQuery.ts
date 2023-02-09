import { Position } from 'constants/options';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { ClaimTransaction, MarketTransaction, ParlayMarket, WinningInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    isParlayClaimable,
    updateTotalQuoteAndAmountFromContract,
} from 'utils/markets';

const useWinningInfoQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<WinningInfo>) => {
    const KEEPER_BOT_CALLER_ADDRESS = '0x3292e6583dfa145fc25cfe3a74d8f66846683633';

    return useQuery<WinningInfo>(
        QUERY_KEYS.WinningInfo(walletAddress, networkId),
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

                const allSinglesWinningAmounts = marketTransactions
                    .map((tx: MarketTransaction) => ({
                        ...tx,
                        position: Position[tx.position],
                    }))
                    .filter(
                        (tx: any) =>
                            convertPositionNameToPosition(tx.position) ===
                                convertFinalResultToResultType(tx.wholeMarket.finalResult) && tx.type === 'buy'
                    )
                    .map((tx: MarketTransaction) => tx.amount);

                const allSinglesSoldAmounts = marketTransactions
                    .filter((tx: any) => tx.type === 'sell')
                    .map((tx: MarketTransaction) => tx.paid);

                const allCanceledBuyMarkets = marketTransactions
                    .filter((tx: any) => tx.type === 'buy' && tx.wholeMarket.isCanceled)
                    .map((tx: MarketTransaction) => tx.wholeMarket.address);

                let allCanceledWinningAmounts: number[] = [];
                for (let i = 0; i < allCanceledBuyMarkets.length; i++) {
                    const [claimTransactions, childClaimTransactions] = await Promise.all([
                        thalesData.sportMarkets.claimTxes({
                            market: allCanceledBuyMarkets[i],
                            network: networkId,
                            account: walletAddress,
                        }),
                        thalesData.sportMarkets.claimTxes({
                            parentMarket: allCanceledBuyMarkets[i],
                            network: networkId,
                            account: walletAddress,
                        }),
                    ]);

                    // Filter keeper bot transactions
                    const claimedAmounts = [...claimTransactions, ...childClaimTransactions]
                        .filter((tx: ClaimTransaction) => tx?.caller?.toLowerCase() !== KEEPER_BOT_CALLER_ADDRESS)
                        .map((tx: ClaimTransaction) => tx.amount);

                    allCanceledWinningAmounts = [...claimedAmounts];
                }

                const highestWinningSingle =
                    allSinglesWinningAmounts.length > 0 ? Math.max(...allSinglesWinningAmounts) : 0;

                const allParlaysWinningAmounts = updateTotalQuoteAndAmountFromContract(parlayMarkets)
                    .filter((parlayMarket: ParlayMarket) => parlayMarket.won || isParlayClaimable(parlayMarket))
                    .map((parlayMarket: ParlayMarket) => parlayMarket.totalAmount);

                const highestWinningParlay =
                    allParlaysWinningAmounts.length > 0 ? Math.max(...allParlaysWinningAmounts) : 0;

                const highestWin =
                    highestWinningSingle > highestWinningParlay ? highestWinningSingle : highestWinningParlay;

                const totalWins: number =
                    allSinglesWinningAmounts.reduce((acc: number, val: number) => acc + val, 0) +
                    allSinglesSoldAmounts.reduce((acc: number, val: number) => acc + val, 0) +
                    allCanceledWinningAmounts.reduce((acc: number, val: number) => acc + val, 0) +
                    allParlaysWinningAmounts.reduce((acc: number, val: number) => acc + val, 0);

                return {
                    highestWin,
                    lifetimeWins: allSinglesWinningAmounts.length + allParlaysWinningAmounts.length,
                    totalWins,
                };
            } catch (e) {
                console.log(e);
                return { highestWin: 0, lifetimeWins: 0, totalWins: 0 };
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useWinningInfoQuery;
