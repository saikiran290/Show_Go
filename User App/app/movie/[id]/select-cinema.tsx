import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, MapPin, SlidersHorizontal, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../../../config/api';

export default function SelectCinemaScreen() {
    const params = useLocalSearchParams();
    const { id, language } = params;
    const router = useRouter();
    const [dates, setDates] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [theatres, setTheatres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<string>('Select Location');

    useEffect(() => {
        generateDates();
        fetchShows();
        fetchLocation();
    }, [id]);

    const fetchLocation = async () => {
        const loc = await SecureStore.getItemAsync('user_location');
        if (loc) setLocation(loc.toUpperCase());
    };

    const generateDates = () => {
        const d = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            d.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                fullDate: date.toLocaleDateString('en-CA'), // YYYY-MM-DD in local time
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : undefined
            });
        }
        setDates(d);
        setSelectedDate(d[0].fullDate);
    };

    const fetchShows = async () => {
        try {
            // Get location first to ensure we filter correctly
            const loc = await SecureStore.getItemAsync('user_location');
            const cityQuery = loc ? `?city=${encodeURIComponent(loc)}` : '';

            const response = await fetch(`${endpoints.shows}/movie/${id}${cityQuery}`);
            const data = await response.json();
            setTheatres(data);
        } catch (error) {
            console.error("Failed to fetch shows", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const filterShowsByDate = (shows: any[]) => {
        const filtered = shows.filter((s: any) => {
            // Convert show time to local YYYY-MM-DD
            const showDate = new Date(s.show_time).toLocaleDateString('en-CA');
            const dateMatch = showDate === selectedDate;
            const langMatch = !language || s.language === language;
            return dateMatch && langMatch;
        });

        // Check if selected date is today
        const today = new Date().toLocaleDateString('en-CA');
        const isToday = selectedDate === today;
        const now = new Date();

        // Filter out past shows if today
        const timeSafe = isToday
            ? filtered.filter((s: any) => new Date(s.show_time) > now)
            : filtered;

        // Deduplicate shows by time
        const uniqueShows: any[] = [];
        const seenTimes = new Set();

        timeSafe.forEach((s: any) => {
            const time = formatTime(s.show_time);
            if (!seenTimes.has(time)) {
                seenTimes.add(time);
                uniqueShows.push(s);
            }
        });

        // Sort by time
        return uniqueShows.sort((a, b) => new Date(a.show_time).getTime() - new Date(b.show_time).getTime());
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={styles.headerTitle}>Select Cinema</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MapPin color="#6B7280" size={12} />
                        <Text style={styles.headerSubtitle}> {location}</Text>
                    </View>
                </View>
                {/* Empty view to balance the header since we removed the right button */}
                <View style={{ width: 44 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color="#6B7280" size={20} />
                    <TextInput
                        placeholder="Find a movie theater..."
                        placeholderTextColor="#6B7280"
                        style={styles.searchInput}
                    />
                    <SlidersHorizontal color="#8A2BE2" size={20} />
                </View>
            </View>

            {/* Date Selector */}
            <View style={{ height: 60, marginBottom: 20 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                    {dates.map((item, index) => {
                        const isSelected = selectedDate === item.fullDate;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.dateChip, isSelected && styles.activeDateChip]}
                                onPress={() => setSelectedDate(item.fullDate)}
                            >
                                <Text style={[styles.dateLabel, isSelected && styles.activeDateText]}>
                                    {item.label || `${item.day}, ${item.month || ''} ${item.date}`}
                                </Text>
                                {!item.label && (
                                    <Text style={[styles.dateSub, isSelected && styles.activeDateText]}>
                                        {/* Simplified logic since label handles today/tomorrow */}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Theater List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>Nearby Theaters</Text>
                </View>

                {theatres.map((theatre, index) => {
                    const availableShows = filterShowsByDate(theatre.shows);
                    if (availableShows.length === 0) return null;

                    return (
                        <View key={index} style={styles.theaterCard}>
                            <View style={styles.cardContent}>
                                <Text style={styles.theaterName}>{theatre.theatre_name}</Text>
                                <Text style={styles.theaterInfo}>{theatre.city !== 'Unknown' ? theatre.city : location}</Text>

                                <View style={styles.amenitiesRow}>
                                    {/* Show unique technologies from this theatre's shows */}
                                    {Array.from(new Set(theatre.shows.map((s: any) => s.screen_technology).filter(Boolean))).map((tech: any) => (
                                        <View key={tech} style={styles.amenityTag}><Text style={styles.amenityText}>{tech}</Text></View>
                                    ))}
                                    {theatre.shows.every((s: any) => !s.screen_technology) && (
                                        <View style={styles.amenityTag}><Text style={styles.amenityText}>Standard</Text></View>
                                    )}
                                </View>

                                <View style={styles.showtimeRow}>
                                    {availableShows.map((show: any, idx: number) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={styles.timeChip}
                                            onPress={() => router.push({
                                                pathname: `/movie/${id}/select-seats`,
                                                params: {
                                                    showId: show.show_id,
                                                    theatreName: theatre.theatre_name,
                                                    screenName: show.screen_name,
                                                    movieTitle: params.title || "Movie Title", // Use passed title
                                                    showTime: formatTime(show.show_time),
                                                    showDate: show.show_time,
                                                    poster: params.poster,
                                                    language: language || show.language,
                                                    technology: show.screen_technology
                                                }
                                            })}
                                        >
                                            <Text style={styles.timeText}>{formatTime(show.show_time)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    );
                })}

                {theatres.length === 0 && !loading && (
                    <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>No theaters found.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15', paddingTop: 50 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    iconBtn: { padding: 10, borderRadius: 12 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    headerSubtitle: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold' },

    searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13131A', borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#2D2D3F' },
    searchInput: { flex: 1, marginLeft: 10, color: '#FFF' },

    dateList: { paddingHorizontal: 20 },
    dateChip: {
        paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
        backgroundColor: '#1F1F2E', marginRight: 10, borderWidth: 1, borderColor: '#2D2D3F',
        justifyContent: 'center', alignItems: 'center', minWidth: 80
    },
    activeDateChip: { backgroundColor: '#8A2BE2', borderColor: '#8A2BE2' },
    dateLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
    dateSub: { color: '#9CA3AF', fontSize: 12 },
    activeDateText: { color: '#FFF' },

    content: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    seeAll: { color: '#8A2BE2', fontSize: 14 },

    theaterCard: { backgroundColor: '#13131A', borderRadius: 24, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#2D2D3F' },

    cardContent: { padding: 16 },
    theaterName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    theaterInfo: { color: '#8A2BE2', fontSize: 12, fontWeight: 'bold', marginBottom: 12 },

    amenitiesRow: { flexDirection: 'row', marginBottom: 16 },
    amenityTag: { backgroundColor: '#1F1F2E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
    amenityText: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold' },

    showtimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeChip: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#4C1D95', backgroundColor: '#13131A' },
    timeText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});
