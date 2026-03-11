import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, MoreVertical, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { endpoints } from '../../../config/api';

const { width } = Dimensions.get('window');

import * as SecureStore from 'expo-secure-store';

export default function SelectSeatsScreen() {
    const params = useLocalSearchParams();
    const { id, showId, theatreName, screenName, movieTitle, showTime, language, technology } = params;
    const router = useRouter();

    // Convert params to string if they are arrays (defensive coding)
    const title = Array.isArray(movieTitle) ? movieTitle[0] : movieTitle;
    const cinema = Array.isArray(theatreName) ? theatreName[0] : theatreName;
    const time = Array.isArray(showTime) ? showTime[0] : showTime;
    const screen = Array.isArray(screenName) ? screenName[0] : screenName || 'SCREEN';

    const [seats, setSeats] = useState<any[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchSeats();
        setRefreshing(false);
    }, [showId]);

    useEffect(() => {
        if (showId) fetchSeats();
    }, [showId]);

    const fetchSeats = async () => {
        try {
            const response = await fetch(`${endpoints.shows.replace('/shows', '')}/seats/layout/${showId}`);
            const data = await response.json();
            setSeats(data);
        } catch (error) {
            console.error("Failed to fetch seats", error);
            Alert.alert("Error", "Could not load seat layout");
        } finally {
            setLoading(false);
        }
    };

    const toggleSeat = (seatId: number) => {
        const newSelected = new Set(selectedSeats);
        if (newSelected.has(seatId)) {
            newSelected.delete(seatId);
        } else {
            newSelected.add(seatId);
        }
        setSelectedSeats(newSelected);
    };

    const getSeatStyle = (status: string, isSelected: boolean) => {
        if (status === 'BOOKED') return styles.seatBooked;
        if (isSelected) return styles.seatSelected;
        return styles.seatAvailable;
    };

    // Calculate Totals
    const selectedList = seats.filter(s => selectedSeats.has(s.id));
    const totalPrice = selectedList.reduce((sum, s) => sum + s.price, 0);
    const seatLabels = selectedList.map(s => `${s.row}${s.number}`).join(', ');

    // Group seats by row for rendering
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const seatsByRow = (rowLabel: string) => seats.filter(s => s.row === rowLabel).sort((a, b) => parseInt(a.number) - parseInt(b.number));


    const handleSeatPress = (seat: any) => {
        if (seat.status === 'AVAILABLE') {
            toggleSeat(seat.id);
        } else if (seat.status === 'LOCKED') {
            Alert.alert(
                "Seat Locked",
                "This seat is currently held. It may become available soon.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Refresh Status", onPress: fetchSeats }
                ]
            );
        } else if (seat.status === 'BOOKED') {
            Alert.alert("Seat Booked", "This seat has already been sold.");
        }
    };


    const handleBookSeats = async () => {
        if (selectedSeats.size === 0) return;

        setLoading(true); // Maybe add a separate connecting state, but loading works
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert("Login Required", "Please login to book seats", [
                    { text: "Login", onPress: () => router.push('/auth') }
                ]);
                return;
            }

            const seatIds = Array.from(selectedSeats);

            // Call Lock API
            const response = await fetch(`${endpoints.seats}/lock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    show_id: parseInt(showId as string),
                    seat_ids: seatIds
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    Alert.alert("Seats Unavailable", "One or more seats are already held or booked by another user.");
                    // Refresh seats to show new status
                    fetchSeats();
                    return;
                }
                throw new Error(errorData.detail || "Failed to lock seats");
            }

            // Success -> Navigate to Checkout
            router.push({
                pathname: `/movie/${id}/checkout`,
                params: {
                    showId,
                    selectedSeats: JSON.stringify(seatIds),
                    seatLabels,
                    totalPrice: totalPrice.toString(),
                    movieTitle: title,
                    theatreName: cinema,
                    showTime: time,
                    screenName: screen,
                    showDate: params.showDate,
                    poster: params.poster,
                    language: language,
                    technology: technology
                }
            });

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* ... rest of UI ... */}
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>{cinema} • {time}</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <MoreVertical color="#FFF" size={24} />
                </TouchableOpacity>
            </View>

            {/* Screen Visual */}
            <View style={styles.screenContainer}>
                <View style={styles.screenCurve}>
                    <LinearGradient
                        colors={['rgba(138, 43, 226, 0.8)', 'transparent']}
                        style={styles.screenGradient}
                    />
                </View>
                <Text style={styles.screenText}>{screen.toUpperCase()}</Text>
            </View>

            {/* Legend - Simplified */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.seatAvailable]} />
                    <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.seatSelected]} />
                    <Text style={styles.legendText}>Selected</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.seatBooked]} />
                    <Text style={styles.legendText}>Booked</Text>
                </View>
            </View>

            {/* Seat Layout by Categories */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seatGrid}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8A2BE2" />
                }
            >
                {/* Helper to render a group of rows */}
                {['REGULAR', 'PREMIUM', 'RECLINER'].map((type) => {
                    const typeSeats = seats.filter(s => s.type === type);
                    if (typeSeats.length === 0) return null;

                    // Get unique rows for this type
                    const typeRows = Array.from(new Set(typeSeats.map(s => s.row))).sort();
                    const price = typeSeats[0]?.price;

                    return (
                        <View key={type} style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>{type} (₹{price})</Text>

                            {typeRows.map(row => (
                                <View key={row} style={styles.rowContainer}>
                                    <Text style={styles.rowLabel}>{row}</Text>
                                    <View style={styles.seatsRow}>
                                        {seatsByRow(row).map(seat => {
                                            const isGap = seat.number === '3' || seat.number === '7';
                                            return (
                                                <React.Fragment key={seat.id}>
                                                    <TouchableOpacity
                                                        style={[styles.seat, getSeatStyle(seat.status, selectedSeats.has(seat.id))]}
                                                        onPress={() => handleSeatPress(seat)}
                                                    />
                                                    {isGap && <View style={{ width: 20 }} />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Bar */}
            {selectedSeats.size > 0 && (
                <View style={styles.bottomBar}>
                    <View style={styles.selectionInfo}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.label}>SELECTED SEATS</Text>
                            <Text style={styles.seatText}>{seatLabels} • {selectedSeats.size} Tickets</Text>
                        </View>
                        <View style={{ minWidth: 100, alignItems: 'flex-end' }}>
                            <Text style={[styles.label, { textAlign: 'right', color: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }]}>Total Price</Text>
                            <Text style={styles.priceText}>₹{totalPrice.toFixed(2)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.bookButton} onPress={handleBookSeats}>
                        <Text style={styles.bookButtonText}>Book Seats</Text>
                        <ArrowRight color="#FFF" size={20} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15', paddingTop: 50 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    iconBtn: { padding: 8 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    headerSubtitle: { color: '#9CA3AF', fontSize: 12, fontWeight: '500', textAlign: 'center', marginTop: 2 },

    screenContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    screenCurve: {
        width: width * 0.8, height: 40, borderTopLeftRadius: 100, borderTopRightRadius: 100,
        borderTopWidth: 4, borderColor: '#8A2BE2', overflow: 'hidden',
        shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
    },
    screenGradient: { width: '100%', height: '100%', opacity: 0.5 },
    screenText: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginTop: 10 },

    legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendBox: { width: 16, height: 16, borderRadius: 4 },
    legendText: { color: '#9CA3AF', fontSize: 12 },

    seatGrid: { paddingHorizontal: 20, paddingBottom: 150 },
    sectionContainer: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F2E' },
    sectionTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 16, marginTop: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
    rowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, justifyContent: 'center' },
    rowLabel: { color: '#6B7280', fontSize: 12, width: 20, textAlign: 'center', marginRight: 10 },
    seatsRow: { flexDirection: 'row', gap: 8 },

    seat: { width: 28, height: 28, borderRadius: 6, borderWidth: 1 },
    seatAvailable: { borderColor: '#4B5563', backgroundColor: 'transparent' }, // Outline (Regular)
    // removed specific color styles
    seatSelected: { borderColor: '#8A2BE2', backgroundColor: '#8A2BE2' }, // Filled Purple
    seatBooked: { borderColor: '#374151', backgroundColor: '#374151', opacity: 0.5 }, // Dark Grey

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#13131A', padding: 20, paddingBottom: 40,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderTopWidth: 1, borderTopColor: '#2D2D3F'
    },
    selectionInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    label: { color: '#6B7280', fontSize: 10, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
    seatText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', lineHeight: 24 },
    priceText: { color: '#8A2BE2', fontSize: 20, fontWeight: 'bold', textAlign: 'right' },

    bookButton: {
        backgroundColor: '#8A2BE2', height: 56, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10
    },
    bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
