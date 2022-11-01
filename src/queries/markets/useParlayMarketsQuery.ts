import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket } from 'types/markets';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamNameString } from 'utils/formatters/string';

export const useParlayMarketsQuery = (
    account: string,
    networkId: NetworkId,
    minTimestamp?: number,
    maxTimestamp?: number,
    options?: UseQueryOptions<ParlayMarket[] | undefined>
) => {
    return useQuery<ParlayMarket[] | undefined>(
        QUERY_KEYS.ParlayMarkets(networkId, account),
        async () => {
            try {
                if (!account) return undefined;
                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    account,
                    network: networkId,
                    maxTimestamp,
                    minTimestamp,
                });

                const parlayMarketsModified = parlayMarkets.map((parlayMarket: ParlayMarket) => {
                    return {
                        ...parlayMarket,
                        sportMarkets: parlayMarket.sportMarkets.map((market) => {
                            return {
                                ...market,
                                homeTeam: market.isApex
                                    ? fixApexName(market.homeTeam)
                                    : fixLongTeamNameString(fixDuplicatedTeamName(market.homeTeam)),
                                awayTeam: market.isApex
                                    ? fixApexName(market.awayTeam)
                                    : fixLongTeamNameString(fixDuplicatedTeamName(market.awayTeam)),
                            };
                        }),
                    };
                });
                console.log('parlayMarketsModified ', parlayMarketsModified);
                return parlayMarketsModified;
            } catch (e) {
                console.log('E ', e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};
