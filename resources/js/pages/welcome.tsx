import { Button } from '@/components/ui/button';
import { type SharedData, type Product } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Star, Droplets, Clock, ShieldCheck } from 'lucide-react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Welcome({
    products = [],
}: {
    products?: Product[];
}) {
    // Auth logic is now in FrontendNavbar

    return (
        <>
            <Head title="Welcome to CBZ Perfumes" />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-semibold tracking-widest uppercase">
                                    <Star className="w-3 h-3 fill-amber-500" />
                                    <span>New Summer Collection</span>
                                </div>
                                <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                        The Essence of
                                    </span>
                                    <span className="block text-amber-500">
                                        Pure Elegance
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                                    Discover a world of captivating fragrances crafted for the modern individual.
                                    Each scent tells a unique story of luxury, passion, and timeless beauty.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link href={route('collections')}>
                                        <Button size="lg" className="bg-white text-black hover:bg-gray-200 h-14 px-8 text-base rounded-full">
                                            Shop Collection
                                        </Button>
                                    </Link>

                                </div>
                                <div className="pt-8 flex items-center gap-8 text-gray-500 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>100% Authentic</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>Free Shipping</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>Cruelty Free</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 relative group perspective-1000">
                                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 animate-pulse"></div>
                                <div className="relative transform transition-transform duration-700 hover:scale-105 hover:rotate-1">
                                    <img
                                        src="/images/hero.png"
                                        alt="Luxury Perfume Bottle"
                                        className="w-auto mx-auto drop-shadow-2xl max-h-[600px] object-contain"
                                    />
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-900/10 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none"></div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-[#0a0a0a]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 font-serif">Why Choose CBZ Perfumes?</h2>
                            <div className="h-1 w-20 bg-amber-600 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Droplets className="w-8 h-8 text-amber-500" />,
                                    title: "Premium Ingredients",
                                    desc: "Sourced from the finest locations around the globe to ensure unmatched quality."
                                },
                                {
                                    icon: <Clock className="w-8 h-8 text-amber-500" />,
                                    title: "Long Lasting",
                                    desc: "Formulated to stay with you throughout the day, evolving beautifully on your skin."
                                },
                                {
                                    icon: <ShieldCheck className="w-8 h-8 text-amber-500" />,
                                    title: "Signature Scents",
                                    desc: "Unique blends created by master perfumers for a truly exclusive experience."
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

                {/* Featured Collection (Placeholder) */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 font-serif">Featured Collection</h2>
                                <p className="text-gray-400">Explore our most loved fragrances of the season.</p>
                            </div>
                            <Link href={route('collections')}>
                                <Button variant="link" className="text-amber-500 hover:text-amber-400 p-0 h-auto font-medium">
                                    View All Collections <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="group relative bg-[#111] rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-white/20 transition-all duration-300">
                                    <div className="aspect-[4/4] bg-[#1a1a1a] relative overflow-hidden">
                                        {product.image_path ? (
                                            <img
                                                src={`${product.image_path}`}
                                                alt={product.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-serif text-4xl opacity-20">
                                                {product.name.charAt(0)}
                                            </div>
                                        )}
                                        {/* <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Button className="bg-white text-black hover:bg-gray-200">
                                                Quick View
                                            </Button>
                                        </div> */}
                                    </div>
                                    <div className="p-4 bg">
                                        <h3 className="font-bold text-lg mb-1 group-hover:text-amber-500 transition-colors truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-400 mb-3">Eau de Parfum</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-white">₹{Number(product.price).toFixed(2)}</span>
                                            {/* <button className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider">Add to cart</button> */}
                                        </div>
                                    </div>
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
