import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
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
                                            <p className="text-gray-400">info@cbzperfumes.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <Phone className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Call Us</h3>
                                            <p className="text-gray-400">+91 123 456 7890</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <MapPin className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Visit Us</h3>
                                            <p className="text-gray-400">123 Luxury Avenue, Fragrance District, Gujarat, India</p>
                                        </div>
                                    </div>
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
