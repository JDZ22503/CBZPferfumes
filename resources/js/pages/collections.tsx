import { Button } from '@/components/ui/button';
import { type SharedData, type Product, type PaginatedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Collections({
    products,
}: {
    products: PaginatedData<Product>;
}) {
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

                {/* Product Grid */}
                <section className="py-12 relative overflow-hidden min-h-[50vh]">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
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
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Button className="bg-white text-black hover:bg-gray-200">
                                                    Quick View
                                                </Button>
                                            </div>
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
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    No products found in this collection.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {products.links.length > 3 && (
                            <div className="flex justify-center gap-2 flex-wrap">
                                {products.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${link.active
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-gray-600 cursor-default"
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
