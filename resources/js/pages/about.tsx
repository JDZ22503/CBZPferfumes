import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function About() {
    return (
        <>
            <Head title="About Us - CBZ Perfumes" />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                            About CBZ Perfumes
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Crafting memories through the art of fine fragrance.
                        </p>
                    </div>
                </div>

                {/* Story Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold font-serif text-amber-500">Our Story</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    At CBZ Perfumes, we believe that a scent is more than just a fragrance; it is an invisible accessory that defines your presence. Founded with a passion for luxury and elegance, we have dedicated ourselves to sourcing the finest ingredients from around the world to create unique, long-lasting perfumes that captivate the senses.
                                </p>
                                <p className="text-gray-300 leading-relaxed">
                                    Our journey began with a simple vision: to make luxury fragrances accessible without compromising on quality. Each bottle is a testament to our commitment to excellence, meticulously crafted to ensure a perfect balance of notes that evolve beautifully on your skin throughout the day.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-tr from-amber-900/20 to-zinc-900 rounded-2xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute inset-0 flex items-center justify-center text-amber-900/20 text-9xl font-serif select-none">C</div>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl -z-10"></div>
                                <div className="absolute -top-6 -left-6 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-zinc-900/30 border-y border-white/5">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold font-serif mb-4">Our Core Values</h2>
                            <div className="h-1 w-20 bg-amber-600 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-black/40 p-8 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 group">
                                <h3 className="text-xl font-bold mb-4 text-amber-500 group-hover:text-amber-400">Authenticity</h3>
                                <p className="text-gray-400">
                                    We promise 100% authentic fragrances. No compromises, no shortcuts. Just pure, unadulterated luxury in every bottle.
                                </p>
                            </div>
                            <div className="bg-black/40 p-8 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 group">
                                <h3 className="text-xl font-bold mb-4 text-amber-500 group-hover:text-amber-400">Quality</h3>
                                <p className="text-gray-400">
                                    Sourced from the finest perfumeries, our ingredients are rigorously tested to ensure they meet the highest global standards.
                                </p>
                            </div>
                            <div className="bg-black/40 p-8 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 group">
                                <h3 className="text-xl font-bold mb-4 text-amber-500 group-hover:text-amber-400">Ethics</h3>
                                <p className="text-gray-400">
                                    Beauty should be kind. Our products are cruelty-free and created with sustainable practices that respect our planet.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">10+</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">Years of Excellence</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">60+</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">Unique Fragrances</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">10k+</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">Happy Customers</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">100%</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">Satisfaction Rate</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-purple-600/20 blur-3xl opacity-30 pointer-events-none"></div>
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">Experience the Luxury</h2>
                        <p className="text-gray-300 max-w-xl mx-auto mb-8">
                            Ready to find your signature scent? Explore our exclusive collection and define your presence today.
                        </p>
                        <Link href={route('collections')}>
                            <Button className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-full">
                                Explore Collections
                            </Button>
                        </Link>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
