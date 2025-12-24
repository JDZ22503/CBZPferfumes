import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { Droplets, Clock, ShieldCheck, Sparkles, Zap, Globe } from 'lucide-react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Abilities() {
    return (
        <>
            <Head title="Our Abilities - CBZ Perfumes" />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                            Our Abilities
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            The mastery behind every bottle, defining excellence in fragrance.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Droplets className="w-8 h-8 text-amber-500" />,
                                    title: "Premium Ingredients Sourcing",
                                    desc: "We travel the globe to procure the rarest and most exquisite raw materials, ensuring that every note in our perfume is authentic and high-quality."
                                },
                                {
                                    icon: <Globe className="w-8 h-8 text-amber-500" />,
                                    title: "Global Distribution",
                                    desc: "Our robust supply chain network allows us to deliver luxury fragrances to doorsteps worldwide, maintaining product integrity during transit."
                                },
                                {
                                    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
                                    title: "Master Perfumery",
                                    desc: "Collaborating with world-renowned noses, we craft unique scent profiles that are complex, balanced, and unforgettable."
                                },
                                {
                                    icon: <Clock className="w-8 h-8 text-amber-500" />,
                                    title: "Longevity Formulation",
                                    desc: "Our advanced formulation techniques ensure that our perfumes maintain their potency and sillage for extended periods."
                                },
                                {
                                    icon: <ShieldCheck className="w-8 h-8 text-amber-500" />,
                                    title: "Quality Assurance",
                                    desc: "Every batch undergoes rigorous testing to meet international safety and quality standards before it reaches our customers."
                                },
                                {
                                    icon: <Zap className="w-8 h-8 text-amber-500" />,
                                    title: "Sustainable Practices",
                                    desc: "We are committed to eco-friendly production methods, from responsibly sourced ingredients to recyclable packaging."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors group cursor-default">
                                    <div className="mb-6 bg-black/50 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/10 group-hover:border-amber-500/50">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-100">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
