export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const FIREBASE_API_KEY = 'AIzaSyD5C_xlP9tcbl4c7norSC6ohi8RVtoU7lY';
  const FIREBASE_DB_URL  = 'https://rsbl-spot-gold-silver-prices.firebaseio.com';

  let customToken, idToken, liverates;

  try {
    const r = await fetch('https://spot.augmont.com/token/100', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    customToken = (await r.text()).trim();
    if (!customToken) throw new Error('Empty token');
  } catch (e) {
    return res.status(500).json({ step: 1, error: e.message });
  }

  try {
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }) }
    );
    const j = await r.json();
    idToken = j.idToken;
    if (!idToken) throw new Error(JSON.stringify(j));
  } catch (e) {
    return res.status(500).json({ step: 2, error: e.message });
  }

  try {
    const r = await fetch(`${FIREBASE_DB_URL}/websitesettings/statesymbolmap.json?auth=${idToken}`);
    liverates = await r.json();
    if (!liverates || typeof liverates !== 'object') throw new Error('Bad shape');
  } catch (e) {
    return res.status(500).json({ step: 3, error: e.message });
  }

  const gold = liverates['GOLD999MUM'] ??
    Object.values(liverates).find(v => v?.Name === 'GOLD999MUM');

  if (!gold) {
    return res.status(404).json({
      error: 'GOLD999MUM not found',
      availableKeys: Object.keys(liverates).slice(0, 30),
    });
  }

  const sellPer10g = gold.Sell ?? gold.Bid ?? gold.Ask;
  if (!sellPer10g) return res.status(500).json({ error: 'No price field', keys: Object.keys(gold) });

  res.setHeader('Cache-Control', 's-maxage=55, stale-while-revalidate=10');
  return res.json({
    sellPer10g,
    sellPerGram: sellPer10g / 10,
    updatedAt: new Date().toISOString(),
    source: 'GOLD999MUM @ rsbl-spot-gold-silver-prices.firebaseio.com',
  });
}
