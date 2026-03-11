import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleGetStarted = () => {
        router.push({ pathname: '/auth', params: { mode: 'signup' } });
    };

    return (
        <View style={styles.container}>
            {/* Background Image/Gradient */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('../assets/images/onboarding-bg-v2.png')}
                    style={styles.image}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                    style={styles.gradient}
                />
            </View>

            <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { marginBottom: 8 }]}>Experience Cinema</Text>
                    <Text style={[styles.title, styles.highlight]}>In A New Light</Text>

                    <Text style={styles.subtitle}>
                        Book tickets for the latest blockbusters with futuristic ease and neon style.
                    </Text>
                </View>

                <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#8A2BE2', '#4B0082']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                        <ArrowRight color="#FFF" size={20} />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push({ pathname: '/auth', params: { mode: 'signin' } })} style={styles.signInLink}>
                    <Text style={styles.footerText}>
                        Already have an account? <Text style={styles.linkText}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    imageContainer: {
        height: height * 0.6,
        width: width,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    textContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    highlight: {
        color: '#A855F7', // Neon Purple
        textShadowColor: 'rgba(168, 85, 247, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 8,
    },
    signInLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    linkText: {
        color: '#A855F7',
        fontWeight: '600',
    },
});
