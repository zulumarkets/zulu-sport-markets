import { Position, Side } from 'constants/options';
import useAvailablePerSideQuery from 'queries/markets/useAvailablePerSideQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
// import { useTranslation } from 'react-i18next';
import { MarketData } from 'types/markets';
import { getVisibilityOfDrawOptionByTagId } from 'utils/markets';
import PositionDetails from '../PositionDetails';

type MarketPositionsProps = {
    market: MarketData;
    selectedSide: Side;
};

const MarketPositions: React.FC<MarketPositionsProps> = ({ market, selectedSide }) => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const availablePerSideQuery = useAvailablePerSideQuery(market.address, selectedSide, {
        enabled: isWalletConnected,
    });

    const availablePerSide =
        availablePerSideQuery.isSuccess && availablePerSideQuery.data
            ? availablePerSideQuery.data
            : {
                  positions: {
                      [Position.HOME]: {
                          available: 0,
                          buyImpactPrice: 0,
                      },
                      [Position.AWAY]: {
                          available: 0,
                          buyImpactPrice: 0,
                      },
                      [Position.DRAW]: {
                          available: 0,
                          buyImpactPrice: 0,
                      },
                  },
              };

    const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);

    return (
        <>
            <PositionDetails
                market={market}
                odd={market.positions[Position.HOME].sides[selectedSide].odd}
                availablePerPosition={availablePerSide.positions[Position.HOME]}
                position={Position.HOME}
            />
            {showDrawOdds && (
                <PositionDetails
                    market={market}
                    odd={market.positions[Position.DRAW].sides[selectedSide].odd}
                    availablePerPosition={availablePerSide.positions[Position.DRAW]}
                    position={Position.DRAW}
                />
            )}
            <PositionDetails
                market={market}
                odd={market.positions[Position.AWAY].sides[selectedSide].odd}
                availablePerPosition={availablePerSide.positions[Position.AWAY]}
                position={Position.AWAY}
            />
        </>
    );
};

export default MarketPositions;
