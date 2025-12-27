import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import client from '../../../../src/api/client';
import { IMAGE_BASE_URL } from '../../../../src/api/config';
import FloatingActionButton from '../../../../src/components/FloatingActionButton';

const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/100';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE_URL}${cleanPath}`;
};

export default function ProductSets() {
    const router = useRouter();
    const [sets, setSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Refetch when search changes
    useEffect(() => {
        setPage(1);
        fetchSets(1, true);
    }, [debouncedSearch]);

    const fetchSets = async (pageNum: number, shouldRefresh = false) => {
        try {
            const query = shouldRefresh ? debouncedSearch : debouncedSearch;
            // Assuming endpoint is /product-sets
            const response = await client.get(`/product-sets?page=${pageNum}&search=${query}`);
            const newData = response.data.data;
            if (pageNum === 1 || shouldRefresh) {
                setSets(newData);
            } else {
                setSets(prev => [...prev, ...newData]);
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
            if (page === 1 && !loading) {
                fetchSets(1, true);
            }
        }, [debouncedSearch])
    );

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => {
                const next = prev + 1;
                fetchSets(next);
                return next;
            });
        }
    };

    const deleteSet = (id: number) => {
        Alert.alert('Confirm Delete', 'Delete this product set?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await client.delete(`/product-sets/${id}`);
                        setSets(prev => prev.filter(p => p.id !== id));
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/(app)/(tabs)/product-sets/form?id=${item.id}` as any)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: getImageUrl(item.image_path) }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sku}>SKU: {item.sku}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => deleteSet(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.input}
                    placeholder="Search product sets..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading && page === 1 && !refreshing ? (
                <View style={styles.center}><ActivityIndicator size="large" /></View>
            ) : (
                <FlatList
                    data={sets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={hasMore ? <ActivityIndicator style={{ margin: 10 }} /> : null}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); setPage(1); fetchSets(1, true); }}
                    ListEmptyComponent={!loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No product sets found</Text> : null}
                />
            )}
            <FloatingActionButton onPress={() => router.push('/(app)/(tabs)/product-sets/form' as any)} />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        elevation: 2,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333'
    },
    list: { padding: 10, paddingBottom: 80 },
    itemContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 8, elevation: 2, alignItems: 'center' },
    image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
    info: { marginLeft: 15, flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    sku: { fontSize: 14, color: '#888', marginTop: 2 },
    price: { fontSize: 16, color: '#2E8B57', fontWeight: 'bold', marginTop: 4 },
    actions: { paddingLeft: 10 },
    deleteBtn: { padding: 8 }
});
