import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

const breadcrumbs = [
    {
        title: 'Parties',
        href: '/parties',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface PartyProductPrice {
    id: number;
    party_id: number;
    product_id: number | null;
    product_set_id: number | null;
    attar_id: number | null;
    price: string;
}

interface Party {
    id: number;
    name: string;
    type: 'customer' | 'supplier';
    phone: string | null;
    email: string | null;
    address: string | null;
    gst_no: string | null;
    image_path: string | null;
    product_prices?: PartyProductPrice[];
}

interface Product {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
}

interface ProductSet {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
}

interface Attar {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
}

interface Props {
    party: Party;
    products: Product[];
    productSets: ProductSet[];
    attars: Attar[];
}

export default function Edit({ party, products = [], productSets = [], attars = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: party.name,
        type: party.type,
        phone: party.phone || '',
        email: party.email || '',
        address: party.address || '',
        gst_no: party.gst_no || '',
        image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('parties.update', party.id));
    };

    const [priceFormPrices, setPriceFormPrices] = React.useState<Record<string, string>>({});

    // Initialize prices from props
    React.useEffect(() => {
        const initialPrices: Record<string, string> = {};

        // Populate with existing custom prices
        if (party.product_prices) {
            party.product_prices.forEach(pp => {
                let key = '';
                if (pp.product_id) key = `p_${pp.product_id}`;
                else if (pp.product_set_id) key = `s_${pp.product_set_id}`;
                else if (pp.attar_id) key = `a_${pp.attar_id}`;

                if (key) initialPrices[key] = pp.price;
            });
        }

        setPriceFormPrices(initialPrices);
    }, [party.product_prices]);

    const handlePriceChange = (key: string, value: string) => {
        setPriceFormPrices(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const submitPrices = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = Object.entries(priceFormPrices).map(([key, price]) => {
            const [type, id] = key.split('_');
            return {
                product_id: type === 'p' ? parseInt(id) : undefined,
                product_set_id: type === 's' ? parseInt(id) : undefined,
                attar_id: type === 'a' ? parseInt(id) : undefined,
                price: price === '' ? null : price
            };
        });

        router.put(route('parties.update-prices', party.id), {
            prices: payload
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // maybe show toast
            }
        });
    };

    // Combine products and sets
    const allItems = [
        ...products.map(p => ({ ...p, type: 'product', key: `p_${p.id}` })),
        ...productSets.map(s => ({ ...s, type: 'set', key: `s_${s.id}` })),
        ...attars.map(a => ({ ...a, type: 'attar', key: `a_${a.id}` }))
    ];

    const [viewMode, setViewMode] = React.useState<'mass' | 'single'>('mass');

    const [massInputs, setMassInputs] = React.useState({
        product: '',
        set: '',
        attar: '',
    });

    const applyMassPrice = (type: 'product' | 'set' | 'attar') => {
        const price = massInputs[type];
        if (!price) return;

        const newPrices = { ...priceFormPrices };
        allItems.forEach(item => {
            if (item.type === type) {
                newPrices[item.key] = price;
            }
        });
        setPriceFormPrices(newPrices);
        // Optional: Show a toast or feedback that prices were updated
    };

    const applyMassMRP = (type: 'product' | 'set' | 'attar') => {
        const newPrices = { ...priceFormPrices };
        allItems.forEach(item => {
            if (item.type === type) {
                newPrices[item.key] = '';
            }
        });
        setPriceFormPrices(newPrices);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Party" />

            <div className="py-6 space-y-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Edit Party</h2>

                            <form onSubmit={submit} className="space-y-6 max-w-2xl" encType="multipart/form-data">
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Profile Image
                                    </label>

                                    {party.image_path && (
                                        <div className="mt-2 mb-4">
                                            <img
                                                src={party.image_path}
                                                alt={party.name}
                                                className="h-20 w-20 object-cover rounded-full"
                                            />
                                        </div>
                                    )}

                                    <input
                                        id="image"
                                        type="file"
                                        onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100
                                            dark:file:bg-gray-700 dark:file:text-gray-300"
                                        accept="image/*"
                                    />
                                    {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Type
                                    </label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value as 'customer' | 'supplier')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="supplier">Supplier</option>
                                    </select>
                                    {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                    />
                                    {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                    />
                                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div>
                                    <label htmlFor="gst_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        GST Number
                                    </label>
                                    <input
                                        id="gst_no"
                                        type="text"
                                        value={data.gst_no}
                                        onChange={(e) => setData('gst_no', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                    />
                                    {errors.gst_no && <div className="text-red-500 text-sm mt-1">{errors.gst_no}</div>}
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 py-2.5 px-4"
                                        rows={3}
                                    />
                                    {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Update Party
                                    </button>
                                    <Link
                                        href={route('parties.index')}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* New Section: Custom Prices */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Custom Product Prices</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage override prices for this party.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm font-medium">
                                        <button
                                            onClick={() => setViewMode('mass')}
                                            className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'mass' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                        >
                                            Mass Assign
                                        </button>
                                        <button
                                            onClick={() => setViewMode('single')}
                                            className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'single' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                        >
                                            Individual Change
                                        </button>
                                    </div>

                                    <button
                                        onClick={submitPrices}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Save Prices
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'mass' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Products', type: 'product' as const, color: 'purple' },
                                        { label: 'Gift Sets', type: 'set' as const, color: 'purple' },
                                        { label: 'Attars', type: 'attar' as const, color: 'purple' }
                                    ].map((cat) => (
                                        <div key={cat.type} className={`bg-${cat.color}-50 dark:bg-${cat.color}-900/10 rounded-lg p-4 border border-${cat.color}-100 dark:border-${cat.color}-800`}>
                                            <h3 className={`text-md font-semibold text-${cat.color}-900 dark:text-${cat.color}-100 mb-4`}>
                                                All {cat.label}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Set Fixed Price</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={massInputs[cat.type]}
                                                            onChange={(e) => setMassInputs({ ...massInputs, [cat.type]: e.target.value })}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                        <button
                                                            onClick={() => applyMassPrice(cat.type)}
                                                            className={`px-3 py-2 bg-${cat.color}-600 text-white rounded-md text-sm font-medium hover:bg-${cat.color}-700 focus:outline-none focus:ring-2 focus:ring-${cat.color}-500`}
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="px-2 bg-${cat.color}-50 dark:bg-gray-800 text-xs text-gray-500">OR</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => applyMassMRP(cat.type)}
                                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Reset to Default MRP
                                                </button>
                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Will update {allItems.filter(i => i.type === cat.type).length} items
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Default Price</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Party Price (Override)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {allItems.map((item) => (
                                                <tr key={item.key}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {item.name}
                                                                {item.type === 'set' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">Set</span>}
                                                                {item.type === 'attar' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">Attar</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">₹{item.cost_price}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={priceFormPrices[item.key] || ''}
                                                            onChange={(e) => handlePriceChange(item.key, e.target.value)}
                                                            placeholder={item.cost_price}
                                                            className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
