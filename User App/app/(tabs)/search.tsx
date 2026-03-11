import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search as SearchIcon, Star } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { endpoints } from '../../config/api';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<any[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Get Location
            const loc = await SecureStore.getItemAsync('user_location');
            const cityParam = loc && loc !== 'Select Location' ? loc : '';

            // Get Movies with city filter
            const url = cityParam ? `${endpoints.movies}?city=${encodeURIComponent(cityParam)}` : endpoints.movies;

            const response = await fetch(url, { headers });
            const data = await response.json();
            if (Array.isArray(data)) {
                setMovies(data);
                setFilteredMovies(data);
            }
        } catch (error) {
            console.error("Search fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        filterMovies();
    }, [query, movies]);

    const filterMovies = () => {
        let result = movies;
        if (query) {
            result = result.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        }
        setFilteredMovies(result);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <View style={{ width: 24 }} />
                <Text style={styles.headerTitle}>Search Movies</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <SearchIcon color="#A78BFA" size={20} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search movies, genre..."
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                />
            </View>

            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Results</Text>
                <Text style={styles.resultsCount}>{filteredMovies.length} Found</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#8A2BE2" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsList}>
                    {filteredMovies.map(movie => (
                        <TouchableOpacity key={movie.id} onPress={() => router.push(`/movie/${movie.id}`)}>
                            <View style={styles.resultCard}>
                                {/* Left Info Column */}
                                <View style={styles.info}>
                                    <View style={styles.tagRow}>
                                        <View style={styles.qualityTag}>
                                            <Text style={styles.qualityText}>{movie.available_technologies && movie.available_technologies.length > 0 ? movie.available_technologies[0] : 'IMAX'}</Text>
                                        </View>
                                        <Text style={styles.duration}>• {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m</Text>
                                    </View>

                                    <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>

                                    <View style={styles.ratingRow}>
                                        <Star color="#FACC15" size={14} fill="#FACC14" />
                                        <Text style={styles.ratingText}>{movie.rating ? movie.rating.toFixed(1) : "0.0"}</Text>
                                    </View>

                                    <TouchableOpacity style={styles.bookButton} onPress={() => router.push(`/movie/${movie.id}`)}>
                                        <Text style={styles.bookButtonText}>Book Now</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Right Image Column */}
                                <Image
                                    source={{ uri: movie.poster_url || 'https://via.placeholder.com/150' }}
                                    style={styles.poster}
                                    resizeMode="cover"
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                    {filteredMovies.length === 0 && !loading && (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: '#6B7280' }}>No movies found matching your search.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: width * 0.05, marginBottom: 20 },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F1F2E',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 55,
        marginHorizontal: width * 0.05,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#4C1D95'
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 10 },

    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: width * 0.05, marginBottom: 16 },
    resultsTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    resultsCount: { color: '#8A2BE2', fontSize: 14, fontWeight: '600' },

    resultsList: { paddingHorizontal: width * 0.05, paddingBottom: 120 },

    resultCard: {
        flexDirection: 'row', backgroundColor: '#13131A', borderRadius: 20, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#1F1F2E'
    },
    info: { flex: 1, marginRight: 16, justifyContent: 'space-between', paddingVertical: 4 },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    qualityTag: { backgroundColor: '#8A2BE2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8 },
    qualityText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    duration: { color: '#6B7280', fontSize: 12, fontWeight: '500' },

    title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', lineHeight: 26, marginBottom: 4 },
    genre: { color: '#9CA3AF', fontSize: 13, marginBottom: 12 },

    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
    ratingText: { color: '#FACC15', fontSize: 14, fontWeight: 'bold' },

    bookButton: {
        backgroundColor: '#8A2BE2', paddingVertical: 12, paddingHorizontal: 20,
        borderRadius: 12, alignItems: 'center', alignSelf: 'flex-start',
        width: '100%',
        shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
    },
    bookButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    poster: { width: 110, height: 160, borderRadius: 12 },
});
