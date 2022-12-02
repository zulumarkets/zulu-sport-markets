import { getErrorToastOptions, defaultToastOptions } from 'config/toast';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import MySimpleTicket from './components/MySimpleTicket';
import MyTicket from './components/MyTicket';
import { TwitterIcon } from '../styled-components';
import DisplayOptions from './components/DisplayOptions';
import { DisplayOptionsType } from './components/DisplayOptions/DisplayOptions';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsMobile } from 'redux/modules/app';
import { isMetamask, isFirefox } from 'utils/device';
import { useMatomo } from '@datapunt/matomo-tracker-react';

export type ShareTicketModalProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
    onClose: () => void;
};

const PARLAY_IMAGE_NAME = 'ParlayImage.png';

const ShareTicketModal: React.FC<ShareTicketModalProps> = ({ markets, totalQuote, paid, payout, onClose }) => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const { trackEvent } = useMatomo();

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);

    const defaultDisplayOptions: DisplayOptionsType = {
        isSimpleView: false,
    };
    const [displayOptions, setDisplayOptions] = useState<DisplayOptionsType>(defaultDisplayOptions);

    const ref = useRef<HTMLDivElement>(null);

    const customStyles = {
        content: {
            top: isMobile ? '40%' : '50%',
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

    useEffect(() => {
        const checkMetamaskBrowser = async () => {
            const isMMBrowser = (await isMetamask()) && isMobile;
            setIsMetamaskBrowser(isMMBrowser);
        };
        checkMetamaskBrowser().catch((e) => console.log(e));
    }, [isMobile]);

    // Download image mobile: clipboard.write is not supported by all browsers
    // Download image desktop: clipboard.write not supported/enabled in Firefox
    const useDownloadImage = isMobile || isFirefox();

    const saveImageAndOpenTwitter = useCallback(
        async (toastIdParam: string | number) => {
            if (!isLoading) {
                if (ref.current === null) {
                    return;
                }

                try {
                    const base64Image = await toPng(ref.current, { cacheBust: true });

                    // Download image
                    const link = document.createElement('a');
                    link.href = base64Image;
                    link.download = PARLAY_IMAGE_NAME;
                    document.body.appendChild(link);
                    setTimeout(() => {
                        link.click();
                    }, 15000);
                } catch (e) {
                    console.log(e);
                    setIsLoading(false);
                    toast.update(toastIdParam, getErrorToastOptions(t('market.toast-message.save-image-error')));
                }
            }
        },
        [isLoading]
    );

    const onTwitterShareClick = () => {
        if (!isLoading) {
            trackEvent({
                category: 'share-ticket-modal',
                action: 'click-on-share-tw-icon',
            });

            if (isMetamaskBrowser) {
                // Metamask dosn't support image download neither clipboard.write
                toast.error(t('market.toast-message.metamask-not-supported'), defaultToastOptions);
            } else {
                const id = toast.loading(
                    useDownloadImage ? t('market.toast-message.download-image') : t('market.toast-message.save-image')
                );
                setToastId(id);
                setIsLoading(true);

                // If image creation is not postponed with timeout toaster is not displayed immediately, it is rendered in parallel with toPng() execution.
                // Function toPng is causing UI to freez for couple of seconds and there is no notification message during that time, so it confuses user.
                setTimeout(() => {
                    saveImageAndOpenTwitter(id);
                }, 300);
            }
        }
    };

    const onModalClose = () => {
        if (isLoading) {
            toast.update(toastId, getErrorToastOptions(t('market.toast-message.save-image-cancel')));
        }
        onClose();
    };

    return (
        <>
            <ReactModal
                isOpen
                onRequestClose={onModalClose}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
                contentElement={(props, children) => (
                    <>
                        <div {...props}>{children}</div>
                        {!isMobile && (
                            <DisplayOptions
                                defaultDisplayOptions={displayOptions}
                                setDisplayOptions={setDisplayOptions}
                                onShare={onTwitterShareClick}
                                isDisabled={isLoading}
                            />
                        )}
                        {isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} />}
                    </>
                )}
            >
                <Container ref={ref} isSimpleView={displayOptions.isSimpleView}>
                    {!isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} />}
                    {displayOptions.isSimpleView ? (
                        <MySimpleTicket markets={markets} payout={payout} />
                    ) : (
                        <MyTicket markets={markets} totalQuote={totalQuote} paid={paid} payout={payout} />
                    )}
                    {isMobile ? (
                        <DisplayOptions
                            defaultDisplayOptions={displayOptions}
                            setDisplayOptions={setDisplayOptions}
                            onShare={onTwitterShareClick}
                            isDisabled={isLoading}
                        />
                    ) : (
                        <TwitterShare disabled={isLoading} onClick={onTwitterShareClick}>
                            <TwitterIcon disabled={isLoading} fontSize={'30px'} />
                            <TwitterShareLabel>{t('markets.parlay.share-ticket.share')}</TwitterShareLabel>
                        </TwitterShare>
                    )}
                </Container>
            </ReactModal>
        </>
    );
};

// Aspect ratio is important for Twitter: horizontal (Simple View) 2:1 and vertical min 3:4
const Container = styled(FlexDivColumnCentered)<{ isSimpleView: boolean }>`
    width: ${(props) => (props.isSimpleView ? '400' : '324')}px;
    ${(props) => (props.isSimpleView ? 'height: 200px;' : '')}
    ${(props) => (!props.isSimpleView ? 'max-height: 432px;' : '')}
    padding: 15px;
    flex: none;
    background: ${(props) =>
        props.isSimpleView
            ? 'linear-gradient(135deg, #070814 0%, #424470 100%)'
            : 'linear-gradient(180deg, #303656 0%, #1a1c2b 100%)'};
    border-radius: 10px;
    @media (max-width: 950px) {
        ${(props) => (props.isSimpleView ? 'width: 360px;' : '')}
        ${(props) => (props.isSimpleView ? 'height: 180px;' : '')}
    }
`;

const CloseIcon = styled.i`
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    cursor: pointer;
    color: #ffffff;
    @media (max-width: 950px) {
        top: 10px;
        right: 10px;
    }
`;

const TwitterShare = styled(FlexDivColumnCentered)<{ disabled?: boolean }>`
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
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;

const TwitterShareLabel = styled.span`
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: #ffffff;
`;

export default React.memo(ShareTicketModal);
