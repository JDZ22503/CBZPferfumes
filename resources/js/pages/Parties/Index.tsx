import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Phone, Mail, MapPin } from 'lucide-react';
import { useState, useCallback } from 'react';
import PartyDetailsModal from './PartyDetailsModal';
import { debounce } from 'lodash';

interface Party {
    id: number;
    name: string;
    type: 'customer' | 'supplier';
    phone: string | null;
    email: string | null;
    address: string | null;
    gst_no: string | null;
    balance: string;
    image_path: string | null;
}

interface Props {
    parties: {
        data: Party[];
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
        title: 'Parties',
        href: '/parties',
    },
];

export default function Index({ parties, filters }: Props) {
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            router.get(
                route('parties.index'),
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

    const openDetails = (party: Party) => {
        setSelectedParty(party);
        setIsSheetOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parties" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parties..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-300 shadow-sm transition-all"
                            />
                        </div>
                        <Link
                            href={route('parties.create')}
                            className="ml-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                        >
                            <Plus className="h-5 w-5 mr-1.5" />
                            <span className="hidden sm:inline">Add Party</span>
                            <span className="sm:hidden">Add</span>
                        </Link>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 sm:hidden">
                        {parties.data.map((party) => (
                            <div
                                key={party.id}
                                onClick={() => openDetails(party)}
                                className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-indigo-500/30"
                            >
                                <div className="flex items-start space-x-4">
                                    {party.image_path ? (
                                        <img src={party.image_path} alt={party.name} className="h-12 w-12 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-bold border border-indigo-100 dark:border-indigo-800">
                                            {party.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate pr-2">{party.name}</h3>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide mt-1 ${party.type === 'customer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {party.type}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-bold ${(Number(party.balance) < 0 && party.type === 'supplier') || (Number(party.balance) > 0 && party.type === 'customer') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    ₹{Math.abs(Number(party.balance)).toFixed(2)}
                                                </p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Balance</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 space-y-1.5">
                                            {party.phone && (
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <Phone className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                    {party.phone}
                                                </div>
                                            )}
                                            {party.address && (
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <MapPin className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                    <span className="truncate">{party.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Party</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {parties.data.map((party) => (
                                    <tr
                                        key={party.id}
                                        onClick={() => openDetails(party)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {party.image_path ? (
                                                        <img className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-gray-700" src={party.image_path} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                                            {party.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{party.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{party.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${party.type === 'customer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {party.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center mb-1">
                                                <Phone className="h-3 w-3 mr-1.5 opacity-70" />
                                                {party.phone || '-'}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1.5 opacity-70" />
                                                <span className="truncate max-w-xs">{party.address || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <span className={(Number(party.balance) < 0 && party.type === 'supplier') || (Number(party.balance) > 0 && party.type === 'customer') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                                                ₹{Math.abs(Number(party.balance)).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                <span className="sr-only">Open</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        {parties.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={parties.links[0].url || '#'}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!parties.links[0].url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={parties.links[parties.links.length - 1].url || '#'}
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!parties.links[parties.links.length - 1].url && 'pointer-events-none opacity-50'}`}
                                    >
                                        Next
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{(parties.data.length > 0) ? parties.data[0].id : 0}</span> to <span className="font-medium">{parties.data.length > 0 ? parties.data[parties.data.length - 1].id : 0}</span> of{' '}
                                            <span className="font-medium">{parties.data.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            {parties.links.map((link, i) => (
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${link.active
                                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                            : 'text-gray-900 dark:text-gray-300 ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                                                            } ${i === 0 ? 'rounded-l-md' : ''} ${i === parties.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 cursor-default ${i === 0 ? 'rounded-l-md' : ''} ${i === parties.links.length - 1 ? 'rounded-r-md' : ''}`}
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

            <PartyDetailsModal
                party={selectedParty}
                open={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
        </AppLayout>
    );
}
