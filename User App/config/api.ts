import Constants from 'expo-constants';

// Use environment variable for API URL
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const endpoints = {
    requestOtp: `${API_URL}/auth/request-otp`,
    verifyOtp: `${API_URL}/auth/verify-otp`,
    loginPassword: `${API_URL}/auth/login-password`,
    setPassword: `${API_URL}/auth/set-password`,
    locations: `${API_URL}/locations`,
    theatres: `${API_URL}/theatres`,
    movies: `${API_URL}/movies`,
    bookings: `${API_URL}/booking`,
    myBookings: `${API_URL}/booking/my-bookings`,
    notifications: `${API_URL}/notifications`,
    profile: `${API_URL}/auth/me`,
    shows: `${API_URL}/shows`,
    seats: `${API_URL}/seats`,
    cancelBooking: `${API_URL}/booking/cancel`,
    myReviews: `${API_URL}/reviews/me`,
    uploadImage: `${API_URL}/upload/image`,
    firebaseVerify: `${API_URL}/auth/firebase-verify`,
};
