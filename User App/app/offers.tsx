import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Gift } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OffersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color="#FFF" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offers & Rewards</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.center}>
                <View style={styles.emptyIcon}>
                    <Gift color="#3F3F46" size={64} />
                </View>
                <Text style={styles.emptyTitle}>No Offers Right Now</Text>
                <Text style={styles.emptySubtitle}>
                    Check back later for exciting deals and exclusive rewards on your movie bookings!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1F1F2E',
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1F1F2E',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptySubtitle: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
