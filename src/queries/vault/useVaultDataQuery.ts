import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { VaultData } from 'types/vault';

const useVaultDataQuery = (networkId: NetworkId, options?: UseQueryOptions<VaultData | undefined>) => {
    return useQuery<VaultData | undefined>(
        QUERY_KEYS.Vault.Data(networkId),
        async () => {
            const vaultData: VaultData = {
                vaultStarted: false,
                maxAllowedDeposit: 0,
                round: 0,
                roundEndTime: 0,
                allocationNextRound: 0,
                allocationNextRoundPercentage: 0,
                allocationCurrentRound: 0,
                isRoundEnded: false,
                availableAllocationNextRound: 0,
                minDepositAmount: 0,
                maxAllowedUsers: 0,
                usersCurrentlyInVault: 0,
            };

            const { sportVaultContract } = networkConnector;
            try {
                if (sportVaultContract) {
                    const [
                        vaultStarted,
                        maxAllowedDeposit,
                        round,
                        roundEndTime,
                        availableAllocationNextRound,
                        minDepositAmount,
                        maxAllowedUsers,
                        usersCurrentlyInVault,
                    ] = await Promise.all([
                        sportVaultContract?.vaultStarted(),
                        sportVaultContract?.maxAllowedDeposit(),
                        sportVaultContract?.round(),
                        sportVaultContract?.getCurrentRoundEnd(),
                        sportVaultContract?.getAvailableToDeposit(),
                        sportVaultContract?.minDepositAmount(),
                        sportVaultContract?.maxAllowedUsers(),
                        sportVaultContract?.usersCurrentlyInVault(),
                    ]);

                    vaultData.vaultStarted = vaultStarted;
                    vaultData.maxAllowedDeposit = bigNumberFormatter(maxAllowedDeposit);
                    vaultData.round = Number(round);
                    vaultData.roundEndTime = Number(roundEndTime) * 1000;
                    vaultData.availableAllocationNextRound = bigNumberFormatter(availableAllocationNextRound);
                    vaultData.isRoundEnded = new Date().getTime() > vaultData.roundEndTime;
                    vaultData.minDepositAmount = bigNumberFormatter(minDepositAmount);
                    vaultData.maxAllowedUsers = Number(maxAllowedUsers);
                    vaultData.usersCurrentlyInVault = Number(usersCurrentlyInVault);

                    const [allocationCurrentRound, allocationNextRound] = await Promise.all([
                        sportVaultContract?.allocationPerRound(vaultData.round),
                        sportVaultContract?.capPerRound(vaultData.round + 1),
                    ]);

                    vaultData.allocationCurrentRound = bigNumberFormatter(allocationCurrentRound);
                    vaultData.allocationNextRound = bigNumberFormatter(allocationNextRound);
                    vaultData.allocationNextRoundPercentage =
                        (vaultData.allocationNextRound / vaultData.maxAllowedDeposit) * 100;

                    return vaultData;
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

export default useVaultDataQuery;
