import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useFlash from '@/plugins/useFlash';
import discordLogin from '@/api/auth/discord';
import { Button } from '@/components/elements/button/index';
import DiscordFormContainer from '@/components/auth/DiscordFormContainer';

const DiscordContainer = () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [loading, setLoading] = useState(false);

    const login = () => {
        clearFlashes();
        setLoading(true);

        discordLogin()
            .then((data) => {
                if (!data) return clearAndAddHttpError({ error: 'Discord auth failed. Please try again.' });
                window.location.href = data;
            })
            .then(() => setLoading(false))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <DiscordFormContainer>
            <div className={`flex flex-col md:h-full`}>
                <div className={`mt-6`}>
                    <Button type={'button'} className={`w-full`} onClick={() => login()} disabled={loading}>
                        Connect with Discord
                    </Button>
                </div>
                <div className={`mt-6 text-center`}>
                    <Link
                        to={'/auth/login'}
                        className={`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                    >
                        Return to login
                    </Link>
                </div>
            </div>
        </DiscordFormContainer>
    );
};

export default DiscordContainer;
