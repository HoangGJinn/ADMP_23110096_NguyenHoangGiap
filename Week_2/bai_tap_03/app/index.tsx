import { DiscordColors } from '@/constants/discord-theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { loadUserFromStorage } from '@/store/redux/slices/authSlice';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Splash Screen / Auto-Login Logic
 * Load user từ AsyncStorage khi app start
 */

export default function Index() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // AUTO-LOGIN: Load user từ storage khi app khởi động
    const initializeAuth = async () => {
      try {
        await dispatch(loadUserFromStorage()).unwrap();
      } catch (error) {
        console.log('No user session found:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading while checking auth state
  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DiscordColors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    console.log('✅ User authenticated, navigating to tabs');
    return <Redirect href="/(tabs)" />;
  }

  console.log('❌ No user, navigating to login');
  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DiscordColors.background,
  },
});
