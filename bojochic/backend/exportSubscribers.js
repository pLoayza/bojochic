require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function exportEmails() {
  const db = admin.firestore();
  const snap = await db.collection('subscribers').get();
  const emails = snap.docs.map(d => d.data().email).filter(Boolean);

  fs.writeFileSync('subscribers.txt', emails.join('\n'));
  console.log(`✅ ${emails.length} emails exportados en subscribers.txt`);
}

exportEmails();