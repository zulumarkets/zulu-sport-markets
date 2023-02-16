import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getAddress } from 'utils/formatters/ethers';
import { NetworkNameById } from 'utils/network';
import { RootState } from 'redux/rootReducer';
import { NetworkId } from 'types/network';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';

const sliceName = 'wallet';

export type WalletSliceState = {
    walletAddress: string | null;
    networkId: NetworkId;
    networkName: string;
    isDefaultNetwork: boolean;
};

const initialState: WalletSliceState = {
    walletAddress: null,
    networkId: DEFAULT_NETWORK_ID,
    networkName: NetworkNameById[DEFAULT_NETWORK_ID],
    isDefaultNetwork: true,
};

export const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        resetWallet: () => {
            return initialState;
        },
        updateWallet: (state, action: PayloadAction<Partial<WalletSliceState>>) => {
            const { payload } = action;
            const newState = {
                ...state,
                ...payload,
                walletAddress: payload.walletAddress ? getAddress(payload.walletAddress) : null,
            };

            return newState;
        },
        updateNetworkSettings: (
            state,
            action: PayloadAction<{
                networkId: NetworkId;
            }>
        ) => {
            const { networkId } = action.payload;

            state.networkId = networkId;
            state.networkName = NetworkNameById[networkId]?.toLowerCase();
            state.isDefaultNetwork = false;
        },
    },
});

export const getWalletState = (state: RootState) => state[sliceName];
export const getNetworkId = (state: RootState) => getWalletState(state).networkId;
export const getNetworkName = (state: RootState) => getWalletState(state).networkName;
export const getIsDefaultNetwork = (state: RootState) => getWalletState(state).isDefaultNetwork;
export const getNetwork = (state: RootState) => ({
    networkId: getNetworkId(state),
    networkName: getNetworkName(state),
    isDefaultNetwork: getIsDefaultNetwork(state),
});
export const getWalletAddress = (state: RootState) => getWalletState(state).walletAddress;
export const getIsWalletConnected = createSelector(getWalletAddress, (walletAddress) => walletAddress != null);
export const getWalletInfo = (state: RootState) => getWalletState(state);

export const { updateNetworkSettings, resetWallet, updateWallet } = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
