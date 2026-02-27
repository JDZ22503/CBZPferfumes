import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { dashboard } from '@/routes';
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
                        {/* <span className="text-lg font-bold tracking-wider text-white">
                            {'PERFUMES'}
                        </span> */}
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-gray-300">
                    <Link href={route('collections')} className={`hover:text-amber-500 transition-colors ${route().current('collections') ? 'text-amber-500' : ''}`}>COLLECTIONS</Link>
                    <Link href={route('products.public')} className={`hover:text-amber-500 transition-colors ${route().current('products.public') ? 'text-amber-500' : ''}`}>PERFUMES</Link>
                    <Link href={route('product-sets.public')} className={`hover:text-amber-500 transition-colors ${route().current('product-sets.public') ? 'text-amber-500' : ''}`}>GIFT SETS</Link>
                    <Link href={route('attars.public')} className={`hover:text-amber-500 transition-colors ${route().current('attars.public') ? 'text-amber-500' : ''}`}>ATTARS</Link>
                    <Link href={route('about')} className={`hover:text-amber-500 transition-colors ${route().current('about') ? 'text-amber-500' : ''}`}>ABOUT</Link>
                    <Link href={route('contact')} className={`hover:text-amber-500 transition-colors ${route().current('contact') ? 'text-amber-500' : ''}`}>CONTACT</Link>
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
                        <Link href={route('products.public')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('products.public') ? 'text-amber-500' : 'text-gray-300'}`}>PERFUMES</Link>
                        <Link href={route('product-sets.public')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('product-sets.public') ? 'text-amber-500' : 'text-gray-300'}`}>GIFT SETS</Link>
                        <Link href={route('attars.public')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('attars.public') ? 'text-amber-500' : 'text-gray-300'}`}>ATTARS</Link>
                        <Link href={route('about')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('about') ? 'text-amber-500' : 'text-gray-300'}`}>ABOUT</Link>
                        <Link href={route('contact')} onClick={toggleMobileMenu} className={`text-lg font-medium hover:text-amber-500 transition-colors ${route().current('contact') ? 'text-amber-500' : 'text-gray-300'}`}>CONTACT</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
