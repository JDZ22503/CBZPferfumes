import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import client from '../../../src/api/client';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await client.get('/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.grid}>
                <StatCard
                    title="Total Parties"
                    value={stats?.totalParties}
                    icon="people"
                    color="#4F46E5"
                    onPress={() => router.push('/(app)/(tabs)/parties' as any)}
                />
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts}
                    icon="cube"
                    color="#8B5CF6"
                    onPress={() => router.push('/(app)/(tabs)/products' as any)}
                />
                <StatCard
                    title="Total Gift Sets"
                    value={stats?.totalProductSets}
                    icon="gift"
                    color="#EC4899"
                    onPress={() => router.push('/(app)/(tabs)/product-sets' as any)}
                />
                <StatCard
                    title="Total Attars"
                    value={stats?.totalAttars}
                    icon="water"
                    color="#06B6D4"
                    onPress={() => router.push('/(app)/(tabs)/attars' as any)}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.pendingOrders}
                    icon="time"
                    color="#F59E0B"
                    onPress={() => router.push('/(app)/(tabs)/orders?status=pending' as any)}
                />
                <StatCard
                    title="Completed Orders"
                    value={stats?.completedOrders}
                    icon="checkmark-circle"
                    color="#10B981"
                    onPress={() => router.push('/(app)/(tabs)/orders?status=completed' as any)}
                />
                <StatCard
                    title="Cancelled Orders"
                    value={stats?.cancelledOrders}
                    icon="close-circle"
                    color="#EF4444"
                    onPress={() => router.push('/(app)/(tabs)/orders?status=cancelled' as any)}
                />
            </View>
        </ScrollView>
    );
}

const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15, // Gap support depends on RN version, fallback margin if needed
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '47%', // roughly half - gap
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 15,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
});
