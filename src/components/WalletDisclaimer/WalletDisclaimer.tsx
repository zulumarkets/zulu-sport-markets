import React from 'react';
import { Link } from '@material-ui/core';

const WalletDisclaimer: React.FC = () => {
    return (
        <span>
            By connecting your wallet, you agree to the <Link href="https://termsofservice.xyz">Terms of Service</Link>{' '}
            and acknowledge you have read and understand the protocol{' '}
            <Link href="https://disclaimer.xyz">Disclaimer</Link>
        </span>
    );
};

export default WalletDisclaimer;
