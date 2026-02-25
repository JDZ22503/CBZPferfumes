import { Head } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';

export default function Privacy() {
    return (
        <>
            <Head>
                <title>Privacy Policy - CBZ Perfumes</title>
                <meta name="description" content="Learn how CBZ Perfumes collects, uses, and protects your personal information. Your privacy is our priority." />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 uppercase tracking-widest">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            How we protect and manage your personal data.
                        </p>
                    </div>
                </div>

                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose prose-invert prose-amber max-w-none space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">1. Information We Collect</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include your name, email address, shipping address, and payment information.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">2. How We Use Your Information</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We use the information we collect to process your orders, communicate with you about your account and our products, and improve our services. We do not sell your personal information to third parties.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">3. Data Security</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no method of transmission over the internet is 100% secure.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">4. Cookies</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We use cookies and similar technologies to track your activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold font-serif text-amber-500">5. Changes to This Policy</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
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
