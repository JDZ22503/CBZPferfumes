
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Search, Package, CheckCircle2, XCircle, Edit2, Save, X } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { debounce } from 'lodash';

interface StockItem {
    id: number;
    name: string;
    sku: string;
    image_path: string | null;
    current_stock: number;
    is_active: boolean;
    category?: string;
}

interface Props {
    items: {
        data: StockItem[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        type: 'product' | 'set' | 'attar';
        search: string;
    };
}

const breadcrumbs = [
    {
        title: 'Stocks',
        href: '/stocks',
    },
];

export default function Index({ items, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'product');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((term: string, currentType: string) => {
            router.get(
                route('stocks.index'),
                { search: term, type: currentType },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value, type);
    };

    const handleTypeChange = (newType: 'product' | 'set' | 'attar') => {
        setType(newType);
        router.get(
            route('stocks.index'),
            { search: searchTerm, type: newType },
            { preserveState: true }
        );
    };

    const toggleStatus = (id: number) => {
        router.post(route('stocks.toggle-status', id), {
            type: type
        }, {
            preserveScroll: true
        });
    };

    const startEditing = (item: StockItem) => {
        setEditingId(item.id);
        setEditValue(item.current_stock.toString());
    };

    const saveStock = (id: number) => {
        router.put(route('stocks.update', id), {
            quantity: parseInt(editValue),
            type: type
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stocks" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            <button
                                onClick={() => handleTypeChange('product')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${type === 'product' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => handleTypeChange('set')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${type === 'set' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Product Sets
                            </button>
                            <button
                                onClick={() => handleTypeChange('attar')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${type === 'attar' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Attars
                            </button>
                        </div>

                        <div className="relative flex-1 max-w-xs w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${type}s...`}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Details</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Level</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {items.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                        {item.image_path ? (
                                                            <img src={item.image_path} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</div>
                                                        {item.category && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.category}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                {item.sku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {editingId === item.id ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
                                                            className="w-20 rounded-lg border-gray-300 dark:border-gray-600 py-1 text-sm text-center dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${item.current_stock <= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        {item.current_stock}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => toggleStatus(item.id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${item.is_active ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}`}
                                                >
                                                    {item.is_active ? (
                                                        <>
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Invisible
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingId === item.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => saveStock(item.id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Save"
                                                        >
                                                            <Save className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(item)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                        title="Update Stock"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {items.links.length > 3 && (
                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing <span className="font-bold text-gray-900 dark:text-white">{items.data.length}</span> items
                                    </div>
                                    <nav className="flex items-center gap-1">
                                        {items.links.map((link, i) => (
                                            link.url ? (
                                                <button
                                                    key={i}
                                                    onClick={() => router.get(link.url!, { type, search: searchTerm }, { preserveState: true })}
                                                    className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all ${link.active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 text-sm font-medium text-gray-300 dark:text-gray-600 cursor-default"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
