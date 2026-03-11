import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { endpoints } from '../../config/api';

export default function TicketsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchBookings();
        }, [])
    );

    const fetchBookings = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(endpoints.myBookings, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) setBookings(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8A2BE2" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar style="light" />
            <Text style={styles.headerTitle}>My Tickets</Text>

            {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No tickets booked yet.</Text>
                </View>
            ) : (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={bookings}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.ticketCard}
                            onPress={() => {
                                const dateObj = new Date(item.show_time);
                                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                router.push({
                                    pathname: `/ticket/${item.id}`,
                                    params: {
                                        bookingId: item.id,
                                        movieId: item.movie_id,
                                        movieTitle: item.movie_title,
                                        theatreName: item.theater_name,
                                        showTime: timeStr,
                                        showDate: item.show_time,
                                        seatLabels: item.seat_label || 'N/A',
                                        screenName: item.screen_name || 'N/A'
                                    }
                                });
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardRow}>
                                <Image
                                    source={{ uri: item.poster_url || 'https://via.placeholder.com/100' }}
                                    style={styles.poster}
                                />
                                <View style={styles.cardInfo}>
                                    <View style={styles.ticketHeader}>
                                        <Text style={styles.movieTitle} numberOfLines={1}>
                                            {item.movie_title || 'Unknown Movie'}
                                        </Text>
                                        <Text style={[styles.status, {
                                            color: item.status === 'CONFIRMED' ? '#10B981' :
                                                item.status === 'CANCELLED' ? '#EF4444' : '#F59E0B'
                                        }]}>
                                            {item.status}
                                        </Text>
                                    </View>

                                    <Text style={styles.theaterText} numberOfLines={1}>{item.theater_name}</Text>
                                    <Text style={styles.detailText}>
                                        {new Date(item.show_time).toLocaleDateString()} • {new Date(item.show_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={styles.amountText}>₹{item.total_amount}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15', paddingHorizontal: 20 },
    loadingContainer: { flex: 1, backgroundColor: '#0B0B15', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontSize: 16 },
    listContent: { paddingBottom: 100 },

    ticketCard: { backgroundColor: '#1F1F2E', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2D2D3F' },
    cardRow: { flexDirection: 'row' },
    poster: { width: 70, height: 100, borderRadius: 8, marginRight: 16, backgroundColor: '#2D2D3F' },
    cardInfo: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },

    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    movieTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
    status: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 3 },

    theaterText: { color: '#D1D5DB', fontSize: 14, fontWeight: '500' },
    detailText: { color: '#9CA3AF', fontSize: 12 },
    amountText: { color: '#A78BFA', fontSize: 16, fontWeight: 'bold' },
});
