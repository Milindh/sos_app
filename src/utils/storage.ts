import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = 'sos_emergency_contacts';
const USER_NAME_KEY = 'sos_user_name';

export async function getContacts() {
  try {
    const raw = await AsyncStorage.getItem(CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load contacts', err);
    return [];
  }
}

export async function saveContacts(contacts: any[]) {
  try {
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    return true;
  } catch (err) {
    console.error('Failed to save contacts', err);
    return false;
  }
}

export async function addContact(contact: { name: string; email: string }) {
  const contacts = await getContacts();
  const updated = [...contacts, { ...contact, id: Date.now().toString() }];
  await saveContacts(updated);
  return updated;
}

export async function removeContact(id: string) {
  const contacts = await getContacts();
  const updated = contacts.filter((c: any) => c.id !== id);
  await saveContacts(updated);
  return updated;
}

export async function getUserName() {
  try {
    return (await AsyncStorage.getItem(USER_NAME_KEY)) || '';
  } catch (err) {
    return '';
  }
}

export async function setUserName(name: string) {
  try {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
    return true;
  } catch (err) {
    console.error('Failed to save user name', err);
    return false;
  }
}