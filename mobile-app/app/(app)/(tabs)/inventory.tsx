import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import client from '../../../src/api/client';
import { IMAGE_BASE_URL } from '../../../src/api/config';

type InventoryType = 'products' | 'product-sets' | 'attars';

export default function Inventory() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<InventoryType>('products');

    return (
        <View style={styles.container}>
            <Tabs.Screen
                options={{
                    title: 'Inventory',
                }}
            />

            {/* Custom Tabs */}
            <View style={styles.tabContainer}>
                <TabButton title="Products" isActive={activeTab === 'products'} onPress={() => setActiveTab('products')} />
                <TabButton title="Product Sets" isActive={activeTab === 'product-sets'} onPress={() => setActiveTab('product-sets')} />
                <TabButton title="Attars" isActive={activeTab === 'attars'} onPress={() => setActiveTab('attars')} />
            </View>

            {/* Content List */}
            <InventoryList key={activeTab} type={activeTab} />
        </View>
    );
}

const TabButton = ({ title, isActive, onPress }: { title: string, isActive: boolean, onPress: () => void }) => (
    <TouchableOpacity style={[styles.tab, isActive && styles.activeTab]} onPress={onPress}>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
);

const InventoryList = ({ type }: { type: InventoryType }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        setPage(1);
        fetchData(1, true);
    }, [debouncedSearch]);

    const fetchData = async (pageNum: number, shouldRefresh = false) => {
        try {
            const query = shouldRefresh ? debouncedSearch : debouncedSearch;
            // Map type to endpoint
            const endpoint = type === 'product-sets' ? '/product-sets' : `/${type}`;

            const res = await client.get(`${endpoint}?page=${pageNum}&search=${query}`);
            const newData = res.data.data;

            if (pageNum === 1 || shouldRefresh) {
                setData(newData);
            } else {
                setData(prev => [...prev, ...newData]);
            }
            setHasMore(!!res.data.next_page_url);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => {
                const next = prev + 1;
                fetchData(next);
                return next;
            });
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return 'https://via.placeholder.com/100';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${IMAGE_BASE_URL}${cleanPath}`;
    };

    const getEditRoute = (item: any) => {
        if (type === 'products') return `/(app)/(tabs)/products/form?id=${item.id}`;
        if (type === 'product-sets') return `/(app)/(tabs)/product-sets/form?id=${item.id}`;
        if (type === 'attars') return `/(app)/(tabs)/attars/form?id=${item.id}`;
        return '';
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: getImageUrl(item.image_path) }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.sku}>SKU: {item.sku}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#e0f2fe' }]}>
                    <Text style={[styles.statusText, { color: '#0284c7' }]}>Active</Text>
                </View>
            </View>

            <View style={styles.stockContainer}>
                <Text style={styles.stockLabel}>Stock</Text>
                <Text style={[styles.stockValue, item.stock?.quantity == 0 ? styles.stockZero : styles.stockOk]}>
                    {item.stock?.quantity || 0}
                </Text>
            </View>

            <TouchableOpacity onPress={() => router.push(getEditRoute(item) as any)} style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.searchWrapper}>
                <Ionicons name="search" size={20} color="#888" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${type.replace('-', ' ')}...`}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading && page === 1 && !refreshing ? (
                <ActivityIndicator style={{ marginTop: 20 }} size="large" />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); setPage(1); fetchData(1, true); }}
                    contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No items found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 5, margin: 10, borderRadius: 8, elevation: 1 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
    activeTab: { backgroundColor: '#2E8B57' },
    tabText: { color: '#666', fontWeight: '500' },
    activeTabText: { color: '#fff', fontWeight: 'bold' },

    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 10, marginBottom: 10, paddingHorizontal: 10, borderRadius: 8, elevation: 1, height: 45 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    itemContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginBottom: 8, borderRadius: 8, alignItems: 'center', elevation: 1 },
    image: { width: 50, height: 50, borderRadius: 6, backgroundColor: '#eee' },
    info: { flex: 1, marginLeft: 12 },
    name: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    sku: { fontSize: 13, color: '#888', marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    stockContainer: { alignItems: 'center', marginRight: 15, minWidth: 40 },
    stockLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
    stockValue: { fontSize: 16, fontWeight: 'bold' },
    stockZero: { color: '#EF4444' },
    stockOk: { color: '#2E8B57' },

    editBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 },
});
