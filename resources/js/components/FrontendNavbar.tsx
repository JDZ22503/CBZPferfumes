import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { dashboard, login } from '@/routes';
import { Menu, X } from 'lucide-react';

export default function FrontendNavbar() {
    const { auth, app_settings } = usePage<SharedData & { app_settings: any }>().props;
    const canRegister = true;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href={route('home')} className="flex items-center gap-2">
                        {app_settings?.company_logo ? (
                            <img
                                src={app_settings.company_logo}
                                alt="Logo"
                                className="h-8 w-auto object-contain rounded dark:invert"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-black font-bold text-xl">
                                C
                            </div>
                        )}
                        <span className="text-lg font-bold tracking-wider text-white">
                            {'PERFUMES'}
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-gray-300">
                    <Link href={route('collections')} className={`hover:text-amber-500 transition-colors ${route().current('collections') ? 'text-amber-500' : ''}`}>COLLECTIONS</Link>
                    <Link href={route('abilities')} className={`hover:text-amber-500 transition-colors ${route().current('abilities') ? 'text-amber-500' : ''}`}>OUR ABILITIES</Link>
                    <Link href={route('about')} className={`hover:text-amber-500 transition-colors ${route().current('about') ? 'text-amber-500' : ''}`}>ABOUT</Link>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {auth.user ? (
                        <Link href={dashboard()}>
                            <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={login()}>
                                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                                    Log in
                                </Button>
                            </Link>
                            {/* {canRegister && (
                                <Link href={register()}>
                                    <Button className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transition-all duration-300">
                                        Register
                                    </Button>
                                </Link>
                            )} */}
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMobileMenu} className="text-gray-300 hover:text-white focus:outline-none">
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-black/95 border-b border-white/10 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col p-6 space-y-4 text-center">
                        <Link href={route('collections')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('collections') ? 'text-amber-500' : 'text-gray-300'}`}>COLLECTIONS</Link>
                        <Link href={route('abilities')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('abilities') ? 'text-amber-500' : 'text-gray-300'}`}>OUR ABILITIES</Link>
                        <Link href={route('about')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('about') ? 'text-amber-500' : 'text-gray-300'}`}>ABOUT</Link>

                        <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                            {auth.user ? (
                                <Link href={dashboard()} onClick={toggleMobileMenu} className="w-full">
                                    <Button variant="outline" className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} onClick={toggleMobileMenu} className="w-full">
                                        <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                                            Log in
                                        </Button>
                                    </Link>

                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
