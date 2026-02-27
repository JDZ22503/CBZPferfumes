import { Button } from '@/components/ui/button';
import { type SharedData, type Product, type PaginatedData, type Attar, type ProductSet } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Collections({
    allItems,
    latestItems,
}: {
    allItems: PaginatedData<Product | Attar | ProductSet>;
    latestItems: (Product | Attar | ProductSet)[];
}) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

    const getItemData = (item: Product | Attar | ProductSet) => {
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

        return { type, href, image };
    };


    return (
        <>
            <Head title="Our Collections - CBZ Perfumes" />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                            Our Collections
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Explore our complete range of exquisite fragrances, designed to define your presence.
                        </p>
                    </div>
                </div>

                {/* New Arrivals Section */}
                {latestItems.length > 0 && (
                    <section className="py-12 bg-black border-y border-white/5">
                        <div className="container mx-auto px-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-amber-500 uppercase tracking-widest">New Arrivals</h2>
                                    <div className="h-0.5 w-12 bg-amber-500 mt-2"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {latestItems.map((item, idx) => {
                                    const { type, href, image } = getItemData(item);
                                    return (
                                        <Link key={`latest-${idx}`} href={href} className="group block">
                                            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 relative border border-white/5 hover:border-amber-500/30 transition-all duration-500">
                                                {image ? (
                                                    <img
                                                        src={`${apiBaseUrl}${image}`}
                                                        alt={item.name}
                                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-serif text-5xl opacity-30 select-none">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">New</span>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                     <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">Discover Details</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <h3 className="font-bold text-sm truncate uppercase tracking-wider">{item.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{type}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Unified Collection Grid */}
                <section className="py-12 relative overflow-hidden min-h-[50vh]">
                    <div className="container mx-auto px-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-gray-400">All Masterpieces</h2>
                            <span className="text-xs text-gray-600 px-4 py-1 border border-white/10 rounded-full font-mono">{allItems.total} ITEMS</span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mb-16">
                            {allItems.data.length > 0 ? (
                                allItems.data.map((item, idx) => {
                                    const { type, href, image } = getItemData(item);
                                    const itemKey = `${'product_detail' in item ? 'p' : 'attar_detail' in item ? 'a' : 'ps'}-${item.id}`;
                                    return (
                                        <Link key={itemKey} href={href} className="group block bg-[#080808] p-3 rounded-[2.5rem] border border-white/5 hover:border-amber-500/20 transition-all duration-500 shadow-2xl">
                                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-inner">
                                                {image ? (
                                                    <img
                                                        src={`${apiBaseUrl}${image}`}
                                                        alt={item.name}
                                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-serif text-6xl opacity-20 bg-zinc-900">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                )}
                                                {/* Soft overlay on hover */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            </div>
                                            
                                            <div className="mt-5 px-3 pb-2">
                                                <h3 className="text-white font-bold text-xl group-hover:text-amber-500 transition-colors tracking-tight uppercase">
                                                    {item.name}
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em] mt-1 mb-6">
                                                    {type}
                                                </p>
                                                
                                                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black text-2xl tracking-tighter">
                                                            ₹{Number(item.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300">
                                                        <ArrowRight className="w-5 h-5 text-white group-hover:text-black" />
                                                    </div>
                                                </div>
                                            </div>
                                </Link>
                                    )
                                })
                            ) : (
                                <div className="col-span-full text-center py-24 border border-dashed border-white/10 rounded-3xl">
                                    <p className="text-gray-500 font-serif italic text-lg">Our master artisans are currently preparing new treasures.</p>
                                    <p className="text-gray-700 text-xs uppercase tracking-widest mt-2">Check back soon for the latest arrivals.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Links */}
                        {allItems.links.length > 3 && (
                            <div className="flex justify-center gap-2 flex-wrap mt-12">
                                {allItems.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 ${link.active
                                                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest bg-transparent text-gray-700 cursor-default border border-transparent"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
