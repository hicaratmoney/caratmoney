// api/rate.js — Vercel Serverless Function
// Proxies the Augmont Spot live rate to avoid browser CORS restrictions.
//
// Flow:
//   1. GET spot.augmont.com/token/100          → Firebase custom token (JWT)
//   2. POST identitytoolkit.googleapis.com/... → Firebase ID token
//   3. GET rsbl-spot-gold-silver-prices-default-rtdb.firebaseio.com/liverates.json
//      → full liverates object, find GOLD999MUM entry
//   4. Return { sellPer10g, sellPerGram, updatedAt }
//
// Vercel caches the response 55 s at the CDN edge, so upstream Firebase calls
// happen at most once per minute regardless of concurrent users.

const FIREBASE_API_KEY = 'AlzaSyD5C_xIP9tcbI4c7norSC6ohi8RVtoU7IY';
const FIREBASE_DB_URL  = 'https://rsbl-spot-gold-silver-prices-default-rtdb.firebaseio.com';

module.exports = async function handler(req, res) {
  try {
    // Step 1: Augmont custom token (server→server, no CORS issue)
    const tokenRes = await fetch('https://spot.augmont.com/token/100', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CaratMoney/1.0)' },
    });
    if (!tokenRes.ok) throw new Error(`Token fetch failed: ${tokenRes.status}`);
    const customToken = (await tokenRes.text()).trim();

    // Step 2: Exchange for Firebase ID token
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );
    if (!authRes.ok) throw new Error(`Auth exchange failed: ${authRes.status}`);
    const { idToken } = await authRes.json();

    // Step 3: Fetch live rates from Firebase Realtime Database
    const dbRes = await fetch(
      `${FIREBASE_DB_URL}/liverates.json?auth=${idToken}`
    );
    if (!dbRes.ok) throw new Error(`DB fetch failed: ${dbRes.status}`);
    const liverates = await dbRes.json();
    if (!liverates || typeof liverates !== 'object') {
      throw new Error('Unexpected DB response shape');
    }

    // Step 4: Find "Gold Without GST" entry by Name field
    const gold = Object.values(liverates).find(
      v => v && v.Name === 'Gold Without GST'
    );

    if (!gold) {
      return res.status(404).json({
        error: 'Gold Without GST entry not found in /liverates',
        availableNames: Object.values(liverates)
          .map(v => v?.Name)
          .filter(Boolean)
          .slice(0, 30),
      });
    }

    const sellPer10g = gold.Sell ?? gold.Bid ?? gold.Ask;
    if (!sellPer10g || typeof sellPer10g !== 'number') {
      throw new Error(`No numeric sell price. Fields: ${Object.keys(gold).join(', ')}`);
    }

    // Sell = what sellers (gold owners) receive.
    // Try explicit Sell field first, fall back through Bid → Ask.
    const sellPer10g = gold.Sell ?? gold.Bid ?? gold.Ask;
    if (!sellPer10g || typeof sellPer10g !== 'number') {
      throw new Error(`No numeric sell price. Fields present: ${Object.keys(gold).join(', ')}`);
    }

    res.setHeader('Cache-Control', 's-maxage=55, stale-while-revalidate=10');
    return res.json({
      sellPer10g,
      sellPerGram: sellPer10g / 10,
      updatedAt: new Date().toISOString(),
      source: 'GOLD999MUM @ spot.augmont.com',
    });

  } catch (err) {
    console.error('[api/rate]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
