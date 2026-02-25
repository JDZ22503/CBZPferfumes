import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
    totalParties: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

export default function Dashboard({ totalParties, pendingOrders, completedOrders, cancelledOrders }: Props) {
    const stats = [
        {
            name: 'Total Parties',
            value: totalParties,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            name: 'Pending Orders',
            value: pendingOrders,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
        {
            name: 'Completed Orders',
            value: completedOrders,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            name: 'Cancelled Orders',
            value: cancelledOrders,
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/20',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.name} className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:bg-sidebar-accent/10 dark:border-sidebar-border">
                            <div className="flex items-center gap-4">
                                <div className={`rounded-lg p-3 ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
