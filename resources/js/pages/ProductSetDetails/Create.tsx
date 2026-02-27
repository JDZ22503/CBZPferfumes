import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ProductSet {
    id: number;
    name: string;
    sku: string;
}

interface Props {
    productSets: ProductSet[];
}

const breadcrumbs = [
    {
        title: 'Gift Set Details',
        href: '/cbz-admin/gift-set-details',
    },
    {
        title: 'Create',
        href: '/cbz-admin/gift-set-details/create',
    },
];

export default function Create({ productSets }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_set_id: '',
        description: '',
        top_notes: '',
        heart_notes: '',
        base_notes: '',
        images: [] as File[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('gift-set-details.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Gift Set Details" />

            <div className="py-6">
                <div className="mx-auto max-max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Add Gift Set Details</h2>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="product_set_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Select Gift Set
                                    </label>
                                    <select
                                        id="product_set_id"
                                        value={data.product_set_id}
                                        onChange={(e) => setData('product_set_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                        required
                                    >
                                        <option value="">Select a gift set</option>
                                        {productSets.map((set) => (
                                            <option key={set.id} value={set.id}>
                                                {set.name} ({set.sku})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product_set_id && <div className="text-red-500 text-sm mt-1">{errors.product_set_id}</div>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                    />
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label htmlFor="top_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Top Notes
                                        </label>
                                        <input
                                            id="top_notes"
                                            type="text"
                                            value={data.top_notes}
                                            onChange={(e) => setData('top_notes', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                            placeholder="e.g., Bergamot, Lemon"
                                        />
                                        {errors.top_notes && <div className="text-red-500 text-sm mt-1">{errors.top_notes}</div>}
                                    </div>
                                    <div>
                                        <label htmlFor="heart_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Heart Notes
                                        </label>
                                        <input
                                            id="heart_notes"
                                            type="text"
                                            value={data.heart_notes}
                                            onChange={(e) => setData('heart_notes', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                            placeholder="e.g., Rose, Jasmine"
                                        />
                                        {errors.heart_notes && <div className="text-red-500 text-sm mt-1">{errors.heart_notes}</div>}
                                    </div>
                                    <div>
                                        <label htmlFor="base_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Base Notes
                                        </label>
                                        <input
                                            id="base_notes"
                                            type="text"
                                            value={data.base_notes}
                                            onChange={(e) => setData('base_notes', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                            placeholder="e.g., Musk, Amber"
                                        />
                                        {errors.base_notes && <div className="text-red-500 text-sm mt-1">{errors.base_notes}</div>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Gallery Images
                                    </label>
                                    <input
                                        id="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setData('images', files);
                                        }}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100
                                            dark:file:bg-gray-700 dark:file:text-gray-300"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 uppercase tracking-widest">You can select multiple images</p>
                                    {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        {processing ? 'Saving...' : 'Save Details'}
                                    </button>
                                    <Link
                                        href={route('gift-set-details.index')}
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
