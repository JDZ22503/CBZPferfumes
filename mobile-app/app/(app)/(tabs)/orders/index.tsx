import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Platform, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../../../src/api/client';
import FloatingActionButton from '../../../../src/components/FloatingActionButton';
import { Colors } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY = Colors.light.primary;

const STATUS_FILTERS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

export default function Orders() {
    const router = useRouter();
    const { status: paramStatus } = useLocalSearchParams<{ status?: string }>();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter state — initialised from nav params
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState(paramStatus || '');
    const [showDateFilters, setShowDateFilters] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    // When the page receives a new status param (from dashboard), update the filter
    useEffect(() => {
        if (paramStatus !== undefined) {
            setActiveStatus(paramStatus);
        }
    }, [paramStatus]);

    const fetchOrders = async (pageNum: number, shouldRefresh = false, searchVal = search, statusVal = activeStatus, fDate = fromDate, tDate = toDate) => {
        try {
            let url = `/orders?page=${pageNum}`;
            if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;
            if (statusVal) url += `&status=${statusVal}`;
            if (fDate) url += `&from_date=${fDate}`;
            if (tDate) url += `&to_date=${tDate}`;
            const response = await client.get(url);
            const newData = response.data.data;
            if (pageNum === 1 || shouldRefresh) {
                setOrders(newData);
            } else {
                setOrders(prev => [...prev, ...newData]);
            }
            setHasMore(!!response.data.next_page_url);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refetch whenever filters change
    useEffect(() => {
        setPage(1);
        fetchOrders(1, true, search, activeStatus, fromDate, toDate);
    }, [activeStatus, fromDate, toDate]);

    // Initial load and focus refresh
    useFocusEffect(
        useCallback(() => {
            fetchOrders(page, true, search, activeStatus, fromDate, toDate);
        }, [])
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchOrders(1, true, search, activeStatus, fromDate, toDate);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => {
                const next = prev + 1;
                fetchOrders(next, false, search, activeStatus, fromDate, toDate);
                return next;
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#10B981'; // Green
            case 'pending': return '#F59E0B'; // Amber
            case 'cancelled': return '#EF4444'; // Red
            default: return '#6B7280';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return '#10B981'; // Green
            case 'partial': return '#F59E0B'; // Amber
            case 'unpaid': return '#EF4444'; // Red
            default: return '#6B7280';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/(app)/orders/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={{ flex: 1 }}>
                <View style={styles.rowHeader}>
                    <Text style={styles.orderId}>#{item.id}</Text>
                    <Text style={styles.date}>{formatDate(item.order_date)}</Text>
                </View>
                <Text style={styles.partyName}>{item.party?.name}</Text>
                <View style={styles.footer}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getPaymentStatusColor(item.payment_status) + '15' }]}>
                            <Text style={[styles.badgeText, { color: getPaymentStatusColor(item.payment_status) }]}>
                                {item.payment_status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>
                            {item.payment_status === 'paid' ? 'Paid' : 'Due:'}
                        </Text>
                        <Text style={styles.amount}>
                            ₹{item.payment_status === 'paid' ? parseFloat(item.total_amount).toFixed(2) : parseFloat(item.due_amount).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>
                            Total Amount:
                        </Text>
                        <Text style={styles.amount}>₹{item.total_amount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by order ID or party..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Chips & Filter Toggle */}
            <View style={styles.filterRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {STATUS_FILTERS.map(f => {
                        const active = activeStatus === f.value;
                        return (
                            <TouchableOpacity
                                key={f.value || 'all'}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => setActiveStatus(f.value)}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <TouchableOpacity
                        style={[styles.chip, showDateFilters && styles.chipActive, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                        onPress={() => setShowDateFilters(!showDateFilters)}
                    >
                        <Ionicons name="calendar-outline" size={16} color={showDateFilters ? '#fff' : '#6B7280'} />

                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Date Filters Section */}
            {showDateFilters && (
                <View style={styles.dateFilterSection}>
                    <View style={styles.dateInputContainer}>
                        <View style={styles.dateEntry}>
                            <Text style={styles.dateLabel}>From Date</Text>
                            <TouchableOpacity 
                                style={styles.dateInput} 
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Text style={{ color: fromDate ? '#111827' : '#9CA3AF', fontSize: 13 }}>
                                    {fromDate || 'Select Date'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateEntry}>
                            <Text style={styles.dateLabel}>To Date</Text>
                            <TouchableOpacity 
                                style={styles.dateInput} 
                                onPress={() => setShowToPicker(true)}
                            >
                                <Text style={{ color: toDate ? '#111827' : '#9CA3AF', fontSize: 13 }}>
                                    {toDate || 'Select Date'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {(fromDate || toDate) && (
                        <TouchableOpacity 
                            style={styles.clearDatesBtn}
                            onPress={() => { setFromDate(''); setToDate(''); }}
                        >
                            <Text style={styles.clearDatesText}>Clear Dates</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {showFromPicker && (
                <DateTimePicker
                    value={fromDate ? new Date(fromDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowFromPicker(false);
                        if (date) {
                            setFromDate(date.toISOString().split('T')[0]);
                        }
                    }}
                />
            )}

            {showToPicker && (
                <DateTimePicker
                    value={toDate ? new Date(toDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowToPicker(false);
                        if (date) {
                            setToDate(date.toISOString().split('T')[0]);
                        }
                    }}
                />
            )}

            {/* Orders List */}
            {loading && page === 1 && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="document-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No orders found</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={hasMore ? <ActivityIndicator style={{ margin: 10 }} color={PRIMARY} /> : null}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); setPage(1); fetchOrders(1, true); }}
                />
            )}

            <FloatingActionButton onPress={() => router.push('/orders/create')} />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontSize: 16, marginTop: 12 },

    searchContainer: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 6,
        backgroundColor: '#fff',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        paddingVertical: 0,
    },

    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dateFilterSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dateInputContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateEntry: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '600',
    },
    dateInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 13,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    clearDatesBtn: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    clearDatesText: {
        fontSize: 12,
        color: PRIMARY,
        fontWeight: '600',
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#fff',
    },

    list: { padding: 12, paddingBottom: 100 },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        alignItems: 'center',
    },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    orderId: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
    date: { color: '#9CA3AF', fontSize: 12 },
    partyName: { fontSize: 15, color: '#374151', marginBottom: 10 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeRow: { flexDirection: 'row', gap: 6 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    amountContainer: { alignItems: 'flex-end' },
    amountLabel: { fontSize: 10, color: '#6B7280', marginBottom: -2, fontWeight: '600' },
    amount: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
});
