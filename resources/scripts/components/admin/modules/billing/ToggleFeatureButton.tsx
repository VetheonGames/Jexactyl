import { Button } from '@elements/button';
import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/api/admin/billing/settings';

export default () => {
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
        getSettings().then(data => setEnabled(data.enabled));
    });

    const submit = () => {
        updateSettings('enabled', !enabled).then(() => {
            // @ts-expect-error this is fine
            window.location = enabled ? '/admin/billing' : '/admin/billing/products';
        });
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!enabled ? <Button>Enable Billing Module</Button> : <Button.Danger>Disable Billing Module</Button.Danger>}
        </div>
    );
};
