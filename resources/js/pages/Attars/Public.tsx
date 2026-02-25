import { Button } from '@/components/ui/button';
import { type Attar, type PaginatedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { ArrowRight } from 'lucide-react';

interface PublicAttar extends Attar {
    id: number;
    name: string;
    price: string | number;
    image_path: string | null;
}

export default function PublicAttars({
    attars,
}: {
    attars: PaginatedData<PublicAttar>;
}) {
    return (
        <>
            <Head title="Our Attars - CBZ Perfumes" />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                            Our Attars
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Exquisite traditional attars for a timeless presence.
                        </p>
                    </div>
                </div>

                <section className="py-12 relative overflow-hidden min-h-[50vh]">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
                            {attars.data.length > 0 ? (
                                attars.data.map((attar) => (
                                    <Link key={attar.id} href={route('attars.show', attar.id)} className="group relative bg-black/40 rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-500">
                                        <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                                            {attar.image_path ? (
                                                <img
                                                     src={`${import.meta.env.VITE_API_BASE_URL}${attar.image_path}`}
                                                    alt={attar.name}
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-serif text-6xl opacity-30 select-none">
                                                    {attar.name.charAt(0)}
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
                                                <h3 className="font-bold text-xl group-hover:text-amber-500 transition-colors truncate pr-2">{attar.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 uppercase tracking-[0.2em] font-medium">Pure Essence</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <span className="font-bold text-white text-xl">₹{Number(attar.price).toLocaleString()}</span>
                                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-amber-500 group-hover:text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    No attars found.
                                </div>
                            )}
                        </div>

                        {attars.links.length > 3 && (
                            <div className="flex justify-center gap-2 flex-wrap">
                                {attars.links.map((link, i) => (
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
