<?php

namespace Everest\Http\ViewComposers;

use Illuminate\View\View;

class EverestComposer
{
    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('everestConfiguration', [
            'auth' => [
                'registration' => [
                    'enabled' => boolval(config('modules.auth.registration.enabled', false)),
                ],
                'security' => [
                    'force2fa' => boolval(config('modules.auth.security.force2fa', false)),
                    'attempts' => config('modules.auth.security.attempts', 3),
                ],
                'modules' => [
                    'discord' => [
                        'enabled' => boolval(config('modules.auth.discord.enabled', false)),
                        'client_id' => boolval(config('modules.auth.discord.client_id', false)),
                        'client_secret' => boolval(config('modules.auth.discord.client_secret', false)),
                    ],
                    'google' => [
                        'enabled' => boolval(config('modules.auth.google.enabled', false)),
                        'client_id' => boolval(config('modules.auth.google.client_id', false)),
                        'client_secret' => boolval(config('modules.auth.google.client_secret', false)),
                    ],
                    'onboarding' => [
                        'enabled' => boolval(config('modules.auth.onboarding.enabled', false)),
                        'content' => config('modules.auth.onboarding.content', ''),
                    ],
                ],
            ],
        ]);
    }
}
