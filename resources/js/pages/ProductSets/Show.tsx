import { Button } from '@/components/ui/button';
import { type ProductSet } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { ArrowLeft, ShieldCheck, Gift, Sparkles, Star } from 'lucide-react';

export default function ProductSetShow({
    productSet,
}: {
    productSet: ProductSet;
}) {
    const [activeImage, setActiveImage] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const { contactDetails } = usePage<any>().props;
    const galleryImages = [
        productSet.image_path,
        ...(productSet.product_set_detail?.images || [])
    ].filter(Boolean) as string[];

    const whatsappPhone = (contactDetails?.phone || '').replace(/[^0-9]/g, '');
    const productUrl = window.location.href;
    const whatsappMessage = encodeURIComponent(
`ORDER INQUIRY - CBZ Perfumes
------------------------------
Product: ${productSet.name}
Type: Gift Set
Price: Rs.${Number(productSet.price).toLocaleString()}
SKU: ${productSet.sku || 'N/A'}
------------------------------
View Product: ${productUrl}

Hi, I would like to place an order for this product. Please confirm availability and share payment details. Thank you!`
    );
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

    React.useEffect(() => {
        if (galleryImages.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % galleryImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [galleryImages.length, isPaused]);

    const nextImage = () => setActiveImage((prev) => (prev + 1) % galleryImages.length);
    const prevImage = () => setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    return (
        <>
            <Head>
                <title>{`${productSet.name} - Luxury Gift Set - CBZ Perfumes`}</title>
                <meta name="description" content={productSet.product_set_detail?.description || `Experience the ultimate luxury gifting with ${productSet.name}. A curated collection of fine fragrances from CBZ Perfumes.`} />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                <div className="pt-32 pb-20">
                    <div className="container mx-auto px-6">
                        {/* Breadcrumbs / Back button */}
                        <Link href={route('product-sets.public')} className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-500 transition-colors mb-12 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Back to Gift Sets</span>
                        </Link>

                        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24 items-start">
                            {/* Product Set Image Gallery */}
                            <div 
                                className="space-y-6"
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                <div className="relative group/gallery">
                                    <div className="absolute -inset-4 bg-amber-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-1000"></div>
                                    <div className="relative aspect-[4/5] bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 backdrop-blur-sm shadow-2xl">
                                        {galleryImages.length > 0 ? (
                                            <div className="w-full h-full relative">
                                                {galleryImages.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={`${import.meta.env.VITE_API_BASE_URL}${img}`}
                                                        alt={productSet.name}
                                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                                                            activeImage === i 
                                                                ? 'opacity-100 scale-100 translate-x-0' 
                                                                : 'opacity-0 scale-110 translate-x-4'
                                                        }`}
                                                    />
                                                ))}
                                                
                                                {/* Navigation Arrows */}
                                                {galleryImages.length > 1 && (
                                                    <>
                                                        <button 
                                                            onClick={prevImage}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-400 group/btn"
                                                        >
                                                            <ArrowLeft className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                        <button 
                                                            onClick={nextImage}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-amber-500 hover:border-amber-400 group/btn"
                                                        >
                                                            <ArrowLeft className="w-5 h-5 text-white rotate-180 group-hover/btn:scale-110 transition-transform" />
                                                        </button>

                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-800 font-serif text-9xl opacity-20 select-none">
                                                {productSet.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Thumbnails */}
                                {galleryImages.length > 1 && (
                                    <div className="flex gap-4 p-2 bg-zinc-900/30 rounded-[2rem] border border-white/5 backdrop-blur-md overflow-x-auto scrollbar-hide">
                                        {galleryImages.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(i)}
                                                className={`relative flex-shrink-0 w-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                                                    activeImage === i 
                                                        ? 'border-amber-500 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                                                        : 'border-transparent grayscale opacity-50 hover:opacity-100 hover:grayscale-0'
                                                }`}
                                            >
                                                <img 
                                                    src={`${import.meta.env.VITE_API_BASE_URL}${img}`} 
                                                    className="w-full h-full object-cover" 
                                                    alt="" 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Set Info */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-[0.2em] uppercase">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        <span>Exclusive Gift Collection</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                                        {productSet.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 uppercase tracking-[0.3em] font-bold">Premium Curation</p>
                                </div>

                                <div className="flex items-end gap-4 pb-6 border-b border-white/10">
                                    <span className="text-3xl md:text-4xl font-black text-white">₹{Number(productSet.price).toLocaleString()}</span>
                                    <span className="text-gray-500 mb-2 font-medium">Incl. all taxes</span>
                                </div>

                                {productSet.product_set_detail?.description && (
                                    <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                                        {productSet.product_set_detail.description}
                                    </p>
                                )}

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <Gift className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Luxurious Packaging</h4>
                                            <p className="text-sm text-gray-500">Perfectly boxed for your unforgettable gift moments.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">The Perfect Assortment</h4>
                                            <p className="text-sm text-gray-500">A curated selection of our most loved fragrances.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">Authenticity Guaranteed</h4>
                                            <p className="text-sm text-gray-500">Official CBZ collection. SKU: {productSet.sku}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-16 rounded-2xl text-xl font-black shadow-[0_10px_30px_rgba(217,119,6,0.3)] transition-all active:scale-95 group">
                                            Order via WhatsApp
                                            <ArrowLeft className="w-6 h-6 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </a>
                                    <p className="text-center mt-6 text-xs text-gray-600 uppercase tracking-widest font-bold">
                                        Free Express Shipping on Gift Sets
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="mt-32 pt-20 border-t border-white/5">
                            <div className="grid md:grid-cols-3 gap-16">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Top Notes</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        {productSet.product_set_detail?.top_notes || "Experience the variety of CBZ Perfumes. This set includes a selection of our signature scents."}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Heart Notes</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        {productSet.product_set_detail?.heart_notes || "Whether for a birthday, anniversary, or a special celebration, our gift sets are designed to leave a lasting impression."}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold font-serif text-amber-500">Base Notes</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        {productSet.product_set_detail?.base_notes || "Official CBZ collection. Each set is a masterpiece of curation and luxury."}
                                    </p>
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
