

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Package, DollarSign } from 'lucide-react';
import { useCallback, useState } from 'react';
import { debounce } from 'lodash';
import Swal from 'sweetalert2';

interface ProductSet {
    id: number;
    name: string;
    sku: string;
    price: string;
    cost_price: string;
    stock_quantity: number;
    image_path: string | null;
}

interface Props {
    productSets: {
        data: ProductSet[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search: string;
    };
}

const breadcrumbs = [
    {
        title: 'Gift Sets',
        href: '/product-sets',
    },
];

export default function Index({ productSets, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            router.get(
                route('product-sets.index'),
                { search: term },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gift Sets" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search gift sets..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border-gray-300 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                        <Link
                            href={route('product-sets.create')}
                            className="ml-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Add Product Set</span>
                            <span className="sm:hidden">Add</span>
                        </Link>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 sm:hidden">
                        {productSets.data.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {product.image_path ? (
                                            <img
                                                src={product.image_path}
                                                alt={product.name}
                                                className="h-12 w-12 rounded-lg object-cover bg-gray-100"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{product.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            ₹{Number(product.price).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
                                    <div className="flex items-center">
                                        Cost: ₹{Number(product.cost_price).toFixed(2)}
                                    </div>
                                    <div className="flex gap-3">
                                        <Link
                                            href={route('product-sets.edit', product.id)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Are you sure?',
                                                    text: "You won't be able to revert this!",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#3085d6',
                                                    cancelButtonColor: '#d33',
                                                    confirmButtonText: 'Yes, delete it!'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        router.delete(route('product-sets.destroy', product.id));
                                                    }
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Set</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {productSets.data.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image_path ? (
                                                    <img
                                                        src={product.image_path}
                                                        alt={product.name}
                                                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover bg-gray-100"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                            <div className="text-gray-900 dark:text-white font-medium">₹{Number(product.price).toFixed(2)}</div>
                                            <div className="text-xs">Cost: ₹{Number(product.cost_price).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock_quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('product-sets.edit', product.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'Yes, delete it!'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                router.delete(route('product-sets.destroy', product.id));
                                                            }
                                                        });
                                                    }}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        {productSets.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={productSets.links[0].url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!productSets.links[0].url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={productSets.links[productSets.links.length - 1].url || '#'}
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!productSets.links[productSets.links.length - 1].url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Next
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{(productSets.data.length > 0) ? productSets.data[0].id : 0}</span> to <span className="font-medium">{productSets.data.length > 0 ? productSets.data[productSets.data.length - 1].id : 0}</span> of{' '}
                                            <span className="font-medium">{productSets.data.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            {productSets.links.map((link, i) => (
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${link.active
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                            : 'text-gray-900 dark:text-gray-300 ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                                                            } ${i === 0 ? 'rounded-l-md' : ''} ${i === productSets.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 cursor-default ${i === 0 ? 'rounded-l-md' : ''} ${i === productSets.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
