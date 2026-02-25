import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import React from 'react';

export default function FrontendFooter() {
    return (
        <footer className="bg-black border-t border-white/10 py-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">CBZ PERFUMES</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Redefining luxury through the art of perfumery. Experience scent like never before.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href={route('products.public')} className="hover:text-amber-500 transition-colors">Products</Link></li>
                            <li><Link href={route('product-sets.public')} className="hover:text-amber-500 transition-colors">Gift Sets</Link></li>
                            <li><Link href={route('attars.public')} className="hover:text-amber-500 transition-colors">Attars</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href={route('about')} className="hover:text-amber-500 transition-colors">About Us</Link></li>
                            <li><Link href={route('contact')} className="hover:text-amber-500 transition-colors">Contact</Link></li>
                            <li><Link href={route('faq')} className="hover:text-amber-500 transition-colors">FAQ</Link></li>
                            <li><Link href={route('privacy')} className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href={route('terms')} className="hover:text-amber-500 transition-colors">Terms & Conditions</Link></li>
                            <li><Link href={route('returns')} className="hover:text-amber-500 transition-colors">Shipping & Returns</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>&copy; {new Date().getFullYear()} CBZ Perfumes. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href={route('terms')} className="hover:text-white transition-colors">Terms</Link>
                        <Link href={route('privacy')} className="hover:text-white transition-colors">Privacy</Link>
                        <Link href={route('returns')} className="hover:text-white transition-colors">Returns</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
