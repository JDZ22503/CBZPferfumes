
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Mail, Phone, MapPin } from 'lucide-react';
import React from 'react';

interface Props {
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    instagram_link: string;
    whatsapp_link: string;
    facebook_link: string;
}

export default function ContactDetails({ contact_email, contact_phone, contact_address, instagram_link, whatsapp_link, facebook_link }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        contact_email: contact_email || '',
        contact_phone: contact_phone || '',
        contact_address: contact_address || '',
        instagram_link: instagram_link || '',
        whatsapp_link: whatsapp_link || '',
        facebook_link: facebook_link || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact-details.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Contact Details', href: '/cbz-admin/contact-details' }]}>
            <Head title="Contact Details" />

            <div className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Contact Details</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Manage your public contact information and social links.</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-8">
                                <div className="grid gap-6">
                                    {/* Email Address */}
                                    <div className="space-y-2">
                                        <label htmlFor="contact_email" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="contact_email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all p-4 text-lg"
                                            placeholder="info@cbzperfumes.com"
                                        />
                                        {errors.contact_email && (
                                            <p className="text-sm text-red-500 font-medium">{errors.contact_email}</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <label htmlFor="contact_phone" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            <Phone className="w-4 h-4" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            id="contact_phone"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all p-4 text-lg"
                                            placeholder="+91 123 456 7890"
                                        />
                                        {errors.contact_phone && (
                                            <p className="text-sm text-red-500 font-medium">{errors.contact_phone}</p>
                                        )}
                                    </div>

                                    {/* Instagram Link */}
                                    <div className="space-y-2">
                                        <label htmlFor="instagram_link" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                            Instagram Link
                                        </label>
                                        <input
                                            type="text"
                                            id="instagram_link"
                                            value={data.instagram_link}
                                            onChange={(e) => setData('instagram_link', e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all p-4 text-lg"
                                            placeholder="https://instagram.com/cbzperfumes"
                                        />
                                        {errors.instagram_link && (
                                            <p className="text-sm text-red-500 font-medium">{errors.instagram_link}</p>
                                        )}
                                    </div>

                                    {/* WhatsApp Link */}
                                    <div className="space-y-2">
                                        <label htmlFor="whatsapp_link" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WhatsApp Link
                                        </label>
                                        <input
                                            type="text"
                                            id="whatsapp_link"
                                            value={data.whatsapp_link}
                                            onChange={(e) => setData('whatsapp_link', e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all p-4 text-lg"
                                            placeholder="https://wa.me/919876543210"
                                        />
                                        {errors.whatsapp_link && (
                                            <p className="text-sm text-red-500 font-medium">{errors.whatsapp_link}</p>
                                        )}
                                    </div>

                                    {/* Facebook Link */}
                                    <div className="space-y-2">
                                        <label htmlFor="facebook_link" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                            Facebook Link
                                        </label>
                                        <input
                                            type="text"
                                            id="facebook_link"
                                            value={data.facebook_link}
                                            onChange={(e) => setData('facebook_link', e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all p-4 text-lg"
                                            placeholder="https://facebook.com/cbzperfumes"
                                        />
                                        {errors.facebook_link && (
                                            <p className="text-sm text-red-500 font-medium">{errors.facebook_link}</p>
                                        )}
                                    </div>

                                    {/* Physical Address */}
                                    <div className="space-y-2">
                                        <label htmlFor="contact_address" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            <MapPin className="w-4 h-4" />
                                            Physical Address
                                        </label>
                                        <textarea
                                            id="contact_address"
                                            rows={4}
                                            value={data.contact_address}
                                            onChange={(e) => setData('contact_address', e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all p-4 text-lg"
                                            placeholder="123 Luxury Avenue, Fragrance District..."
                                        />
                                        {errors.contact_address && (
                                            <p className="text-sm text-red-500 font-medium">{errors.contact_address}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-black rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.2)] text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all active:scale-95 group"
                                    >
                                        <Save className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                        Save Information
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
