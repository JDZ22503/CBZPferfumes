import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import client from '../../../../src/api/client';
import { IMAGE_BASE_URL } from '../../../../src/api/config';
import FloatingActionButton from '../../../../src/components/FloatingActionButton'; // Adjust path

const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/100';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE_URL}${cleanPath}`; // Use detected IP
};

export default function Parties() {
    const router = useRouter();
    const [parties, setParties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchParties = async (pageNum: number, shouldRefresh = false) => {
        try {
            const response = await client.get(`/parties?page=${pageNum}`);
            const newData = response.data.data;
            if (pageNum === 1 || shouldRefresh) {
                setParties(newData);
            } else {
                setParties(prev => [...prev, ...newData]);
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
            // Refresh when screen comes into focus (e.g. after edit/create)
            setPage(1);
            fetchParties(1, true);
        }, [])
    );

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => {
                const next = prev + 1;
                fetchParties(next);
                return next;
            });
        }
    };

    const deleteParty = (id: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this party?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                            await client.delete(`/parties/${id}`);
                            setParties(prev => prev.filter(p => p.id !== id));
                            Alert.alert('Success', 'Party deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete party');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/(app)/(tabs)/parties/form?id=${item.id}` as any)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: getImageUrl(item.image_path) }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.type}>{item.type.toUpperCase()}</Text>
                <Text style={styles.balance} numberOfLines={1}>
                    Bal: ₹{item.balance}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => deleteParty(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            {loading && page === 1 && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    data={parties}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={hasMore ? <ActivityIndicator style={{ margin: 10 }} /> : null}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        setPage(1);
                        fetchParties(1, true);
                    }}
                />
            )}
            <FloatingActionButton onPress={() => router.push('/(app)/(tabs)/parties/form' as any)} />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 10,
        paddingBottom: 80, // Space for FAB
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    info: {
        marginLeft: 15,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    type: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        backgroundColor: '#eee',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    balance: {
        fontSize: 14,
        color: '#2E8B57',
        fontWeight: '600',
        marginTop: 4,
    },
    actions: {
        paddingLeft: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteBtn: {
        padding: 8,
    }
});
