import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Edit2, Image as ImageIcon, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import Swal from 'sweetalert2';

interface AttarDetail {
    id: number;
    attar_id: number;
    top_notes: string;
    description: string;
    images: string[];
    is_active: boolean;
    is_featured: boolean;
    attar: {
        name: string;
        sku: string;
    };
}

interface Props {
    details: {
        data: AttarDetail[];
        links: any[];
    };
    filters: {
        search: string;
    };
}

const breadcrumbs = [
    {
        title: 'Attar Details',
        href: '/cbz-admin/attar-details',
    },
];

export default function Index({ details, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const debouncedSearch = useCallback(
        debounce((term: string) => {
            router.get(
                route('attar-details.index'),
                { search: term },
                { preserveState: true, replace: true },
            );
        }, 300),
        [],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleToggleStatus = (id: number) => {
        router.post(route('attar-details.toggle-status', id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggleFeatured = (id: number) => {
        router.post(route('attar-details.toggle-featured', id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('attar-details.destroy', id), {
                    onSuccess: () => {
                        Swal.fire(
                            'Deleted!',
                            'Attar details have been deleted.',
                            'success',
                        );
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attar Details" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="relative max-w-xs flex-1">
                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by attar name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>
                        <Link
                            href={route('attar-details.create')}
                            className="ml-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            <span>Add Details</span>
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Attar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Notes Preview
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Gallery
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Featured
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {details.data.map((detail) => (
                                    <tr key={detail.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {detail.attar.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {detail.attar.sku}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                                                {detail.top_notes || 'No notes'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {detail.images &&
                                                detail.images.length > 0 ? (
                                                    detail.images
                                                        .slice(0, 3)
                                                        .map((img, i) => (
                                                            <img
                                                                key={i}
                                                                className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                                                                src={`${import.meta.env.VITE_API_BASE_URL}${img}`}
                                                                alt=""
                                                            />
                                                        ))
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                                        <ImageIcon className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                                {detail.images &&
                                                    detail.images.length >
                                                        3 && (
                                                        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500 ring-2 ring-white dark:ring-gray-800">
                                                            +
                                                            {detail.images
                                                                .length - 3}
                                                        </span>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(detail.id)}
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${detail.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                                            >
                                                {detail.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleFeatured(detail.id)}
                                                className="transition-colors"
                                                title={detail.is_featured ? 'Remove from featured' : 'Mark as featured'}
                                            >
                                                <Star className={`h-5 w-5 ${detail.is_featured ? 'fill-amber-500 text-amber-500' : 'text-gray-400 hover:text-amber-400'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={route(
                                                        'attar-details.edit',
                                                        detail.id,
                                                    )}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(detail.id)
                                                    }
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {details.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No attar details found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
