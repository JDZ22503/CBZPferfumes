import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { X } from 'lucide-react';

interface AttarDetail {
    id: number;
    attar_id: number;
    description: string;
    top_notes: string;
    heart_notes: string;
    base_notes: string;
    images: string[];
    attar: {
        name: string;
        sku: string;
    };
}

interface Props {
    detail: AttarDetail;
}

const breadcrumbs = [
    {
        title: 'Attar Details',
        href: '/cbz-admin/attar-details',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ detail }: Props) {
    const [existingImages, setExistingImages] = useState<string[]>(detail.images || []);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        description: detail.description || '',
        top_notes: detail.top_notes || '',
        heart_notes: detail.heart_notes || '',
        base_notes: detail.base_notes || '',
        new_images: [] as File[],
        existing_images: detail.images || [],
    });

    const removeExistingImage = (img: string) => {
        const newImages = existingImages.filter((i) => i !== img);
        setExistingImages(newImages);
        setData('existing_images', newImages);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('attar-details.update', detail.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Details - ${detail.attar.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                                Edit Attar Details: <span className="font-bold">{detail.attar.name}</span>
                            </h2>

                            <form onSubmit={submit} className="space-y-6">
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
                                        />
                                        {errors.base_notes && <div className="text-red-500 text-sm mt-1">{errors.base_notes}</div>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Gallery
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {existingImages.map((img, i) => (
                                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                 <img src={`${import.meta.env.VITE_API_BASE_URL}${img}`} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(img)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="new_images" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Add New Images
                                    </label>
                                    <input
                                        id="new_images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setData('new_images', files);
                                        }}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100
                                            dark:file:bg-gray-700 dark:file:text-gray-300"
                                    />
                                    {errors.new_images && <div className="text-red-500 text-sm mt-1">{errors.new_images}</div>}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        {processing ? 'Updating...' : 'Update Details'}
                                    </button>
                                    <Link
                                        href={route('attar-details.index')}
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
