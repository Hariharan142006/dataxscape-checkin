
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

// Helper to init admin (same logic as lib/firebase-admin.ts but commonjs)
function init() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            return initializeApp({ credential: cert(serviceAccount) });
        } catch (e) { console.log("Using default creds"); return initializeApp(); }
    }
    return initializeApp();
}

init();
const db = getFirestore();

async function main() {
    console.log('Seeding DB...');
    const usersRef = db.collection('users');

    // 1. Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    await usersRef.doc('admin').set({
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
        createdAt: new Date().toISOString()
    });
    console.log('Created admin user.');

    // 2. Hall Volunteer
    const hallPassword = await bcrypt.hash('hall123', 10);
    await usersRef.doc('hall_admin').set({
        username: 'hall_admin',
        password: hallPassword,
        role: 'HALL_VOLUNTEER',
        createdAt: new Date().toISOString()
    });
    console.log('Created hall_admin user.');

    // 3. Volunteer
    const volPassword = await bcrypt.hash('vol123', 10);
    await usersRef.doc('volunteer').set({
        username: 'volunteer',
        password: volPassword,
        role: 'VOLUNTEER',
        createdAt: new Date().toISOString()
    });
    console.log('Created volunteer user.');

    console.log('Seeding complete.');
}

main().catch(console.error);
