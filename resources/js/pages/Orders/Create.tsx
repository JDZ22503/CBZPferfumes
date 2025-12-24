import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Plus, Trash2, Search, ShoppingCart, Minus, CreditCard, User, Calendar, ShoppingBag, ChevronUp, Package, Box, ArrowLeft, Droplet } from 'lucide-react';
import axios from 'axios';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface Party {
    id: number;
    name: string;
    type: 'customer' | 'supplier';
    phone?: string;
    email?: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    price: string;
    cost_price: string;
    stock_quantity: number;
    image_path: string | null;
    category: {
        name: string;
    } | null;
    unit: string;
}

interface ProductSet {
    id: number;
    name: string;
    sku: string;
    price: string;
    cost_price: string;
    stock_quantity: number;
    image_path: string | null;
}

interface Attar {
    id: number;
    name: string;
    sku: string;
    price: string;
    cost_price: string;
    stock_quantity: number;
    image_path: string | null;
}

// Unified item type for display
type SaleItem = (Product & { type: 'product' }) | (ProductSet & { type: 'set' }) | (Attar & { type: 'attar' });

interface OrderItem {
    product_id?: number;
    product_set_id?: number;
    attar_id?: number;
    quantity: number;
    unit_price: number;
    product_name: string;
    image_path: string | null;
}

interface Props {
    parties: Party[];
    products: Product[];
    productSets: ProductSet[];
    attars: Attar[];
}

const breadcrumbs = [
    {
        title: 'Orders',
        href: '/orders',
    },
    {
        title: 'Create',
        href: '/orders/create',
    },
];

