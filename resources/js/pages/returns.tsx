import { Head } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function Returns() {
    return (
        <>
            <Head>
                <title>Shipping & Returns - CBZ Perfumes</title>
                <meta name="description" content="Information about CBZ Perfumes' shipping methods, delivery times, and return policies for luxury fragrances." />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 uppercase tracking-widest">
                            Shipping & Returns
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Information about delivery times, costs, and our return policy.
                        </p>
                    </div>
                </div>

                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="grid md:grid-cols-2 gap-12 mb-20">
                            <div className="space-y-6 bg-zinc-900/40 p-8 rounded-2xl border border-white/5">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                    <Truck className="w-6 h-6 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-bold font-serif text-amber-500">Shipping Policy</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We offer standard shipping across India. Orders are typically processed within 1-2 business days. Delivery times ranges from 3-7 business days depending on your location.
                                </p>
                                <ul className="text-gray-400 space-y-2 list-disc list-inside">
                                    <li>Standard Shipping: ₹99 (Free on orders above ₹1999)</li>
                                    <li>Express Shipping: ₹199</li>
                                    <li>Tracked delivery on all orders</li>
                                </ul>
                            </div>

                            <div className="space-y-6 bg-zinc-900/40 p-8 rounded-2xl border border-white/5">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                                    <RotateCcw className="w-6 h-6 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold font-serif text-green-500">Returns Policy</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Due to health and hygiene reasons, we only accept returns for products that are damaged during transit or if you receive the incorrect item.
                                </p>
                                <ul className="text-gray-400 space-y-2 list-disc list-inside">
                                    <li>Notify us within 48 hours of delivery</li>
                                    <li>Keep original packaging and receipts</li>
                                    <li>Refunds processed within 7-10 business days</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-amber-500/5 p-8 rounded-2xl border border-amber-500/20 text-center">
                            <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Authenticated & Insured</h3>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Every shipment is insured and guaranteed to be 100% authentic. We take great care in packaging our luxury fragrances to ensure they arrive in perfect condition.
                            </p>
                        </div>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
