import React, { useMemo } from 'react';
import {
    AssetContainer,
    CollateralContainer,
    CollateralIcon,
    Container,
    Label,
    LabelValueContainer,
    TokenBalance,
} from './styled-components';
// import CurrencyIcon from 'components/Currency/v2/CurrencyIcon';
import { getStableIcon, StablecoinKey } from 'utils/collaterals';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { formatCurrency } from 'utils/formatters/number';
import { OvertimeVoucher } from 'types/tokens';
import { ReactComponent as OvertimeVoucherIcon } from 'assets/images/overtime-voucher.svg';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
    overtimeVoucher?: OvertimeVoucher;
    isVoucherSelected: boolean;
    setIsVoucherSelected: any;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
    overtimeVoucher,
    isVoucherSelected,
    setIsVoucherSelected,
}) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const stableBalances = useMemo(() => {
        return multipleStableBalances.data;
    }, [multipleStableBalances.data]);

    return (
        <Container>
            <LabelValueContainer>
                <Label>{t('market.pay-with')}:</Label>
                {/* <CollateralName>{collateralArray[selectedItem]}</CollateralName> */}
            </LabelValueContainer>
            <AssetContainer>
                {overtimeVoucher && (
                    <CollateralContainer>
                        <CollateralIcon active={isVoucherSelected}>
                            <OvertimeVoucherIcon
                                onClick={() => {
                                    setIsVoucherSelected(true);
                                    onChangeCollateral(0);
                                }}
                                style={{
                                    ...(isVoucherSelected
                                        ? {
                                              opacity: '1',
                                          }
                                        : {
                                              opacity: '0.5',
                                          }),
                                    marginRight: 7,
                                    width: '40px',
                                    height: '40px',
                                }}
                            />
                        </CollateralIcon>
                        <TokenBalance>{formatCurrency(overtimeVoucher.remainingAmount, 2)}</TokenBalance>
                    </CollateralContainer>
                )}
                {collateralArray.length &&
                    collateralArray.map((item, index) => {
                        const AssetIcon = getStableIcon(item as StablecoinKey);
                        return (
                            <CollateralContainer key={index + 'container'}>
                                <CollateralIcon active={selectedItem == index} key={index}>
                                    <AssetIcon
                                        key={index}
                                        onClick={() => {
                                            setIsVoucherSelected(false);
                                            onChangeCollateral(index);
                                        }}
                                        style={{
                                            ...(selectedItem == index && !isVoucherSelected
                                                ? {
                                                      opacity: '1',
                                                  }
                                                : {
                                                      opacity: '0.5',
                                                  }),
                                            marginRight: 7,
                                            width: '40px',
                                            height: '40px',
                                        }}
                                    />
                                </CollateralIcon>
                                <TokenBalance>
                                    {stableBalances ? formatCurrency(stableBalances[item as StablecoinKey], 2) : 'N/A'}
                                </TokenBalance>
                            </CollateralContainer>
                        );
                    })}
            </AssetContainer>
        </Container>
    );
};

export default CollateralSelector;
