import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Package, Box, Search, Save, AlertCircle, Loader2, Droplet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';

interface StockItem {
    id: number;
    name: string;
    sku: string;
    image_path: string | null;
    stock_id: number | null;
    current_stock: number;
    is_active: boolean;
    category?: {
        name: string;
    };
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
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Inventory',
        href: '/stocks',
    },
];

export default function Index({ items, filters }: Props) {
    const [viewMode, setViewMode] = useState<'product' | 'set' | 'attar'>(filters.type);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [localStocks, setLocalStocks] = useState<{ [key: number]: number }>({});
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            router.get(
                route('stocks.index'),
                { type: viewMode, search: term },
                { preserveState: true, replace: true }
            );
        }, 300),
        [viewMode]
    );

    useEffect(() => {
        // Reset local state when view mode (and thus items) changes
        // But actually, we want to reload the page when viewMode changes to fetch new data
        if (viewMode !== filters.type) {
            router.get(route('stocks.index'), { type: viewMode }, { preserveState: true });
        }
    }, [viewMode, filters.type]);

    useEffect(() => {
        // Initialize local stocks from props
        const stocks: { [key: number]: number } = {};
        items.data.forEach(item => {
            stocks[item.id] = item.current_stock;
        });
        setLocalStocks(stocks);
    }, [items.data]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleStockChange = (id: number, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setLocalStocks(prev => ({ ...prev, [id]: numValue }));
        }
    };

    const updateStock = (id: number) => {
        setLoadingIds(prev => [...prev, id]);
        router.put(route('stocks.update', id), {
            quantity: localStocks[id],
            type: viewMode
        }, {
            preserveScroll: true,
            onFinish: () => {
                setLoadingIds(prev => prev.filter(loadingId => loadingId !== id));
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />

            <div className="py-6 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage stock levels for your products, sets, and attars.</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">

                            {/* Toggle Slider */}
                            <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl relative w-full sm:w-auto min-w-[450px]">
                                {/* Sliding Background */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-indigo-600 dark:bg-indigo-500 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${viewMode === 'set' ? 'translate-x-[calc(100%+4px)]' :
                                            viewMode === 'attar' ? 'translate-x-[calc(200%+8px)]' :
                                                'translate-x-0 left-1'
                                        }`}
                                />

                                <button
                                    onClick={() => setViewMode('product')}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${viewMode === 'product'
                                        ? 'text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Package className="h-4 w-4" />
                                    Single Bottles
                                </button>
                                <button
                                    onClick={() => setViewMode('set')}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${viewMode === 'set'
                                        ? 'text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Box className="h-4 w-4" />
                                    Gift Sets
                                </button>
                                <button
                                    onClick={() => setViewMode('attar')}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${viewMode === 'attar'
                                        ? 'text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Droplet className="h-4 w-4" />
                                    Attars
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or SKU..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="pl-9 w-full bg-white dark:bg-gray-900"
                                />
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Details</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">Stock Level</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                                    <p className="text-lg font-medium">No items found</p>
                                                    <p className="text-sm">Try adjusting your search or switch categories.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        items.data.map((item) => {
                                            const isChanged = localStocks[item.id] !== item.current_stock;
                                            const isLoading = loadingIds.includes(item.id);

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                                                                {item.image_path ? (
                                                                    <img className="h-full w-full object-cover" src={item.image_path} alt={item.name} />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        {viewMode === 'set' ? <Box className="h-5 w-5 text-gray-400" /> :
                                                                            viewMode === 'attar' ? <Droplet className="h-5 w-5 text-gray-400" /> :
                                                                                <Package className="h-5 w-5 text-gray-400" />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                                                {item.current_stock === 0 && (
                                                                    <div className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                                                        <AlertCircle className="h-3 w-3" /> Out of Stock
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                        {item.sku}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {viewMode === 'product' && item.category ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                                {item.category.name}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                                {viewMode === 'set' ? 'Set' : viewMode === 'attar' ? 'Attar' : 'Uncategorized'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => {
                                                                router.post(route('stocks.toggle-status', item.id), {
                                                                    type: viewMode
                                                                }, {
                                                                    preserveScroll: true,
                                                                });
                                                            }}
                                                            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-24 justify-center ${item.is_active
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 focus:ring-green-500'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 focus:ring-red-500'
                                                                }`}
                                                        >
                                                            {item.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="max-w-[120px]">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={localStocks[item.id] ?? 0}
                                                                onChange={(e) => handleStockChange(item.id, e.target.value)}
                                                                className={`h-9 text-right font-medium ${localStocks[item.id] === 0
                                                                    ? 'text-red-600 border-red-300 focus-visible:ring-red-500'
                                                                    : 'text-gray-900 dark:text-white'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Button
                                                            onClick={() => updateStock(item.id)}
                                                            disabled={!isChanged || isLoading}
                                                            size="sm"
                                                            className={`shadow-sm transition-all ${isChanged
                                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'}`}
                                                        >
                                                            {isLoading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Save className="h-4 w-4 mr-1.5" />
                                                                    Save
                                                                </>
                                                            )}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                            {items.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">
                                    <div className="flex flex-col items-center justify-center">
                                        <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-lg font-medium">No items found</p>
                                    </div>
                                </div>
                            ) : (
                                items.data.map((item) => {
                                    const isChanged = localStocks[item.id] !== item.current_stock;
                                    const isLoading = loadingIds.includes(item.id);

                                    return (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                                            {/* Top Section: Info */}
                                            <div className="flex gap-4">
                                                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                                                    {item.image_path ? (
                                                        <img className="h-full w-full object-cover" src={item.image_path} alt={item.name} />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            {viewMode === 'set' ? <Box className="h-8 w-8 text-gray-400" /> :
                                                                viewMode === 'attar' ? <Droplet className="h-8 w-8 text-gray-400" /> :
                                                                    <Package className="h-8 w-8 text-gray-400" />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">{item.name}</h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{item.sku}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                router.post(route('stocks.toggle-status', item.id), {
                                                                    type: viewMode
                                                                }, {
                                                                    preserveScroll: true,
                                                                });
                                                            }}
                                                            className={`shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${item.is_active
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                }`}
                                                        >
                                                            {item.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between">
                                                        {viewMode === 'product' && item.category ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                                {item.category.name}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                                {viewMode === 'set' ? 'Set' : viewMode === 'attar' ? 'Attar' : 'Uncategorized'}
                                                            </span>
                                                        )}

                                                        {item.current_stock === 0 && (
                                                            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> Out of Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Section: Action */}
                                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Stock Quantity</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={localStocks[item.id] ?? 0}
                                                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                                                        className={`h-10 font-medium ${localStocks[item.id] === 0
                                                            ? 'text-red-600 border-red-300 focus-visible:ring-red-500'
                                                            : 'text-gray-900 dark:text-white'
                                                            }`}
                                                    />
                                                </div>
                                                <div className="self-end pb-0.5">
                                                    <Button
                                                        onClick={() => updateStock(item.id)}
                                                        disabled={!isChanged || isLoading}
                                                        className={`h-10 px-6 shadow-sm transition-all ${isChanged
                                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'}`}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Save'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {/* Pagination */}
                        {items.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={items.links[0].url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!items.links[0].url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={items.links[items.links.length - 1].url || '#'}
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!items.links[items.links.length - 1].url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Next
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{(items.data.length > 0) ? items.data[0].id : 0}</span> to <span className="font-medium">{items.data.length > 0 ? items.data[items.data.length - 1].id : 0}</span> of{' '}
                                            <span className="font-medium">{items.data.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            {items.links.map((link, i) => (
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${link.active
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                            : 'text-gray-900 dark:text-gray-300 ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                                                            } ${i === 0 ? 'rounded-l-md' : ''} ${i === items.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 cursor-default ${i === 0 ? 'rounded-l-md' : ''} ${i === items.links.length - 1 ? 'rounded-r-md' : ''}`}
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
