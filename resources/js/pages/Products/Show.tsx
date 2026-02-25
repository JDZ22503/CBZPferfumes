import { Button } from '@/components/ui/button';
import { type Product } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { ArrowLeft, ShieldCheck, Droplets, Clock, Star } from 'lucide-react';

export default function ProductShow({
    product,
}: {
    product: Product;
}) {
    return (
        <>
            <Head>
                <title>{`${product.name} - Luxury Perfume - CBZ Perfumes`}</title>
                <meta name="description" content={`Experience the exquisite notes of ${product.name}. A luxury fragrance from CBZ Perfumes' signature collection.`} />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                <div className="pt-32 pb-20">
                    <div className="container mx-auto px-6">
                        {/* Breadcrumbs / Back button */}
                        <Link href={route('products.public')} className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-500 transition-colors mb-12 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Back to Collection</span>
                        </Link>

                        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24 items-start">
                            {/* Product Image */}
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-amber-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="relative aspect-[4/5] bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 backdrop-blur-sm">
                                    {product.image_path ? (
                                        <img
                                             src={`${import.meta.env.VITE_API_BASE_URL}${product.image_path}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-800 font-serif text-9xl opacity-20 select-none">
                                            {product.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-[0.2em] uppercase">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        <span>Signature Edition</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                                        {product.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 uppercase tracking-[0.3em] font-bold">Eau de Parfum</p>
                                </div>

                                <div className="flex items-end gap-4 pb-10 border-b border-white/10">
                                    <span className="text-3xl md:text-4xl font-black text-white">₹{Number(product.price).toLocaleString()}</span>
                                    <span className="text-gray-500 mb-2 font-medium">Incl. all taxes</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <Droplets className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Exquisite Concentration</h4>
                                            <p className="text-sm text-gray-500">Formulated with 25% fragrance oil for maximum longevity.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Long Lasting Sillage</h4>
                                            <p className="text-sm text-gray-500">Evolves beautifully over 12+ hours on skin and fabrics.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Authenticity Guaranteed</h4>
                                            <p className="text-sm text-gray-500">Every bottle comes with a unique SKU: {product.sku}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-16 rounded-2xl text-xl font-black shadow-[0_10px_30px_rgba(217,119,6,0.3)] transition-all active:scale-95 group">
                                        Order via WhatsApp
                                        <ArrowLeft className="w-6 h-6 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <p className="text-center mt-6 text-xs text-gray-600 uppercase tracking-widest font-bold">
                                        Free Express Shipping on this Order
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="mt-32 pt-20 border-t border-white/5">
                            <div className="grid md:grid-cols-3 gap-16">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Top Notes</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">The first impression. Fresh, captivating, and designed to pique interest from the very first spray.</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Heart Notes</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">The soul of the fragrance. A masterfully balanced symphony that defines the character of {product.name}.</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Base Notes</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">The foundation that lingers. Rich, deep, and sensual notes that provide the lasting sillage.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FrontendFooter />
            </div>
        </>
    );
}
