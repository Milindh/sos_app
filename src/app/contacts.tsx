import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    addContact,
    getContacts,
    getUserName,
    removeContact,
    setUserName,
} from '../utils/storage';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserNameLocal] = useState('');

  useEffect(() => {
    (async () => {
      setContacts(await getContacts());
      setUserNameLocal(await getUserName());
    })();
  }, []);

  async function handleAddContact() {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please enter both a name and an email.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    const updated = await addContact({ name: name.trim(), email: email.trim() });
    setContacts(updated);
    setName('');
    setEmail('');
  }

  async function handleRemoveContact(id: string) {
    const updated = await removeContact(id);
    setContacts(updated);
  }

  async function handleSaveUserName(value: string) {
    setUserNameLocal(value);
    await setUserName(value);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>Your name (shown in alerts)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Milindh"
          placeholderTextColor="#777"
          value={userName}
          onChangeText={handleSaveUserName}
        />

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Add emergency contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Contact name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>Your emergency contacts</Text>
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 8 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No contacts added yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.contactRow}>
              <View>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactEmail}>{item.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveContact(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 20 },
  sectionLabel: { color: '#aaa', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#1c1c1c', color: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, fontSize: 15 },
  addButton: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1c1c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  contactName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  contactEmail: { color: '#999', fontSize: 13, marginTop: 2 },
  removeText: { color: '#f87171', fontSize: 13 },
  emptyText: { color: '#666', fontStyle: 'italic', marginTop: 8 },
});