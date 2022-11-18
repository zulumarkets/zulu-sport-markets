import TimeProgressBar from 'components/TimeProgressBar';
import useInterval from 'hooks/useInterval';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import React, { useCallback, useRef } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import MyTicket from '../MyTicket';
import { TwitterIcon } from '../styled-components';

type ShareTicketModalProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
    onClose: () => void;
    closeAfterSec?: number;
};

const DEFAULT_CLOSE_AFTER_SECONDS = 5;

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0px 0px 59px 11px rgba(100, 217, 254, 0.89)',
        overflow: 'visibile',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: '1501', // .MuiTooltip-popper has 1500 and validation message pops up from background
    },
};

const ShareTicketModal: React.FC<ShareTicketModalProps> = ({
    markets,
    totalQuote,
    paid,
    payout,
    onClose,
    closeAfterSec,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const onTwitterShareClick = useCallback(async () => {
        if (ref.current === null) {
            return;
        }
        const start = new Date().getTime();
        toPng(ref.current, { cacheBust: true })
            .then((data) => {
                const end = new Date().getTime();
                console.log('screenshot took: ', end - start, 'ms');
                const image = new Image();
                image.src = data;
                const w = window.open('');
                w?.document.write(image.outerHTML);

                console.log('screenshot opened after: ', new Date().getTime() - end, 'ms');
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const closeModalTimeSec = closeAfterSec ? closeAfterSec : DEFAULT_CLOSE_AFTER_SECONDS;

    useInterval(async () => {
        onClose();
    }, closeModalTimeSec * 1000);

    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={customStyles}>
            <Container ref={ref}>
                <TimeProgressBar durationInSec={closeModalTimeSec} increasing={false} />
                <CloseIcon className={`icon icon--close`} onClick={onClose} />
                <MyTicket markets={markets} totalQuote={totalQuote} paid={paid} payout={payout} />
                <TwitterShare onClick={onTwitterShareClick}>
                    <TwitterIcon fontSize={'30px'} />
                    <TwitterShareLabel>{t('markets.parlay.share-ticket.share')}</TwitterShareLabel>
                </TwitterShare>
            </Container>
        </ReactModal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    max-width: 400px;
    padding: 15px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
`;

const CloseIcon = styled.i`
    position: absolute;
    top: -40px;
    right: -30px;
    font-size: 20px;
    cursor: pointer;
    color: #ffffff;
`;

const TwitterShare = styled(FlexDivColumnCentered)`
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -100px;
    margin-left: auto;
    margin-right: auto;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: linear-gradient(217.61deg, #123eae 9.6%, #3ca8ca 78.9%);
    cursor: pointer;
`;

const TwitterShareLabel = styled.span`
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: #ffffff;
`;

export default React.memo(ShareTicketModal);
