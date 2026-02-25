import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { app_settings } = usePage().props as any;

    return (
        <>
            <div className="flex aspect-square size-20 items-center justify-center rounded-md text-sidebar-primary-foreground overflow-hidden">
                {app_settings?.company_logo ? (
                    <img
                        src={app_settings.company_logo}
                        alt="Logo"
                        className="h-full w-full object-contain dark:invert"
                    />
                ) : (
                    <AppLogoIcon className="size-8 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {'Perfumes'}
                </span>
            </div>
        </>
    );
}
