import { Button } from '@/components/ui/button';
import { type SharedData, type Product, type Attar, type ProductSet } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Star, Droplets, Clock, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Welcome({
    products = [],
    featuredItems = [],
}: {
    products?: (Product | Attar | ProductSet)[];
    featuredItems?: (Product | Attar | ProductSet)[];
}) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const getFeaturedItemInfo = (item: Product | Attar | ProductSet) => {
        let type = 'Product';
        let href = '#';
        let image = item.image_path;
        let detail: any = null;

        if ('product_detail' in item) {
            type = 'Eau de Parfum';
            href = route('products.show', item.id);
            detail = item.product_detail;
        } else if ('attar_detail' in item) {
            type = 'Pure Attar';
            href = route('attars.show', item.id);
            detail = item.attar_detail;
        } else if ('product_set_detail' in item) {
            type = 'Gift Set';
            href = route('product-sets.show', item.id);
            detail = item.product_set_detail;
        }

        if (!image && detail?.images && detail.images.length > 0) {
            image = detail.images[0];
        }

        return { type, href, image, detail };
    };

    const nextSlide = useCallback(() => {
        if (featuredItems.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
        }
    }, [featuredItems.length]);

    const prevSlide = useCallback(() => {
        if (featuredItems.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
        }
    }, [featuredItems.length]);

    useEffect(() => {
        if (featuredItems.length <= 1 || isHovered) return;
        const timer = setInterval(nextSlide, 4000);
        return () => clearInterval(timer);
    }, [featuredItems.length, isHovered, nextSlide]);

    return (
        <>
            <Head>
                <title>Welcome to CBZ Perfumes - Fragrance Forever</title>
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
                                        Fragrance
                                    </span>
                                    <span className="block text-amber-500 italic font-serif">
                                        Forever
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
                                        <span className="text-2xl font-bold text-white">100%*</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">Natural</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">24h*</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">Lasting</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">Global</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">Sourcing</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 relative"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {featuredItems.length > 0 ? (
                                    <>
                                        <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                                            <div 
                                                className="flex transition-transform duration-700 ease-in-out"
                                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                            >
                                                {featuredItems.map((item, idx) => {
                                                    const { type, href, image } = getFeaturedItemInfo(item);
                                                    return (
                                                        <Link
                                                            key={`featured-${item.id}-${idx}`}
                                                            href={href}
                                                            className="min-w-full group"
                                                        >
                                                            <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                                                                {image ? (
                                                                    <img
                                                                        src={`${import.meta.env.VITE_API_BASE_URL}${image}`}
                                                                        alt={item.name}
                                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                                    />
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-800 font-serif text-[8rem] opacity-10 uppercase italic">
                                                                        {item.name.charAt(0)}
                                                                    </div>
                                                                )}

                                                                {/* Gradient overlay */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                                                {/* Content overlay */}
                                                                <div className="absolute bottom-0 left-0 right-0 p-8 z-10 space-y-3">
                                                                    <div className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[10px] font-black uppercase tracking-widest text-amber-400 inline-block">
                                                                        {type}
                                                                    </div>
                                                                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight">
                                                                        {item.name}
                                                                    </h3>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-xl md:text-2xl font-serif italic text-amber-500">
                                                                            ₹{Number(item.price).toLocaleString()}
                                                                        </span>
                                                                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                                            <ArrowRight className="w-5 h-5" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>

                                            {/* Navigation arrows inside the slider */}
                                            {featuredItems.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); prevSlide(); }}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all z-20"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); nextSlide(); }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all z-20"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Dots below slider */}
                                        {featuredItems.length > 1 && (
                                            <div className="flex justify-center gap-2 mt-6">
                                                {featuredItems.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentSlide(idx)}
                                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                                            idx === currentSlide
                                                                ? 'bg-amber-500 w-8'
                                                                : 'bg-zinc-700 w-4 hover:bg-zinc-500'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="relative z-10 transform transition-all duration-1000 hover:rotate-2 hover:scale-105">
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/images/b-blue-1765295502.webp`}
                                            alt="Luxury Perfume Bottle"
                                            className="w-full max-w-[500px] mx-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                        />
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-gradient-to-t from-transparent via-white/5 to-transparent blur-xl opacity-50 rounded-full"></div>
                                    </div>
                                )}
                                
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
                            {products.map((item, idx) => {
                                let type = 'Product';
                                let href = '#';
                                let image = item.image_path;
                                let detail = null;

                                if ('product_detail' in item) {
                                    type = 'Eau de Parfum';
                                    href = route('products.show', item.id);
                                    detail = item.product_detail;
                                } else if ('attar_detail' in item) {
                                    type = 'Pure Attar';
                                    href = route('attars.show', item.id);
                                    detail = item.attar_detail;
                                } else if ('product_set_detail' in item) {
                                    type = 'Gift Set';
                                    href = route('product-sets.show', item.id);
                                    detail = item.product_set_detail;
                                }

                                // Fallback to first gallery image if main image is missing
                                if (!image && detail?.images && detail.images.length > 0) {
                                    image = detail.images[0];
                                }

                                return (
                                    <Link key={`${type}-${item.id}-${idx}`} href={href} className="group block bg-[#080808] p-3 rounded-[2.5rem] border border-white/5 hover:border-amber-500/20 transition-all duration-500 shadow-2xl">
                                        <div className="aspect-[3/4] rounded-[2rem] overflow-hidden relative shadow-inner">
                                            {image ? (
                                                <img
                                                     src={`${import.meta.env.VITE_API_BASE_URL}${image}`}
                                                    alt={item.name}
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-serif text-6xl opacity-20 bg-zinc-900">
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                            {/* Soft overlay on hover */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-xl group-hover:text-amber-500 transition-colors truncate pr-2 tracking-tight uppercase">{item.name}</h3>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em] mb-6">{type}</p>
                                            
                                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                                <span className="font-bold text-white text-2xl tracking-tighter">₹{Number(item.price).toLocaleString()}</span>
                                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300">
                                                    <ArrowRight className="w-5 h-5 text-white group-hover:text-black" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
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

              
                <FrontendFooter />
            </div>
        </>
    );
}
