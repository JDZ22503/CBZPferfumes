import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import client from '../../../../src/api/client'; // Up 3 levels
import FloatingActionButton from '../../../../src/components/FloatingActionButton';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async (pageNum: number, shouldRefresh = false) => {
        try {
            const response = await client.get(`/orders?page=${pageNum}`);
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

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchOrders(1, true);
        }, [])
    );

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => {
                const next = prev + 1;
                fetchOrders(next);
                return next;
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const deleteOrder = (id: number) => {
        Alert.alert('Confirm Delete', 'Delete this order?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await client.delete(`/orders/${id}`);
                        setOrders(prev => prev.filter(o => o.id !== id));
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete order');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/(app)/orders/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.orderId}>#{item.id}</Text>
                    <Text style={styles.date}>{formatDate(item.order_date)}</Text>
                </View>
                <View style={styles.partyContainer}>
                    <Text style={styles.partyName}>{item.party?.name}</Text>
                </View>
                <View style={styles.footer}>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.amount}>₹{item.total_amount}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => deleteOrder(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            {loading && page === 1 && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" /></View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={hasMore ? <ActivityIndicator style={{ margin: 10 }} /> : null}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); setPage(1); fetchOrders(1, true); }}
                />
            )}
            <FloatingActionButton onPress={() => router.push('/(app)/orders/create')} />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 10, paddingBottom: 80 },
    itemContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2, alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    orderId: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    date: { color: '#888', fontSize: 12 },
    partyContainer: { marginBottom: 10 },
    partyName: { fontSize: 16, color: '#444' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    amount: { fontSize: 18, fontWeight: 'bold', color: '#2E8B57' },
    deleteBtn: { padding: 8, marginLeft: 10 }
});
