
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import React, { useRef } from 'react';

interface Props {
    settings: {
        [key: string]: string;
    };
}

interface SettingsForm {
    settings: {
        company_name: string;
        company_address: string;
        company_gstin: string;
        invoice_terms: string;
        company_logo: File | string | null;
        gst_rate: string;
        default_discount: string;
        default_scheme: string;
        default_rt_rp: string;
        default_free: string;
        bank_name: string;
        account_no: string;
        ifsc_code: string;
        upi_id: string;
    }
}

export default function InvoiceSettings({ settings }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, hasErrors, errors } = useForm<SettingsForm>({
        settings: {
            company_name: settings.company_name || '',
            company_address: settings.company_address || '',
            company_gstin: settings.company_gstin || '',
            invoice_terms: settings.invoice_terms || '',
            company_logo: settings.company_logo || null,
            gst_rate: settings.gst_rate || '18',
            default_discount: settings.default_discount || '',
            default_scheme: settings.default_scheme || '',
            default_rt_rp: settings.default_rt_rp || '',
            default_free: settings.default_free || '',
            bank_name: settings.bank_name || '',
            account_no: settings.account_no || '',
            ifsc_code: settings.ifsc_code || '',
            upi_id: settings.upi_id || '',
        },
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.update'), {
            preserveScroll: true,
            forceFormData: true, // Important for file uploads
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('settings', { ...data.settings, company_logo: file });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Invoice Settings', href: '/invoice-settings' }]}>
            <Head title="Invoice Settings" />

            <div className="py-12 px-6 rounded">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 rounded border">
                            <h2 className="text-xl font-bold mb-6">Invoice Settings</h2>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Company Logo */}
                                <div>
                                    <label htmlFor="company_logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Company Logo
                                    </label>
                                    <div className="mt-2 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="shrink-0 bg-white dark:bg-gray-700/50 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                                            {/* Preview */}
                                            {typeof data.settings.company_logo === 'string' && (
                                                <img
                                                    className="w-32 h-32 object-contain rounded-md bg-white"
                                                    src={data.settings.company_logo}
                                                    alt="Current Logo"
                                                />
                                            )}
                                            {data.settings.company_logo instanceof File && (
                                                <img
                                                    className="w-32 h-32 object-contain rounded-md bg-white"
                                                    src={URL.createObjectURL(data.settings.company_logo)}
                                                    alt="New Logo Preview"
                                                />
                                            )}
                                            {!data.settings.company_logo && (
                                                <div className="w-32 h-32 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                                    No Logo Selected
                                                </div>
                                            )}
                                        </div>
                                        <label className="block w-full sm:w-auto">
                                            <span className="sr-only">Choose logo</span>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="block w-full text-sm text-slate-500 dark:text-slate-400
                                                    file:mr-4 file:py-2.5 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-indigo-50 file:text-indigo-700
                                                    hover:file:bg-indigo-100
                                                    dark:file:bg-indigo-900/30 dark:file:text-indigo-300
                                                    cursor-pointer file:cursor-pointer
                                                "
                                            />
                                        </label>
                                    </div>
                                    {errors['settings.company_logo'] && (
                                        <p className="mt-2 text-sm text-red-600">{errors['settings.company_logo']}</p>
                                    )}
                                </div>

                                {/* Company Name */}
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.settings.company_name}
                                        onChange={(e) => setData('settings', { ...data.settings, company_name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* GST Rate */}
                                <div>
                                    <label htmlFor="gst_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        GST Rate (%)
                                    </label>
                                    <input
                                        type="text"
                                        id="gst_rate"
                                        inputMode="decimal"
                                        value={data.settings.gst_rate}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                            // Allow only one decimal point
                                            const parts = val.split('.');
                                            const finalVal = parts.length > 2
                                                ? parts[0] + '.' + parts.slice(1).join('')
                                                : val;
                                            setData('settings', { ...data.settings, gst_rate: finalVal });
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="18"
                                    />
                                </div>

                                {/* Column Defaults Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Default Discount */}
                                    <div>
                                        <label htmlFor="default_discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Default Discount Text
                                        </label>
                                        <input
                                            type="text"
                                            id="default_discount"
                                            value={data.settings.default_discount}
                                            onChange={(e) => setData('settings', { ...data.settings, default_discount: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>

                                    {/* Default Scheme */}
                                    <div>
                                        <label htmlFor="default_scheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Default Scheme (Sch.) Text
                                        </label>
                                        <input
                                            type="text"
                                            id="default_scheme"
                                            value={data.settings.default_scheme}
                                            onChange={(e) => setData('settings', { ...data.settings, default_scheme: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>

                                    {/* Default RT/RP */}
                                    <div>
                                        <label htmlFor="default_rt_rp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Default RT/RP Text
                                        </label>
                                        <input
                                            type="text"
                                            id="default_rt_rp"
                                            value={data.settings.default_rt_rp}
                                            onChange={(e) => setData('settings', { ...data.settings, default_rt_rp: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>

                                    {/* Default Free */}
                                    <div>
                                        <label htmlFor="default_free" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Default Free Text
                                        </label>
                                        <input
                                            type="text"
                                            id="default_free"
                                            value={data.settings.default_free}
                                            onChange={(e) => setData('settings', { ...data.settings, default_free: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Company Address */}
                                <div>
                                    <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Company Address
                                    </label>
                                    <textarea
                                        id="company_address"
                                        rows={3}
                                        value={data.settings.company_address}
                                        onChange={(e) => setData('settings', { ...data.settings, company_address: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Company GSTIN */}
                                <div>
                                    <label htmlFor="company_gstin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Company GSTIN
                                    </label>
                                    <input
                                        type="text"
                                        id="company_gstin"
                                        value={data.settings.company_gstin}
                                        onChange={(e) => setData('settings', { ...data.settings, company_gstin: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Bank Details Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Bank Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Bank Name
                                            </label>
                                            <input
                                                type="text"
                                                id="bank_name"
                                                value={data.settings.bank_name}
                                                onChange={(e) => setData('settings', { ...data.settings, bank_name: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="account_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Bank Account Number
                                            </label>
                                            <input
                                                type="text"
                                                id="account_no"
                                                value={data.settings.account_no}
                                                onChange={(e) => setData('settings', { ...data.settings, account_no: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                IFSC Code
                                            </label>
                                            <input
                                                type="text"
                                                id="ifsc_code"
                                                value={data.settings.ifsc_code}
                                                onChange={(e) => setData('settings', { ...data.settings, ifsc_code: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                UPI ID (for QR Code)
                                            </label>
                                            <input
                                                type="text"
                                                id="upi_id"
                                                value={data.settings.upi_id}
                                                onChange={(e) => setData('settings', { ...data.settings, upi_id: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="e.g. username@bank"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Invoice Terms */}
                                <div>
                                    <label htmlFor="invoice_terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Invoice Terms & Conditions
                                    </label>
                                    <textarea
                                        id="invoice_terms"
                                        rows={4}
                                        value={data.settings.invoice_terms}
                                        onChange={(e) => setData('settings', { ...data.settings, invoice_terms: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Settings
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
