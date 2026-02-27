import { Button } from '@/components/ui/button';
import { type Product, type PaginatedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { ArrowRight } from 'lucide-react';

export default function PublicProducts({
    products,
}: {
    products: PaginatedData<Product>;
}) {
    return (
        <>
            <Head title="Our Products - CBZ Perfumes" />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                            Our Products
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Explore our exquisite range of fragrances.
                        </p>
                    </div>
                </div>

                <section className="py-12 relative overflow-hidden min-h-[50vh]">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mb-16">
                            {products.data.length > 0 ? (
                                products.data.map((product) => {
                                    let image = product.image_path;
                                    const detail = product.product_detail;
                                    if (!image && detail?.images && detail.images.length > 0) {
                                        image = detail.images[0];
                                    }

                                    return (
                                        <Link key={product.id} href={route('products.show', product.id)} className="group block bg-[#080808] p-3 rounded-[2.5rem] border border-white/5 hover:border-amber-500/20 transition-all duration-500 shadow-2xl">
                                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-inner">
                                                {image ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_BASE_URL}${image}`}
                                                        alt={product.name}
                                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-serif text-6xl opacity-20 bg-zinc-900">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            
                                            <div className="mt-5 px-3 pb-2">
                                                <h3 className="text-white font-bold text-xl group-hover:text-amber-500 transition-colors tracking-tight uppercase truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em] mt-1 mb-6">
                                                    Eau de Parfum
                                                </p>
                                                
                                                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                                                    <span className="text-white font-black text-2xl tracking-tighter">
                                                        ₹{Number(product.price).toLocaleString()}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300">
                                                        <ArrowRight className="w-5 h-5 text-white group-hover:text-black" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    No products found.
                                </div>
                            )}
                        </div>

                        {products.links.length > 3 && (
                            <div className="flex justify-center gap-2 flex-wrap mt-12">
                                {products.links.map((link, i) => (
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
