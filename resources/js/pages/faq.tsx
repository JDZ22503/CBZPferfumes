import { Head } from '@inertiajs/react';
import React from 'react';
import FrontendNavbar from '@/components/FrontendNavbar';
import FrontendFooter from '@/components/FrontendFooter';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const faqs = [
        {
            question: "How long do CBZ perfumes last?",
            answer: "Our perfumes are formulated to be long-lasting, typically staying vibrant for 8 to 12 hours depending on skin type and environmental factors. Our 'Extrait de Parfum' concentrations last even longer."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Currently, we ship across India. We are working on expanding our reach to international enthusiasts soon. Stay tuned to our newsletter for updates!"
        },
        {
            question: "How should I store my perfume?",
            answer: "To preserve the integrity of the fragrance, store your perfume in a cool, dry place away from direct sunlight and extreme temperature fluctuations."
        },
        {
            question: "Can I return a product if I don't like the scent?",
            answer: "Due to the nature of our products, we only accept returns for damaged or incorrect items. We recommend trying our sample sets before committing to a full-sized bottle."
        }
    ];

    return (
        <>
            <Head>
                <title>FAQ - Common Questions | CBZ Perfumes</title>
                <meta name="description" content="Frequently Asked Questions about CBZ Perfumes, our fragrances, shipping policies, and product care." />
            </Head>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
                <FrontendNavbar />

                {/* Header */}
                <div className="pt-32 pb-12 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 uppercase tracking-widest">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Find answers to common questions about our products and services.
                        </p>
                    </div>
                </div>

                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden shadow-lg hover:border-amber-500/20 transition-all duration-300">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <h3 className="text-lg font-bold text-gray-200 group-hover:text-amber-500 transition-colors pr-4">{faq.question}</h3>
                                        <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-300" />
                                    </summary>
                                    <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <FrontendFooter />
            </div>
        </>
    );
}
