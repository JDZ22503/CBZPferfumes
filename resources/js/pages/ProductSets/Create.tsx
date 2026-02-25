import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs = [
    {
        title: 'Gift Sets',
        href: '/product-sets',
    },
    {
        title: 'Create',
        href: '/product-sets/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        cost_price: '',
        hsn_code: '',
        image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('product-sets.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product Set" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Add New Product Set</h2>

                            <form onSubmit={submit} className="space-y-6 max-w-2xl">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Product Set Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            setData((data) => ({
                                                ...data,
                                                name: name,
                                                sku: name.toLowerCase(),
                                            }));
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="hsn_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        HSN Code
                                    </label>
                                    <input
                                        id="hsn_code"
                                        type="text"
                                        value={data.hsn_code}
                                        onChange={(e) => setData('hsn_code', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                    />
                                    {errors.hsn_code && <div className="text-red-500 text-sm mt-1">{errors.hsn_code}</div>}
                                </div>

                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Product Set Image
                                    </label>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100
                                            dark:file:bg-gray-700 dark:file:text-gray-300"
                                    />
                                    {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Selling Price
                                        </label>
                                        <div className="relative mt-1 rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                            </div>
                                            <input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                                required
                                            />
                                        </div>
                                        {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                                    </div>

                                    <div>
                                        <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Cost Price
                                        </label>
                                        <div className="relative mt-1 rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                            </div>
                                            <input
                                                id="cost_price"
                                                type="number"
                                                step="0.01"
                                                value={data.cost_price}
                                                onChange={(e) => setData('cost_price', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                                required
                                            />
                                        </div>
                                        {errors.cost_price && <div className="text-red-500 text-sm mt-1">{errors.cost_price}</div>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Save Product Set
                                    </button>
                                    <Link
                                        href={route('product-sets.index')}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
