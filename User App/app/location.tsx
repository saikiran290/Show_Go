import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Search, Navigation, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { endpoints } from '../config/api';

export default function LocationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [locations, setLocations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await fetch(endpoints.locations);
            const data = await response.json();
            // Ensure data is array of strings
            setLocations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLocation = async (city: string) => {
        await SecureStore.setItemAsync('user_location', city);
        router.replace('/(tabs)/home');
    };

    const filteredLocations = locations.filter(loc =>
        loc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Suggest some popular cities if list is empty or for UI demo
    const popularCities = ['Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai'];
    const displayLocations = locations.length > 0 ? filteredLocations : popularCities.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Select Location</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search color="#9CA3AF" size={20} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a city..."
                    placeholderTextColor="#6B7280"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <TouchableOpacity style={styles.currentLocationButton} onPress={() => handleSelectLocation('Visakhapatnam')}>
                <LinearGradient
                    colors={['#8A2BE2', '#4B0082']}
                    style={styles.locationIconBox}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <Navigation color="#FFF" size={20} />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.locationTitle}>Use Current Location</Text>
                    <Text style={styles.locationSubtitle}>Enable GPS for better accuracy</Text>
                </View>
                <ChevronRight color="#4B5563" size={20} />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Popular Cities</Text>

            {loading ? (
                <ActivityIndicator color="#8A2BE2" style={{ marginTop: 20 }} />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
                    {displayLocations.map((city, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.cityCard}
                            onPress={() => handleSelectLocation(city)}
                        >
                            {/* Placeholder Images for cities - using a consistent gradient or abstract for now */}
                            <LinearGradient
                                colors={['#2D2D3F', '#1F1F2E']}
                                style={styles.cityImagePlaceholder}
                            >
                                <MapPin color="#8A2BE2" size={24} />
                            </LinearGradient>
                            <Text style={styles.cityName}>{city}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    header: { paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1F2E',
        borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 16, height: 50, marginBottom: 24,
        borderWidth: 1, borderColor: '#2D2D3F'
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16 },

    currentLocationButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1F2E',
        marginHorizontal: 20, padding: 16, borderRadius: 16, marginBottom: 32,
        borderWidth: 1, borderColor: '#2D2D3F'
    },
    locationIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    locationTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    locationSubtitle: { color: '#9CA3AF', fontSize: 12 },

    sectionTitle: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', marginLeft: 20, marginBottom: 16, letterSpacing: 1 },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
    cityCard: { width: '33.33%', padding: 8, alignItems: 'center', marginBottom: 16 },
    cityImagePlaceholder: {
        width: '100%', aspectRatio: 1, borderRadius: 16, marginBottom: 8,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#2D2D3F'
    },
    cityName: { color: '#E5E7EB', fontSize: 14, fontWeight: '500', textAlign: 'center' },
});
