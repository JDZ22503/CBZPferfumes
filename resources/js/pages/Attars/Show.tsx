import { Button } from '@/components/ui/button';
import { type Attar } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { ArrowLeft, ShieldCheck, Droplets, Wind, Star } from 'lucide-react';

export default function AttarShow({
    attar,
}: {
    attar: Attar;
}) {
    return (
        <>
            <Head>
                <title>{`${attar.name} - Pure Attar - CBZ Perfumes`}</title>
                <meta name="description" content={`Discover the timeless essence of ${attar.name}. A pure, handcrafted attar oil for a lasting and sophisticated presence.`} />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                <div className="pt-32 pb-20">
                    <div className="container mx-auto px-6">
                        {/* Breadcrumbs / Back button */}
                        <Link href={route('attars.public')} className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-500 transition-colors mb-12 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Back to Attar Collection</span>
                        </Link>

                        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24 items-start">
                            {/* Attar Image */}
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-amber-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="relative aspect-[4/5] bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 backdrop-blur-sm">
                                    {attar.image_path ? (
                                        <img
                                             src={`${import.meta.env.VITE_API_BASE_URL}${attar.image_path}`}
                                            alt={attar.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-800 font-serif text-9xl opacity-20 select-none">
                                            {attar.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attar Info */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-[0.2em] uppercase">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        <span>Pure Essence</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                                        {attar.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 uppercase tracking-[0.3em] font-bold">Concentrated Perfume Oil</p>
                                </div>

                                <div className="flex items-end gap-4 pb-10 border-b border-white/10">
                                    <span className="text-3xl md:text-4xl font-black text-white">₹{Number(attar.price).toLocaleString()}</span>
                                    <span className="text-gray-500 mb-2 font-medium">Incl. all taxes</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <Droplets className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Alcohol Free</h4>
                                            <p className="text-sm text-gray-500">100% pure oil concentration for a skin-friendly experience.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <Wind className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Eternal Presence</h4>
                                            <p className="text-sm text-gray-500">A tiny drop provides extraordinary projection and longevity.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Authenticity Guaranteed</h4>
                                            <p className="text-sm text-gray-500">Pure handcrafted essence. SKU: {attar.sku}</p>
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
                                    <h3 className="text-xl font-bold font-serif text-amber-500">The Tradition</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">Handcrafted using age-old distillation techniques to capture the true soul of the ingredients.</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Application</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">Apply a single drop to pulse points. The warmth of your skin will slowly release the symphony of notes.</p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Storage</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">Keep in its signature packaging away from sunlight to maintain the potency of the precious oils.</p>
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
