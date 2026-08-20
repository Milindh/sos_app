import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { sendSosAlert } from '../utils/api';
import { getContacts, getUserName } from '../utils/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [userName, setUserNameState] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setContacts(await getContacts());
        setUserNameState(await getUserName());
      })();
    }, [])
  );

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      console.warn('Could not get location', err);
      return null;
    }
  }

  async function handleSosPress() {
    if (contacts.length === 0) {
      Alert.alert(
        'No emergency contacts',
        'Add at least one emergency contact before sending an alert.',
        [{ text: 'Add Contact', onPress: () => router.push('/contacts') }]
      );
      return;
    }

    setSending(true);
    setLastResult(null);

    try {
      const location = await getCurrentLocation();
      await sendSosAlert({
        userName: userName || 'A user',
        contacts,
        location,
      });
      setLastResult('success');
      Alert.alert('Alert sent', 'Your emergency contacts have been notified.');
    } catch (err) {
      console.error(err);
      setLastResult('error');
      Alert.alert(
        'Failed to send alert',
        'Something went wrong sending your alert. Please try again or call emergency services directly.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS</Text>
      <Text style={styles.subtitle}>
        {contacts.length > 0
          ? `${contacts.length} emergency contact${contacts.length > 1 ? 's' : ''} configured`
          : 'No emergency contacts yet'}
      </Text>

      <TouchableOpacity
        style={[styles.sosButton, sending && styles.sosButtonDisabled]}
        onPress={handleSosPress}
        disabled={sending}
        activeOpacity={0.7}
      >
        {sending ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.sosButtonText}>SEND{'\n'}ALERT</Text>
        )}
      </TouchableOpacity>

      {lastResult === 'success' && (
        <Text style={styles.statusSuccess}>Last alert sent successfully</Text>
      )}
      {lastResult === 'error' && (
        <Text style={styles.statusError}>Last alert failed to send</Text>
      )}

      <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/contacts')}>
        <Text style={styles.manageButtonText}>Manage Emergency Contacts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  subtitle: { color: '#aaa', marginTop: 8, marginBottom: 40, fontSize: 14 },
  sosButton: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#e02424', alignItems: 'center', justifyContent: 'center' },
  sosButtonDisabled: { backgroundColor: '#7a1a1a' },
  sosButtonText: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  statusSuccess: { color: '#4ade80', marginTop: 24 },
  statusError: { color: '#f87171', marginTop: 24 },
  manageButton: { marginTop: 48, paddingVertical: 12, paddingHorizontal: 20 },
  manageButtonText: { color: '#8ab4f8', fontSize: 15 },
});