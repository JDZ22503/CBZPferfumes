import { Head } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Terms() {
    return (
        <>
            <Head>
                <title>Terms & Conditions - CBZ Perfumes</title>
                <meta name="description" content="Read the terms and conditions for using CBZ Perfumes' website and services. Understanding your rights and responsibilities." />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 uppercase tracking-widest">
                            Terms & Conditions
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Please read these terms carefully before using our services.
                        </p>
                    </div>
                </div>

                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose prose-invert prose-amber max-w-none space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">1. Introduction</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    Welcome to CBZ Perfumes. These Terms and Conditions govern your use of our website and purchase of our products. By accessing our site, you agree to be bound by these terms.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">2. Intellectual Property</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    All content on this website, including text, graphics, logos, images, and software, is the property of CBZ Perfumes and is protected by international copyright laws.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">3. Product Information</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We attempt to be as accurate as possible in describing our products. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or error-free.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">4. Pricing</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We shall not be liable to you or any third party for any price change.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">5. Limitation of Liability</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    CBZ Perfumes shall not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, our products or services.
                                </p>
                            </section>
                        </div>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
