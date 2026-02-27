import { Button } from '@/components/ui/button';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
    const { contactDetails } = usePage<any>().props;

    return (
        <>
            <Head>
                <title>Contact Us - Reach Out to CBZ Perfumes</title>
                <meta name="description" content="Get in touch with CBZ Perfumes for inquiries, orders, or support. We are here to help you find your perfect luxury fragrance." />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 uppercase tracking-widest">
                            Contact Us
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We'd love to hear from you. Get in touch with our team.
                        </p>
                    </div>
                </div>

                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-amber-500 mb-6">Get in Touch</h2>
                                    <p className="text-gray-300 leading-relaxed mb-8">
                                        Whether you have a question about our collections, shipping, or anything else, our team is ready to answer all your questions.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <Mail className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Email Us</h3>
                                            <p className="text-gray-400">{contactDetails?.email || 'info@cbzperfumes.com'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <Phone className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Call Us</h3>
                                            <p className="text-gray-400">{contactDetails?.phone || '+91 123 456 7890'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <MapPin className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Visit Us</h3>
                                            <p className="text-gray-400">{contactDetails?.address || '123 Luxury Avenue, Fragrance District, Gujarat, India'}</p>
                                        </div>
                                    </div>

                                    {contactDetails?.instagram_link && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                                <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Follow Us</h3>
                                                <a href={contactDetails.instagram_link} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">
                                                    Instagram
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/10">
                                <form className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">First Name</label>
                                            <input type="text" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-amber-500 outline-none transition-colors" placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Last Name</label>
                                            <input type="text" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-amber-500 outline-none transition-colors" placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                                        <input type="email" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-amber-500 outline-none transition-colors" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Message</label>
                                        <textarea rows={4} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-amber-500 outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
                                    </div>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-lg text-lg font-bold">
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
