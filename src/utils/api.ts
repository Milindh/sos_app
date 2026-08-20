const SOS_ENDPOINT = 'https://sos-app-two-sigma.vercel.app/api/sos';

export async function sendSosAlert({ userName, contacts, location }: any) {
  const payload = {
    userName,
    contacts,
    location,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(SOS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`SOS request failed (${response.status}): ${text}`);
  }

  return response.json();
}