import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { UserVaultData } from 'types/vault';

const useUserVaultDataQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<UserVaultData | undefined>
) => {
    return useQuery<UserVaultData | undefined>(
        QUERY_KEYS.Vault.UserData(walletAddress, networkId),
        async () => {
            const userVaultData: UserVaultData = {
                balanceCurrentRound: 0,
                balanceNextRound: 0,
                balanceTotal: 0,
                isWithdrawalRequested: false,
                hasDepositForCurrentRound: false,
                hasDepositForNextRound: false,
            };

            const { sportVaultContract } = networkConnector;
            try {
                if (sportVaultContract) {
                    const [round] = await Promise.all([sportVaultContract?.round()]);

                    const [balanceCurrentRound, balanceNextRound, withdrawalRequested] = await Promise.all([
                        sportVaultContract?.balancesPerRound(Number(round), walletAddress),
                        sportVaultContract?.balancesPerRound(Number(round) + 1, walletAddress),
                        sportVaultContract?.withdrawalRequested(walletAddress),
                    ]);

                    userVaultData.balanceCurrentRound = bigNumberFormatter(balanceCurrentRound);
                    userVaultData.balanceNextRound = bigNumberFormatter(balanceNextRound);
                    userVaultData.balanceTotal = userVaultData.balanceCurrentRound + userVaultData.balanceNextRound;
                    userVaultData.isWithdrawalRequested = withdrawalRequested;
                    userVaultData.hasDepositForCurrentRound = userVaultData.balanceCurrentRound > 0;
                    userVaultData.hasDepositForNextRound = userVaultData.balanceNextRound > 0;

                    return userVaultData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useUserVaultDataQuery;
