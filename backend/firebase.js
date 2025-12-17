import admin from 'firebase-admin';

// Try to load service account from environment variable first
let serviceAccountEnv = process.env.FIREBASE_ADMIN
  ? JSON.parse(process.env.FIREBASE_ADMIN)
  : null;

// Fallback: try to load from local file ONLY when running locally
if (!serviceAccountEnv) {
  try {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const _dirname = dirname(_filename);

    const servicePath = join(__dirname, 'rapicredit-f52a2-firebase-adminsdk-fbsvc-34bfa26aa4.json');
    const fileContents = readFileSync(servicePath, 'utf8');
    serviceAccountEnv = JSON.parse(fileContents);

  } catch (err) {
    console.error("❌ Firebase Admin key not found in env or local file");
    throw err;
  }
}

// Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountEnv)
  });
}

export { admin };