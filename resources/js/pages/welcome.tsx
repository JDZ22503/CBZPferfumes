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
            <Head>
                <title>Welcome to CBZ Perfumes - Elegance in Every Drop</title>
                <meta name="description" content="Explore our premium collection of luxury perfumes, attars, and curated gift sets. Discover your signature scent today." />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
                    {/* Animated background flare */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] animate-pulse delay-700"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1 space-y-10">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span>Prestige Collection 2026</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter">
                                    <span className="block text-white opacity-90">
                                        Elegance in
                                    </span>
                                    <span className="block text-amber-500 italic font-serif">
                                        Every Drop
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-400 max-w-xl leading-relaxed font-light">
                                    Experience the alchemy of rare ingredients and master craftsmanship. CBZ Perfumes redefines the art of scent for those who demand nothing but perfection.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                                    <Link href={route('collections')}>
                                        <Button size="lg" className="bg-amber-600 text-white hover:bg-amber-700 h-16 px-10 text-lg rounded-full shadow-[0_0_30px_rgba(217,119,6,0.2)] transition-all hover:scale-105 active:scale-95">
                                            Explore Collection
                                        </Button>
                                    </Link>
                                    <Link href={route('about')}>
                                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 h-16 px-10 text-lg rounded-full backdrop-blur-md">
                                            Our Story
                                        </Button>
                                    </Link>
                                </div>
                                <div className="pt-12 flex items-center gap-10 border-t border-white/10 max-w-lg">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">100%</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">Natural</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">24h</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">Lasting</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">Global</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">Sourcing</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 relative">
                                <div className="relative z-10 transform transition-all duration-1000 hover:rotate-2 hover:scale-105">
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/images/b-blue-1765295502.webp`}
                                        alt="Luxury Perfume Bottle"
                                        className="w-full max-w-[500px] mx-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                    />
                                    {/* Reflection below image */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-gradient-to-t from-transparent via-white/5 to-transparent blur-xl opacity-50 rounded-full"></div>
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/10 rounded-full -z-10 animate-[spin_20s_linear_infinite] shadow-[0_0_50px_rgba(255,255,255,0.03)]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-amber-500/20 rounded-full -z-10 animate-[spin_15s_linear_infinite_reverse] shadow-[0_0_60px_rgba(245,158,11,0.1)]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Process Section */}
                <section className="py-24 bg-zinc-900/40 relative border-y border-white/5">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="w-full md:w-1/2">
                                <h2 className="text-3xl md:text-4xl font-bold font-serif mb-8 text-amber-500 uppercase tracking-widest">The Art of Creation</h2>
                                <div className="space-y-12">
                                    {[
                                        { step: "01", title: "Sourcing", desc: "Rare botanicals and essential oils hand-picked from remote corners of the world." },
                                        { step: "02", title: "Distillation", desc: "Legacy extraction techniques that preserve the soul of every ingredient." },
                                        { step: "03", title: "Aging", desc: "Patience is our secret. Every blend matures for months to achieve perfect harmony." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <span className="text-4xl font-black text-amber-500/20 font-sans tracking-tighter">{item.step}</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                                <p className="text-gray-400 font-light leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 relative p-10">
                                <div className="aspect-[4/5] bg-gradient-to-br from-zinc-800 to-black rounded-3xl overflow-hidden border border-white/10 group">
                                    <img 
                                        src={`${import.meta.env.VITE_API_BASE_URL}/images/b-blue-1765295502.webp`}
                                        className="w-full h-full object-contain opacity-50 group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" 
                                        alt="Process" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white p-8 rounded-2xl shadow-2xl max-w-[200px] hidden md:block">
                                    <p className="text-black font-serif italic text-lg leading-tight">"Where science meets poetry."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-black">
                    <div className="container mx-auto px-6 text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Unmatched Quality</h2>
                        <div className="h-1 w-24 bg-amber-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                {
                                    icon: <Droplets className="w-10 h-10 text-amber-500" />,
                                    title: "Extrait de Parfum",
                                    desc: "Highest concentration of pure oils for a scent that commands attention."
                                },
                                {
                                    icon: <Clock className="w-10 h-10 text-amber-500" />,
                                    title: "Timeless Sillage",
                                    desc: "A trail that lingers elegantly, making you unforgettable long after you've left."
                                },
                                {
                                    icon: <ShieldCheck className="w-10 h-10 text-amber-500" />,
                                    title: "Artisanal Blends",
                                    desc: "Masterfully composed symphonies of top, heart, and base notes."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="group p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 hover:bg-zinc-800/40 hover:border-amber-500/20 transition-all duration-500 text-center">
                                    <div className="mb-8 mx-auto w-20 h-20 rounded-3xl bg-black flex items-center justify-center group-hover:bg-amber-500/10 transition-colors border border-white/5">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                    <p className="text-gray-400 font-light leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Collection */}
                <section className="py-24 relative overflow-hidden bg-zinc-900/20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">New Arrivals</h2>
                                <p className="text-gray-400 max-w-md font-light">Explore our curated selection of seasonal masterpieces, designed for the contemporary connoisseur.</p>
                            </div>
                            <Link href={route('collections')}>
                                <Button className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black rounded-full px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs transition-all">
                                    View All <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <Link key={product.id} href={route('products.show', product.id)} className="group relative bg-black/40 rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-500">
                                    <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                                        {product.image_path ? (
                                            <img
                                                 src={`${import.meta.env.VITE_API_BASE_URL}${product.image_path}`}
                                                alt={product.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-serif text-6xl opacity-30 select-none">
                                                {product.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <Button className="w-full bg-white text-black hover:bg-amber-500 hover:text-white rounded-xl py-4 font-bold transition-all pointer-events-none">
                                                Discover Details
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-xl group-hover:text-amber-500 transition-colors truncate pr-2">{product.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 uppercase tracking-[0.2em] font-medium">Eau de Parfum</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="font-bold text-white text-xl">₹{Number(product.price).toLocaleString()}</span>
                                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-600/5 -z-10"></div>
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="space-y-8 p-12 md:p-20 bg-zinc-900/50 rounded-[3rem] border border-white/10 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10"></div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Join the Elite</h2>
                            <p className="text-gray-400 text-lg max-w-xl mx-auto font-light leading-relaxed">
                                Subscribe to receive exclusive early access to limited edition scents and private events at CBZ Perfumes.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative pt-4" onSubmit={(e) => e.preventDefault()}>
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="flex-1 bg-black border border-white/10 rounded-full px-8 py-5 focus:border-amber-500 outline-none transition-all text-white font-medium" 
                                />
                                <Button className="bg-amber-600 text-white hover:bg-amber-700 h-full py-5 px-10 rounded-full font-bold shadow-lg">
                                    Subscribe
                                </Button>
                            </form>
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Privacy guaranteed. Unsubscribe anytime.</p>
                        </div>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
