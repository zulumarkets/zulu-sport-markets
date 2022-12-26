import { SportMarketInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import { Position, Side } from './options';

export const QUERY_KEYS = {
    Rewards: (networkId: NetworkId, period: number) => ['rewards', networkId, period],
    Markets: (networkId: NetworkId) => ['markets', networkId],
    ParlayMarkets: (networkId: NetworkId, account: string) => ['parlayMarkets', networkId, account],
    ParlayLeaderboard: (networkId: NetworkId) => ['parlayLeaderboard', networkId],
    SportMarkets: (networkId: NetworkId) => ['sportMarkets', networkId],
    SportMarketsNew: (networkId: NetworkId) => ['sportMarketsNew', networkId],
    ParlayAmmData: (networkId: NetworkId) => ['parlayAmmData', networkId],
    OpenSportMarkets: (networkId: NetworkId) => ['openSportMarkets', networkId],
    CanceledSportMarkets: (networkId: NetworkId) => ['canceledSportMarkets', networkId],
    ResolvedSportMarkets: (networkId: NetworkId) => ['resolvedSportMarkets', networkId],
    Market: (marketAddress: string, isSell: boolean) => ['market', marketAddress, isSell],
    MarketBalances: (marketAddress: string, walletAddress: string) => ['marketBalances', marketAddress, walletAddress],
    MarketCancellationOdds: (marketAddress: string) => ['marketCancellationOdds', marketAddress],
    PositionDetails: (
        marketAddress: string,
        position: Position,
        amount: number,
        stableIndex: number,
        networkId: NetworkId
    ) => ['positionDetails', marketAddress, position, amount, stableIndex, networkId],
    PositionSellPrice: (marketAddress: string, networkId: NetworkId, balances: any) => [
        'positionSellPrice',
        marketAddress,
        networkId,
        balances,
    ],
    AvailablePerSide: (marketAddress: string, side: Side) => ['availablePerSide', marketAddress, side],
    MarketTransactions: (marketAddress: string, networkId: NetworkId, walletAddress?: string) => [
        'market',
        'transactions',
        marketAddress,
        networkId,
        walletAddress,
    ],
    MarketDuration: (networkId: NetworkId) => ['marketDuration', networkId],
    UserTransactions: (walletAddress: string, networkId: NetworkId) => [
        'user',
        'transactions',
        walletAddress,
        networkId,
    ],
    WinningInfo: (walletAddress: string, networkId: NetworkId) => ['user', 'winningInfo', walletAddress, networkId],
    ClaimTx: (market: string, networkId: NetworkId) => ['claim', 'transactions', market, networkId],
    ClaimableCount: (walletAddress: string, networkId: NetworkId) => [
        'claimable',
        'count',
        'notification',
        walletAddress,
        networkId,
    ],
    UserTransactionsPerMarket: (walletAddress: string, marketAddress: string, networkId: NetworkId) => [
        'user',
        'market',
        'transactions',
        walletAddress,
        marketAddress,
        networkId,
    ],
    MarketsParameters: (networkId: NetworkId) => ['markets', 'parameters', networkId],
    Tags: (networkId: NetworkId) => ['tags', networkId],
    NormalizedOdds: (sportMarket: SportMarketInfo, networkId: NetworkId) => ['normalizedOdds', sportMarket, networkId],
    AccountPositions: (walletAddress: string, networkId: NetworkId) => ['positions', walletAddress, networkId],
    AccountPositionsProfile: (walletAddress: string, networkId: NetworkId) => [
        'accountPosition',
        walletAddress,
        networkId,
    ],
    ReferralTransaction: (walletAddress: string, networkId: NetworkId) => [
        'referralTransaction',
        walletAddress,
        networkId,
    ],
    Referrers: (networkId: NetworkId) => ['referrers', networkId],
    ReferredTraders: (walletAddress: string, networkId: NetworkId) => ['referredTraders', walletAddress, networkId],
    ReferralOverview: (walletAddress: string, networkId: NetworkId) => ['referralOverview', walletAddress, networkId],
    DiscountMarkets: (networkId: NetworkId) => ['discountMarkets', networkId],
    Wallet: {
        PaymentTokenBalance: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'paymentTokenBalance',
            walletAddress,
            networkId,
        ],
        GetsUSDWalletBalance: (walletAddress: string, networkId: NetworkId) => [
            'sUsd',
            'balance',
            walletAddress,
            networkId,
        ],
        TokenBalance: (token: string, walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'tokenBalance',
            token,
            walletAddress,
            networkId,
        ],
        MultipleCollateral: (walletAddress: string, networkId: NetworkId) => [
            'multipleCollateral',
            walletAddress,
            networkId,
        ],
        SwapApproveSpender: (networkId: NetworkId) => ['wallet', 'swap', 'approveSpender', networkId],
        GetUsdDefaultAmount: (networkId: NetworkId) => ['wallet', 'getUsdDefaultAmount', networkId],
        OvertimeVoucher: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'overtimeVoucher',
            walletAddress,
            networkId,
        ],
        Stats: (networkId: NetworkId, walletAddress: string) => ['wallet', 'stats', networkId, walletAddress],
    },
    Quiz: {
        Leaderboard: () => ['quiz', 'leaderboard'],
        Tweet: () => ['quiz', 'tweet'],
    },
    FavoriteTeam: (walletAddress: string, networkId: NetworkId) => ['favoriteTeam', walletAddress, networkId],
    Zebro: (networkId: NetworkId) => ['zebro', networkId],
    Vault: {
        Data: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'data', networkId],
        UserData: (vaultAddress: string, walletAddress: string, networkId: NetworkId) => [
            vaultAddress,
            'data',
            walletAddress,
            networkId,
        ],
        AllVaultsUserData: (walletAddress: string, networkId: NetworkId) => ['data', walletAddress, networkId],
        Trades: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'trades', networkId],
        PnL: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'pnl', networkId],
        UserTransactions: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'userTransactions', networkId],
    },
    Bungee: {
        Tokens: () => ['bungee', 'tokens'],
    },
};

export default QUERY_KEYS;
