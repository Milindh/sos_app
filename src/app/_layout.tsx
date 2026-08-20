import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'SOS' }} />
      <Stack.Screen name="contacts" options={{ title: 'Emergency Contacts' }} />
    </Stack>
  );
}