export default function Create({ parties, products, productSets, attars }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        party_id: '',
        order_date: new Date().toISOString().split('T')[0],
        type: 'sale',
        items: [] as OrderItem[],
    });

    const [step, setStep] = useState<'select-party' | 'create-order'>('select-party');
    const [partySearch, setPartySearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState<SaleItem[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'product' | 'set' | 'attar'>('product');
    const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

    const filteredParties = parties.filter(p =>
        p.name.toLowerCase().includes(partySearch.toLowerCase()) ||
        (p.type && p.type.toLowerCase().includes(partySearch.toLowerCase())) ||
        (p.phone && p.phone.includes(partySearch))
    );

    const selectParty = (partyId: number) => {
        setData('party_id', partyId.toString());
        setStep('create-order');
    };

    // Fetch custom prices when party changes
    useEffect(() => {
        if (!data.party_id) {
            setCustomPrices({});
            return;
        }

        axios.get(route('parties.get-prices', data.party_id))
            .then(response => {
                const priceMap: Record<string, number> = {};
                if (response.data.prices) {
                    response.data.prices.forEach((p: any) => {
                        if (p.product_id) priceMap[`p_${p.product_id}`] = Number(p.price);
                        else if (p.product_set_id) priceMap[`s_${p.product_set_id}`] = Number(p.price);
                        else if (p.attar_id) priceMap[`a_${p.attar_id}`] = Number(p.price);
                    });
                }
                setCustomPrices(priceMap);
            })
            .catch(err => {
                console.error("Failed to load prices", err);
            });
    }, [data.party_id]);

    // Update cart items when customPrices change
    useEffect(() => {
        if (data.items.length === 0) return;

        let hasChanges = false;
        const newItems = data.items.map(item => {
            let key = '';
            if (item.product_id) key = `p_${item.product_id}`;
            else if (item.product_set_id) key = `s_${item.product_set_id}`;
            else if (item.attar_id) key = `a_${item.attar_id}`;

            const customPrice = customPrices[key];

            let finalPrice = customPrice;
            if (finalPrice === undefined) {
                if (item.product_id) {
                    const p = products.find(x => x.id === item.product_id);
                    finalPrice = p ? Number(p.cost_price || 0) : 0;
                } else if (item.product_set_id) {
                    const ps = productSets.find(x => x.id === item.product_set_id);
                    finalPrice = ps ? Number(ps.cost_price || 0) : 0;
                } else if (item.attar_id) {
                    const at = attars.find(x => x.id === item.attar_id);
                    finalPrice = at ? Number(at.cost_price || 0) : 0;
                } else {
                    finalPrice = 0;
                }
            }

            if (item.unit_price !== finalPrice) {
                hasChanges = true;
                return { ...item, unit_price: finalPrice };
            }
            return item;
        });

        if (hasChanges) {
            setData('items', newItems);
        }
    }, [customPrices]);

    const getEffectivePrice = (item: SaleItem) => {
        let key = '';
        if (item.type === 'product') key = `p_${item.id}`;
        else if (item.type === 'set') key = `s_${item.id}`;
        else if (item.type === 'attar') key = `a_${item.id}`;

        if (customPrices[key] !== undefined) {
            return customPrices[key];
        }
        return Number(item.cost_price || 0);
    };

    // Initial load and filtering
    useEffect(() => {
        const unifiedProducts: SaleItem[] = [
            ...products.map(p => ({ ...p, type: 'product' as const })),
            ...productSets.map(ps => ({ ...ps, type: 'set' as const })),
            ...(attars || []).map(at => ({ ...at, type: 'attar' as const }))
        ];

        setFilteredItems(
            unifiedProducts.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.sku.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = item.type === viewMode;
                return matchesSearch && matchesType;
            })
        );
    }, [searchTerm, products, productSets, attars, viewMode]);

    const addItem = (item: SaleItem) => {
        const existingItemIndex = data.items.findIndex(i =>
            (item.type === 'product' && i.product_id === item.id) ||
            (item.type === 'set' && i.product_set_id === item.id) ||
            (item.type === 'attar' && i.attar_id === item.id)
        );

        const price = getEffectivePrice(item);

        if (existingItemIndex !== -1) {
            const newItems = [...data.items];
            newItems[existingItemIndex].quantity += 1;
            newItems[existingItemIndex].unit_price = price;
            setData('items', newItems);
        } else {
            setData('items', [
                ...data.items,
                {
                    product_id: item.type === 'product' ? item.id : undefined,
                    product_set_id: item.type === 'set' ? item.id : undefined,
                    attar_id: item.type === 'attar' ? item.id : undefined,
                    quantity: 1,
                    unit_price: price,
                    product_name: item.name,
                    image_path: item.image_path,
                },
            ]);
        }
    };

    const updateQuantity = (index: number, quantity: number) => {
        const newItems = [...data.items];
        if (quantity > 0) {
            newItems[index].quantity = quantity;
            setData('items', newItems);
        }
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'));
    };

    const OrderDetailsContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Party</label>
                            <div className="relative">
                                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={data.party_id}
                                    onChange={(e) => setData('party_id', e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 pl-9 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
                                >
                                    <option value="">Select</option>
                                    {parties
                                        .filter(p => p.type === 'customer')
                                        .map((party) => (
                                            <option key={party.id} value={party.id}>
                                                {party.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            {errors.party_id && <div className="text-red-500 text-xs mt-1">{errors.party_id}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={data.order_date}
                                    onChange={(e) => setData('order_date', e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 pl-9 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
                {data.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                            <ShoppingBag className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No items added yet</p>
                    </div>
                ) : (
                    data.items.map((item, index) => (
                        <div key={index} className="group flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image_path ? (
                                    <img src={item.image_path} alt={item.product_name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <ShoppingCart className="h-5 w-5 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product_name}</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                    <span>₹{item.unit_price.toFixed(2)}</span>
                                    {item.product_set_id && <span className="text-indigo-500 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">SET</span>}
                                    {item.attar_id && <span className="text-rose-500 text-[10px] bg-rose-50 dark:bg-rose-900/30 px-1 rounded">ATTAR</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                        className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 transition-all shadow-sm"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val >= 0) {
                                                if (val === 0) removeItem(index);
                                                else updateQuantity(index, val);
                                            }
                                        }}
                                        className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                        className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 transition-all shadow-sm"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{calculateTotal().toFixed(2)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.items.length} Items</p>
                    </div>
                </div>
                <button
                    onClick={submit}
                    disabled={processing || data.items.length === 0 || !data.party_id}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
                >
                    <CreditCard className="h-5 w-5" />
                    {processing ? 'Processing...' : 'Complete Order'}
                </button>
            </div>
        </div>
    );

    if (step === 'select-party') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Select Party" />
                <div className="bg-background min-h-[calc(100vh-4rem)]  p-4 md:p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a Party</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Choose a customer or supplier to create an order for. Prices will be adjusted based on the selected party.
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parties by name..."
                                value={partySearch}
                                onChange={(e) => setPartySearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 dark:text-white text-lg placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-4">
                            {filteredParties.map((party) => (
                                <button
                                    key={party.id}
                                    onClick={() => selectParty(party.id)}
                                    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                        <span className="font-bold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                            {party.name.charAt(0).toUpperCase()}
                                        </span>
                                        {party.type === 'supplier' && (
                                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-fullring-2 ring-white dark:ring-gray-900 bg-orange-400" />
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {party.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            {party.type}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                        <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rotate-90" />
                                    </div>
                                </button>
                            ))}

                            {filteredParties.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No parties found matching "{partySearch}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />

            <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
                {/* Left Side: Product Selection */}
                <div className="flex-1 flex flex-col h-full overflow-hidden pb-20 md:pb-0">
                    <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10 space-y-4">
                        {/* Back and Title */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setStep('select-party')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {parties.find(p => p.id.toString() === data.party_id)?.name || 'Order'}
                            </h2>
                        </div>

                        {/* Toggle Slider */}
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl relative">
                            {/* Sliding Background */}
                            <div
                                className={`absolute top-1 bottom-1 w-[calc(33.33%-3px)] bg-indigo-600 dark:bg-indigo-500 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${viewMode === 'product' ? 'translate-x-0 left-1' :
                                    viewMode === 'set' ? 'left-[33.33%]' :
                                        'left-[66.66%] -translate-x-1'
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
                                <span className="hidden sm:inline">Single Bottle</span>
                                <span className="sm:hidden">Single</span>
                            </button>
                            <button
                                onClick={() => setViewMode('set')}
                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${viewMode === 'set'
                                    ? 'text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Box className="h-4 w-4" />
                                <span className="hidden sm:inline">Gift Set</span>
                                <span className="sm:hidden">Set</span>
                            </button>
                            <button
                                onClick={() => setViewMode('attar')}
                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${viewMode === 'attar'
                                    ? 'text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Droplet className="h-4 w-4" />
                                <span className="hidden sm:inline">Attars</span>
                                <span className="sm:hidden">Attars</span>
                            </button>
                        </div>

                        <div className="relative max-w-md mx-auto md:mx-0 md:max-w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${viewMode === 'product' ? 'single bottles' :
                                    viewMode === 'set' ? 'sets' : 'attars'
                                    }...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border-gray-200 bg-gray-50 pl-10 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredItems.map((item) => {
                                const cartItem = data.items.find(i =>
                                    (item.type === 'product' && i.product_id === item.id) ||
                                    (item.type === 'set' && i.product_set_id === item.id) ||
                                    (item.type === 'attar' && i.attar_id === item.id)
                                );
                                const quantity = cartItem ? cartItem.quantity : 0;
                                const effectivePrice = getEffectivePrice(item);
                                const defaultPrice = Number(item.cost_price || 0);
                                const hasOverride = effectivePrice !== defaultPrice;

                                return (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        className={`group flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border transition-all duration-200 overflow-hidden text-left h-full ${quantity > 0 ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                                            }`}
                                    >
                                        <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                            {item.image_path ? (
                                                <img
                                                    src={item.image_path}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <ShoppingCart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                                </div>
                                            )}

                                            {quantity > 0 && (
                                                <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                                    {quantity} in cart
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {item.type === 'product' && item.category ? item.category.name : (
                                                        item.type === 'set' ? 'Product Set' :
                                                            item.type === 'attar' ? 'Attar' : 'Uncategorized'
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex flex-col">
                                                        {Number(item.price) > effectivePrice && (
                                                            <span className="text-xs text-gray-400 line-through">₹{Number(item.price).toFixed(2)}</span>
                                                        )}
                                                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                                            ₹{effectivePrice.toFixed(2)}
                                                        </p>
                                                    </div>

                                                    {item.type === 'product' && (
                                                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                            <Package className="h-3 w-3" />
                                                            <span>{item.unit}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {quantity > 0 ? (
                                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const itemIndex = data.items.findIndex(i =>
                                                                    (item.type === 'product' && i.product_id === item.id) ||
                                                                    (item.type === 'set' && i.product_set_id === item.id) ||
                                                                    (item.type === 'attar' && i.attar_id === item.id)
                                                                );
                                                                if (itemIndex > -1) updateQuantity(itemIndex, quantity - 1);
                                                            }}
                                                            className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 transition-all shadow-sm"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={quantity}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (!isNaN(val) && val >= 0) {
                                                                    const itemIndex = data.items.findIndex(i =>
                                                                        (item.type === 'product' && i.product_id === item.id) ||
                                                                        (item.type === 'set' && i.product_set_id === item.id) ||
                                                                        (item.type === 'attar' && i.attar_id === item.id)
                                                                    );
                                                                    if (itemIndex > -1) {
                                                                        if (val === 0) removeItem(itemIndex);
                                                                        else updateQuantity(itemIndex, val);
                                                                    }
                                                                }
                                                            }}
                                                            className="w-12 text-center text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const itemIndex = data.items.findIndex(i =>
                                                                    (item.type === 'product' && i.product_id === item.id) ||
                                                                    (item.type === 'set' && i.product_set_id === item.id) ||
                                                                    (item.type === 'attar' && i.attar_id === item.id)
                                                                );
                                                                if (itemIndex > -1) updateQuantity(itemIndex, quantity + 1);
                                                            }}
                                                            className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 transition-all shadow-sm"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addItem(item)}
                                                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <button className="w-full flex items-center justify-between bg-indigo-600 text-white rounded-xl px-4 py-3 shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 p-1.5 rounded-lg">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-medium text-indigo-100">{data.items.length} Items</p>
                                        <p className="text-sm font-bold">₹{calculateTotal().toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                    View Cart <ChevronUp className="h-4 w-4" />
                                </div>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-[20px]">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Order Details</SheetTitle>
                            </SheetHeader>
                            <div className="h-full overflow-hidden rounded-t-[20px]">
                                <OrderDetailsContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Right Side: Order Details */}
                <div className="hidden md:flex w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 flex-col h-full z-20">
                    <OrderDetailsContent />
                </div>
            </div>
        </AppLayout>
    );
}
