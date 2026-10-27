import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback, useContext, createContext } from 'react';
import {
  MessageCircle, TrendingDown, Shield, Sparkles, Info,
  Plus, Minus, Trash2, ChevronDown, ChevronUp, ArrowLeft, Zap,
  KeyRound, Search, ShieldCheck, X, Share2, Copy, AlertCircle, Check, Phone,
  ChevronLeft, ChevronRight, Menu, Mail, MapPin, Clock, Star, Quote, TrendingUp,
  Microscope, Scale, IndianRupee, Gem, Wallet, Percent, Store, Navigation, Smartphone,
} from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
//  SWITCHES — the only lines you normally need to edit
// ═════════════════════════════════════════════════════════════════════════════
const SHOW_CERTIFICATIONS = false; // true once IBJA membership + ISO 27001 certificate are in hand
const REVIEWS_ARE_SAMPLES = true;  // false once the sample reviews are replaced with real ones
const LEADS_URL           = 'https://script.google.com/macros/s/AKfycbxu4TMd91-s_LLdCwas_mbThurBMjg5zdKrN5E4hxruGwFRiO038W8vLyLkEJDNPkZW/exec';    // paste the Google Apps Script web-app URL (fills the "Website leads" tab)

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const C = {
  plum:    '#2b1450',
  purple:  '#3a1d6e',
  ink:     '#16121f',
  ink2:    '#2a2338',
  paper:   '#f6f2ea',
  paper2:  '#ede6d8',
  gold:    '#b8883a',
  gold2:   '#e0b765',
  gold3:   '#f1d78d',
  mute:    '#7a6f62',
  white:   '#ffffff',
  green:   '#25D366',
};

// ─── Config ───────────────────────────────────────────────────────────────────
const SPOT_FALLBACK    = 15578;
const WHATSAPP_NUMBER  = '918169874545';
const STONE_RECOVERY   = 0.50;
const WASTAGE_RECOVERY = 0.95;
const MAX_ORNAMENTS    = 10;
const BUY_RATE_24K     = 15901;
const BUY_RATE_DATE    = '27 Apr 2026';
const KARATS           = [24, 22, 18, 14, 10];
const EMAIL            = 'hicaratmoney@gmail.com';
const ADDRESS          = '304, Zion, Sector 10, Kharghar, Navi Mumbai - 410210';
const PARTNER_URL      = 'https://carat-money-partners.web.app/partner/';
const MAP_EMBED        = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.6109258300326!2d73.07529277602526!3d19.036858782159722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c3cf243723c3%3A0xa7274f01c46ec2d2!2sCarat%20Money!5e0!3m2!1sen!2sin!4v1793084207797!5m2!1sen!2sin';
const DIRECTIONS_URL   = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Carat Money, 304 Zion, Sector 10, Kharghar, Navi Mumbai 410210');

// ─── Typography (Hindi / Kannada fonts switch in via GLOBAL_CSS) ──────────────
const SERIF = 'var(--f-serif)';
const SANS  = 'var(--f-sans)';
const MONO  = 'var(--f-mono)';

// Carat Money hallmark — spec 13.10.2026 (outer ring 2, hairline 1 @ 45%, "cm" scaled 0.961)
const CM_OUTER     = 'M100 10 C 150 10 188 60 188 130 C 188 200 150 250 100 250 C 50 250 12 200 12 130 C 12 60 50 10 100 10 Z';
const CM_INNER     = 'M100 22 C 142 22 176 66 176 130 C 176 194 142 238 100 238 C 58 238 24 194 24 130 C 24 66 58 22 100 22 Z';
const CM_TRANSFORM = 'translate(100 135) scale(0.961) translate(-98.97 -134.94)';
const CM_PATH      = 'M56.485 97.880L56.485 97.880Q51.385 97.880 45.988 102.640Q40.590 107.400 36.383 115.900Q32.175 124.400 30.730 135.620L30.730 135.620Q28.520 151.090 32.643 158.485Q36.765 165.880 45.605 165.880L45.605 165.880Q52.150 165.880 58.483 161.290Q64.815 156.700 68.640 146.670L68.640 146.670Q69.150 145.650 69.575 145.735L69.575 145.735Q70.255 145.905 69.830 147.010L69.830 147.010Q65.495 160.185 56.230 166.942Q46.965 173.700 36.170 173.700L36.170 173.700Q24.100 173.700 18.235 165.115Q12.370 156.530 14.750 139.955L14.750 139.955Q16.025 131.115 19.893 123.167Q23.760 115.220 29.498 109.142Q35.235 103.065 42.163 99.622Q49.090 96.180 56.400 96.180L56.400 96.180Q66.260 96.180 71.403 100.855Q76.545 105.530 76.035 112.330L76.035 112.330Q75.780 116.580 73.782 118.535Q71.785 120.490 69.320 120.490L69.320 120.490Q67.025 120.490 65.453 118.917Q63.880 117.345 64.050 114.710L64.050 114.710Q64.135 112.245 64.730 110.162Q65.325 108.080 65.325 105.275L65.325 105.275Q65.325 102.130 63.030 100.005Q60.735 97.880 56.485 97.880ZM111.980 165.030L111.980 165.030L126.600 119.130Q129.405 110.545 128.300 107.442Q127.195 104.340 123.795 104.340L123.795 104.340Q120.310 104.340 114.657 108.377Q109.005 112.415 102.885 121.425Q96.765 130.435 91.750 145.310L91.750 145.310Q89.115 153.300 88.265 157.338Q87.415 161.375 87.415 163.415L87.415 163.415Q87.415 164.690 88.010 165.625Q88.605 166.560 88.605 167.835L88.605 167.835Q88.605 170.300 85.078 171.873Q81.550 173.445 75.515 173.445L75.515 173.445Q71.350 173.445 70.883 171.363Q70.415 169.280 72.115 164.010L72.115 164.010L87.755 116.325Q90.050 109.270 89.540 106.550Q89.030 103.830 86.565 103.830L86.565 103.830Q84.780 103.830 82.358 105.402Q79.935 106.975 76.110 111.480L76.110 111.480Q75.430 112.245 75.005 112.075L75.005 112.075Q74.665 111.990 75.175 111.140L75.175 111.140Q79.680 104.255 85.375 100.515Q91.070 96.775 96.595 96.775L96.595 96.775Q104.415 96.775 104.415 104.085L104.415 104.085Q104.415 107.655 103.055 112.117Q101.695 116.580 99.910 121.170Q98.125 125.760 96.935 129.585L96.935 129.585Q102.970 117.430 109.728 110.248Q116.485 103.065 123.030 99.920Q129.575 96.775 135.015 96.775L135.015 96.775Q143.770 96.775 143.770 104.850L143.770 104.850Q143.770 109.015 141.603 115.390Q139.435 121.765 137.055 129.160L137.055 129.160Q146.065 111.905 156.095 104.340Q166.125 96.775 174.880 96.775L174.880 96.775Q181.765 96.775 183.338 102.045Q184.910 107.315 181.935 117.090L181.935 117.090L170.545 154.575Q168.165 162.565 168.845 164.988Q169.525 167.410 171.735 167.410L171.735 167.410Q173.520 167.410 175.900 165.880Q178.280 164.350 181.680 160.015L181.680 160.015Q182.445 159.080 182.785 159.250L182.785 159.250Q183.295 159.420 182.615 160.695L182.615 160.695Q178.960 166.730 173.817 170.088Q168.675 173.445 161.960 173.445L161.960 173.445Q155.755 173.445 154.183 169.662Q152.610 165.880 154.905 158.145L154.905 158.145L166.805 119.130Q169.355 110.545 168.377 107.442Q167.400 104.340 164 104.340L164 104.340Q160.515 104.340 154.863 108.335Q149.210 112.330 143.048 121.340Q136.885 130.350 131.870 145.395L131.870 145.395Q129.320 153.045 128.470 157.380Q127.620 161.715 127.620 163.755L127.620 163.755Q127.620 165.115 128.215 166.007Q128.810 166.900 128.810 168.090L128.810 168.090Q128.810 170.470 125.240 172.085Q121.670 173.700 115.720 173.700L115.720 173.700Q111.640 173.700 111.130 171.660Q110.620 169.620 111.980 165.030Z';

function CaratMark({ size = 64, color = '#e0b765', showInnerRing = true, showDots = true, style, ...rest }) {
  return (
    <svg viewBox="0 0 200 260" width={size} height={Math.round(size * 1.3)} role="img" aria-label="Carat Money" style={style} {...rest}>
      <path d={CM_OUTER} fill="none" stroke={color} strokeWidth="2"/>
      {showInnerRing && <path d={CM_INNER} fill="none" stroke={color} strokeWidth="1" opacity="0.45"/>}
      <path transform={CM_TRANSFORM} d={CM_PATH} fill={color}/>
      {showDots && (
        <>
          <circle cx="100" cy="36" r="2" fill={color}/>
          <circle cx="100" cy="224" r="2" fill={color}/>
        </>
      )}
    </svg>
  );
}

// ─── Hero hallmark + gold bar → ₹ animation ──────────────────────────────────
// Positions come from the hallmark's real place on screen, so the bar always
// lands on it: centred on phones, right-hand column on desktop.
function HeroMark() {
  const TOTAL_MS = 3000;
  const GAP_MS   = 2000;   // 2s after rupee disappears
  const CYCLE_MS = TOTAL_MS + GAP_MS;
  const START_MS = 800;

  const wrapRef = useRef(null);
  const [tick, setTick]         = useState(0);
  const [phase, setPhase]       = useState('idle');
  const [scrolled, setScrolled] = useState(false);
  const [geo, setGeo]           = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf, cycleTimer;
    const run = () => {
      const el = wrapRef.current;
      if (!el || window.scrollY > 10) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      setGeo({ cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, vw: window.innerWidth });
      setPhase('running');
      const start = performance.now();
      const animate = now => {
        const elapsed = now - start;
        setTick(Math.min(elapsed / TOTAL_MS, 1));
        if (elapsed < TOTAL_MS) raf = requestAnimationFrame(animate);
        else { setTick(1); setPhase('idle'); }
      };
      raf = requestAnimationFrame(animate);
    };
    const initialTimer = setTimeout(() => { run(); cycleTimer = setInterval(run, CYCLE_MS); }, START_MS);
    return () => { clearTimeout(initialTimer); clearInterval(cycleTimer); cancelAnimationFrame(raf); };
  }, []);

  const t      = tick;
  const active = phase === 'running' && !scrolled && geo !== null;
  let bar = null, rupee = null, cmGlow = false;

  if (active) {
    const { cx, cy, w, vw } = geo;
    const z        = Math.min(1.5, Math.max(1, w / 110));   // size factor vs the 110px phone logo
    const ovalHalf = (88 / 200) * w;
    const approach = 70 * z;
    const BAR_W    = 76 * z;
    const BAR_H    = 44 * z;
    const barEndT  = 0.55;
    const startX   = -BAR_W / 2;
    const endX     = cx - ovalHalf - BAR_W / 2;
    const barX     = startX + Math.min(t / barEndT, 1) * (endX - startX);
    const barRight = barX + BAR_W / 2;
    const dist     = (cx - ovalHalf) - barRight;
    let k = 1;
    if (dist < approach && dist >= 0) k = dist / approach;
    if (dist < 0) k = 0;
    if (t < barEndT && k > 0.02) bar = { x: barX, y: cy, w: BAR_W * k, h: BAR_H * k, d: 10 * z * k, k, z };
    cmGlow = barRight > (cx - ovalHalf - approach) && t < 0.78 && t > 0;

    if (t >= 0.55 && t <= 0.97) {
      const rp   = (t - 0.55) / (0.97 - 0.55);
      const size = Math.min(56 * z, 56 * z * (rp / 0.4));
      rupee = {
        x: cx + ovalHalf + rp * (vw - cx - ovalHalf - 24 * z),
        y: cy + size * 0.38,
        size,
        opacity: rp < 0.72 ? 1 : 1 - (rp - 0.72) / 0.28,
      };
    }
  }

  const color = C.gold2;
  return (
    <div ref={wrapRef} className="hero-mark-svg" style={{ position:'relative', lineHeight:0 }}>
      <svg viewBox="0 0 200 260" style={{ width:'100%', height:'auto', display:'block' }} role="img" aria-label="Carat Money" xmlns="http://www.w3.org/2000/svg">
        <path d={CM_OUTER} fill="none" stroke={color} strokeWidth="2"/>
        <path d={CM_INNER} fill="none" stroke={color} strokeWidth="1" opacity="0.45"/>
        <path transform={CM_TRANSFORM} d={CM_PATH} fill={color}
          style={{
            filter:     cmGlow ? 'drop-shadow(0 0 8px #f1d78d)' : 'none',
            opacity:    cmGlow ? 1 : 0.85,
            transition: 'filter 0.25s ease, opacity 0.25s ease',
          }}/>
        <circle cx="100" cy="36"  r="2" fill={color}/>
        <circle cx="100" cy="224" r="2" fill={color}/>
      </svg>

      {active && (
        <svg aria-hidden="true" style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', pointerEvents:'none', zIndex:999, overflow:'visible' }}>
          <defs>
            <linearGradient id="cmBarTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f7e08a"/>
              <stop offset="40%"  stopColor="#e0b765"/>
              <stop offset="100%" stopColor="#8a5e1a"/>
            </linearGradient>
            <linearGradient id="cmBarFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f1d78d"/>
              <stop offset="50%"  stopColor="#c9922a"/>
              <stop offset="100%" stopColor="#7a4e12"/>
            </linearGradient>
            <linearGradient id="cmBarSide" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#b8883a"/>
              <stop offset="100%" stopColor="#6b3d0a"/>
            </linearGradient>
          </defs>

          {bar && (() => {
            const { w, h, d, k, z } = bar;
            const inset = w * 0.12;              // top edge inset each side (classic bar shape)
            const x = bar.x - w / 2;
            const y = bar.y - h / 2;
            const u = k * z;
            const frontPoints = `${x},${y+h} ${x+w},${y+h} ${x+w-inset},${y} ${x+inset},${y}`;
            const topPoints   = `${x+inset},${y} ${x+w-inset},${y} ${x+w-inset+d},${y-d} ${x+inset+d},${y-d}`;
            const sidePoints  = `${x+w},${y+h} ${x+w+d},${y+h-d} ${x+w-inset+d},${y-d} ${x+w-inset},${y}`;
            return (
              <g>
                <polygon points={frontPoints} fill="url(#cmBarFace)"/>
                <polygon points={topPoints}   fill="url(#cmBarTop)"/>
                <polygon points={sidePoints}  fill="url(#cmBarSide)"/>
                {k > 0.4 && [0.28, 0.72].map((pos, i) => {
                  const rx    = x + w * pos;
                  const rtopX = x + inset + (w - 2 * inset) * pos;
                  return <line key={i} x1={rtopX} y1={y + 3 * u} x2={rx} y2={y + h - 3 * u} stroke="#8a5e1a" strokeWidth={1.2 * u} opacity="0.55"/>;
                })}
                {k > 0.5 && (
                  <polygon points={`${x+inset+4*u},${y+4*u} ${x+inset+w*0.18},${y+4*u} ${x+w*0.16},${y+h-6*u} ${x+4*u},${y+h-6*u}`} fill="white" opacity={0.1 * k}/>
                )}
              </g>
            );
          })()}

          {rupee && rupee.opacity > 0 && (
            <text x={rupee.x} y={rupee.y} textAnchor="middle" fontFamily="Georgia, serif" fontSize={rupee.size} fill="#e0b765" opacity={rupee.opacity}>₹</text>
          )}
        </svg>
      )}
    </div>
  );
}

const fmt = (n, d = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const parseNum = v => { if (v === '' || v == null) return null; const n = parseFloat(v); return isNaN(n) ? null : n; };
const makeId        = () => `o_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const blankOrnament = () => ({ id: makeId(), gross:'', stone:'', wastage:'', purity:'', pricePerGram:'' });
const fmtRange = v => v >= 100000 ? `~₹${(v/100000).toFixed(2)} L` : `~₹${(v/1000).toFixed(2)} K`;
const fmtTime       = d => d ? d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : null;
const copyToClipboard = async t => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };

// ─── Contact, WhatsApp, analytics & lead capture ──────────────────────────────
const WA_MSG  = "Hi. I'm interested in selling gold.";
const waUrl   = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const WA_LINK = waUrl(WA_MSG);
const CALL_NUMBERS = [
  { tel:'+918169874545', label:'816 987 4545' },
  { tel:'+919653456868', label:'965 345 6868' },
];

// Google Analytics event (quietly does nothing if GA hasn't loaded)
function track(name, params = {}) {
  try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch { /* ignore */ }
}
function openWA(text, source) {
  track('whatsapp_click', { source });
  window.open(waUrl(text), '_blank');
}
// Sends one lead row to the Google Sheet. Fire-and-forget: never blocks WhatsApp.
function postLead(payload) {
  if (!LEADS_URL) return;
  try {
    fetch(LEADS_URL, {
      method:'POST', mode:'no-cors', keepalive:true,
      headers:{ 'Content-Type':'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, ts: new Date().toISOString() }),
    }).catch(() => {});
  } catch { /* ignore */ }
}
// Scroll to a homepage section; from any other page, go home first.
function goSection(id, navigate) {
  if (window.location.pathname === '/') {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  } else if (navigate) {
    navigate(`/#${id}`);
  } else {
    window.location.href = `/#${id}`;
  }
}

// ─── Routing ──────────────────────────────────────────────────────────────────
function useRoute() {
  const get = () => window.location.pathname || '/';
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const h = () => setRoute(get());
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, []);
  const navigate = useCallback(path => {
    window.history.pushState({}, '', path);
    setRoute(get());
    window.scrollTo({ top:0, behavior:'instant' });
  }, []);
  const blogSlug = route.startsWith('/blog/') ? route.replace('/blog/', '') : null;
  return { route, navigate, blogSlug };
}

// ─── SEO ──────────────────────────────────────────────────────────────────────
const SEO_MAP = {
  '/':       { title:'Carat Money — Sell Gold at Best Price', desc:'Sell your gold at a fair price with free home pickup in Bangalore and Mumbai. Live gold rates, XRF testing in front of you and instant payment.' },
  '/sell':   { title:'Sell Gold to Carat Money | Best Buying Rates', desc:'Get a free quote on WhatsApp and book a home pickup in Bangalore or Mumbai. Your gold is tested in front of you and paid for instantly.' },
  '/buy':    { title:'Buy 24K Gold Coins | BIS-Hallmarked | Carat Money', desc:'Buy BIS-hallmarked 24K gold coins. 999.9 purity. 48-hour open-box delivery. WhatsApp to order.' },
  '/margin': { title:'Gold Buyer Margin Calculator | Free Tool by Carat Money', desc:'Free tool to check what your gold buyer is keeping above the spot rate. Used by 5,000+ sellers across India.' },
  '/blog':   { title:'Gold Selling Tips & Insights | Carat Money Blog', desc:'Expert articles on gold selling, buyer margins, and getting the best price for your gold in India.' },
};
function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
  link.setAttribute('href', href);
}
function useSEO(route) {
  useEffect(() => {
    if (!route) return;
    setCanonical(`https://carat.money${route}`);
    const seo = SEO_MAP[route] || SEO_MAP['/'];
    document.title = seo.title;
    const em = (sel, attr, val, content) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    em('meta[property="og:url"]',        'property', 'og:url',          `https://carat.money${route}`);
    em('meta[name="description"]',       'name',     'description',     seo.desc);
    em('meta[property="og:title"]',      'property', 'og:title',        seo.title);
    em('meta[property="og:description"]','property', 'og:description',  seo.desc);
    em('meta[property="og:type"]',       'property', 'og:type',         'website');
  }, [route]);
}

// ─── Live spot rate ───────────────────────────────────────────────────────────
function useSpotRate() {
  const [spot, setSpot] = useState({ raw:null, display:null, updatedAt:null, loading:true, error:false });
  const fetch_ = useCallback(async () => {
    try {
      const res  = await fetch('/api/rate');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const raw     = Math.round(data.sellPerGram);
      const display = Math.round(raw * 1.03 * 0.965);
      setSpot({ raw, display, updatedAt: new Date(), loading:false, error:false });
    } catch (e) {
      console.warn('[spot]', e.message);
      setSpot(p => ({ ...p, loading:false, error:true }));
    }
  }, []);
  useEffect(() => { fetch_(); const id = setInterval(fetch_, 60_000); return () => clearInterval(id); }, [fetch_]);
  return spot;
}

// ─── Languages (homepage only — blog and other pages stay in English) ─────────
// Hindi and Kannada are first drafts: have a native speaker review before launch.
const LANGS = [
  { code:'en', short:'EN',  name:'English' },
  { code:'hi', short:'हिं', name:'हिन्दी' },
  { code:'kn', short:'ಕ',   name:'ಕನ್ನಡ' },
];
const LANG_CODES = LANGS.map(l => l.code);

const REVIEWERS = [
  { n:'Priya D.',   l:'Kharghar' },
  { n:'Imran S.',   l:'Panvel' },
  { n:'Swati K.',   l:'CBD Belapur' },
  { n:"Rohan D'M.", l:'Ulwe' },
  { n:'Sachin J.',  l:'Kalamboli' },
];

const STR = {
  // ═══ ENGLISH ═══════════════════════════════════════════════════════════════
  en: {
    nav_calc: 'Value Calculator', nav_why: 'Why Us', nav_process: 'Process', nav_reviews: 'Reviews', nav_faqs: 'FAQs', nav_blog: 'Blog',
    whatsapp: 'WhatsApp', call: 'Call', call_short: 'Call', menu: 'Menu', partner_link: 'Partner Program', language: 'Language',

    hero_eyebrow:   'We buy gold at fair price',
    hero_h1:        ['Sell your gold at the ', 'live', ' market rate.'],
    hero_sub:       'Paid instantly to your bank or UPI.',
    hero_guarantee: 'We guarantee — nobody can match our price',
    hero_cta_wa:    'Get a free quote on WhatsApp',
    hero_cta_calc:  'Value your gold',
    hero_stats:     '5,000+ customers · ₹100Cr+ purchased · 4.9★',
    hero_pickup:    'Home pickup available in Bangalore & Mumbai',
    tiles: [
      { t:'Doorstep service',   d:'We come to you, so your gold never has to travel.' },
      { t:'Accurate valuation', d:'XRF testing measures exact purity, and you see the reading yourself.' },
      { t:'Instant transfer',   d:'Money in your bank or UPI right away, plus a free, detailed valuation certificate.' },
    ],

    rate_title: 'Our Buy Rate', rate_loading: 'Loading…', rate_updated: 'Live rate · Updated {time}', rate_fetching: 'Fetching live rate…',
    rate_unavailable: 'Live rate temporarily unavailable', rate_refresh: 'Refreshes every minute · GST inclusive', rate_cta: 'Ask for a quote on WhatsApp',
    gst_excl: '24K without GST:',
    gst_note: "GST-inclusive rate shown above. If you're GST-registered, we pass the tax credit back to you.",

    calc_title: "What's your gold worth now?", calc_weight: 'Weight (grams)', calc_weight_ph: 'e.g. 10', calc_karat: 'Select purity',
    calc_est: 'Estimated value', calc_at: 'at ₹{rate}/g for {k}K', calc_cta: 'Get this price on WhatsApp',
    calc_disclaimer: 'Estimate only. Final value is confirmed after XRF testing in front of you.',
    calc_margin: 'Already have a quote from another buyer? Check their margin →',

    git_title: 'Book a free appointment', git_sub: "Share your details and we'll confirm a slot on WhatsApp.",
    git_name: 'Your name', git_name_ph: 'e.g. Priya S', git_mobile: 'Mobile number', git_mobile_ph: '10-digit number',
    git_pref: 'I prefer', git_doorstep: 'Doorstep pickup', git_centre: 'Visit our centre',
    git_book: 'Book free appointment', git_call: 'Call now',
    git_consent: 'By submitting, you agree to be contacted about your gold sale.',
    git_err: 'Enter your name and a valid 10-digit mobile number.',

    why_title: 'Why people trust Carat Money',
    why_intro: 'Selling old gold usually means guesswork, hidden cuts and no paperwork. We built every step to be measured, shown to you and documented.',
    why_them: 'Typical gold buyers', why_tag: 'Price guarantee',
    why_rows: [
      { k:'Purity testing',     us:'XRF testing, non-destructive, with the reading shown to you on screen.', them:'Touchstone testing, or a reading you never get to see.' },
      { k:'Weight',             us:'Weighed in front of you, precise to 0.001 g.', them:'Weight rounded down and stones only estimated.' },
      { k:'Pricing',            us:'Live market-linked rate, published openly.', them:'Stale or unclear rates that change at the counter.' },
      { k:'Deductions',         us:'No extra "wastage" cuts.', them:'Hidden deductions under different names: excess stone deductions, melting loss, service charges, etc.' },
      { k:'Payment',            us:'Instant bank or UPI transfer + a free valuation certificate.', them:'Cash, no paperwork, no invoices.' },
      { k:'Jewellery accepted', us:'All jewellery accepted, broken or old, BIS-hallmarked or not. Purity verified scientifically.', them:"Non-hallmarked or other brands' jewellery is rejected." },
    ],

    proc_title: 'Carat Money process in 4 easy steps', proc_sub: 'Transparent at every step, and done in about 15 minutes.',
    proc_steps: [
      { t:'Walk into a Carat Money centre or schedule a doorstep appointment', d:'Visit us in Kharghar, or we come to your home at a time that suits you.' },
      { t:'Gold tested using advanced machines', d:'XRF purity testing and precision weighing, done in front of you.' },
      { t:'Purity, weight and live pricing shown before sale', d:'You see every number before you decide to sell.' },
      { t:'Instant payment without any delay', d:'Bank or UPI transfer the moment you accept the offer.' },
    ],
    proc_cta: 'Get a free estimate',

    rev_title: 'Why thousands trust Carat Money', rev_sub: 'What sellers across Navi Mumbai say about us.', rev_sample: 'Sample reviews',
    review_quotes: [
      'They turned the XRF screen towards me and I saw the purity reading myself. No guesswork at all.',
      'The rate matched the live price on their website, and the money reached my UPI before I left.',
      'My old chain was broken and had no hallmark. They still tested it properly and paid me fairly.',
      'They came home at the time we agreed and gave me a free valuation certificate for every piece.',
      'Weighed to the last milligram in front of me. No hidden deductions anywhere.',
    ],
    prev: 'Previous reviews', next: 'Next reviews', stars: '5 out of 5 stars',

    faq_title: 'Frequently asked questions', faq_sub: 'Everything to know before you sell your gold.',
    faq_panel_title: 'Still have questions?', faq_panel_sub: 'Reach us on any of these, all days, 9 am to 9 pm.', email: 'Email',
    faqs: [
      { q:"How is my gold's price calculated?", a:'We weigh your gold, test its purity on an XRF machine and multiply the pure gold content by the live rate shown on this page. You see every number before you decide.' },
      { q:'Do you melt or damage my jewellery during testing?', a:'No. XRF testing is non-destructive, so your jewellery stays exactly as it is while we test it.' },
      { q:'Do you offer home pickup?', a:'Yes, in Bangalore and Mumbai. Our executive visits at a time that suits you, tests your gold in front of you and makes a firm offer on the spot.' },
      { q:'Is the estimate free?', a:"Yes. Estimates are free with no obligation. You sell only if you're happy with the offer." },
      { q:'Are there any deductions?', a:'Only the weight of stones, which we measure and show you. There are no extra "wastage" cuts and no hidden charges.' },
      { q:'What if my jewellery is broken or not hallmarked?', a:"We accept all gold jewellery, including broken, old and non-hallmarked pieces. XRF testing finds the real purity, so you're paid for the actual gold content." },
      { q:'How will I be paid?', a:'Instantly, by bank transfer or UPI, as soon as you accept the offer. We never pay in cash.' },
      { q:'Will I get any paperwork?', a:'Yes. You receive an invoice for the sale and a free, detailed valuation certificate.' },
      { q:'Can I walk away after testing?', a:"Yes, at no cost. You're under no obligation to sell until you accept the final offer." },
      { q:'How long does it take?', a:'About 15 minutes. Testing, the offer and payment all happen in one sitting.' },
      { q:'Which documents do I need?', a:'Your Aadhaar and PAN, for KYC.' },
      { q:'Do you buy gold pledged with a bank or NBFC?', a:"Yes. We help release gold pledged with a bank or NBFC and buy it at today's rate. WhatsApp us for details." },
    ],

    visit_label: 'Visit our centre', visit_title: 'Carat Money, Kharghar', visit_hours: 'All days, 9 am to 9 pm', visit_dir: 'Get directions',

    blog_title: 'Gold insights', blog_sub: 'Straight answers before you sell your gold.', blog_all: 'View all articles', blog_read: 'Read', blog_note: '',

    app_h: 'Carat Money, soon in your pocket.',
    app_body: 'Track the live gold rate, value your jewellery and book a doorstep pickup — all in one app. Launching soon on iOS and Android.',
    app_soon: 'Coming soon', app_hint: 'Tap either button to get a launch alert on WhatsApp.',
    app_chip1: 'XRF-tested purity', app_chip2: 'Instant UPI payout',

    partner_text: 'Earn on every client you refer. We buy their gold. You get commissions.', partner_cta: 'Join our Partner Program →',

    f_onpage: 'On this page', f_explore: 'Explore', f_contact: 'Contact',
    f_live: 'Live rate', f_calc: 'Value calculator', f_why: 'Why us', f_reviews: 'Reviews', f_faqs: 'FAQs', f_visit: 'Visit us',
    f_sell: 'Sell gold', f_buy: 'Buy gold coins', f_margin: 'Margin calculator', f_blog: 'Blog', f_partner: 'Partner Program',
    f_rights: 'All rights reserved.',
    f_legal: "Gold rates shown on this website are indicative and update with the market; the final price is confirmed after testing your gold in front of you. Use of this website is subject to Carat Money's Terms of Service and Privacy Policy. By submitting your details, you consent to Carat Money contacting you about your enquiry and processing your information for that purpose.",
    wa_float: 'Chat on WhatsApp',
  },

  // ═══ HINDI ═════════════════════════════════════════════════════════════════
  hi: {
    nav_calc: 'वैल्यू कैलकुलेटर', nav_why: 'हम क्यों', nav_process: 'प्रक्रिया', nav_reviews: 'रिव्यू', nav_faqs: 'सवाल-जवाब', nav_blog: 'ब्लॉग',
    whatsapp: 'WhatsApp', call: 'कॉल करें', call_short: 'कॉल', menu: 'मेन्यू', partner_link: 'पार्टनर प्रोग्राम', language: 'भाषा',

    hero_eyebrow:   'हम सही दाम पर सोना खरीदते हैं',
    hero_h1:        ['अपना सोना ', 'लाइव', ' मार्केट रेट पर बेचें।'],
    hero_sub:       'पेमेंट तुरंत आपके बैंक या UPI में।',
    hero_guarantee: 'हमारी गारंटी — हमसे बेहतर दाम कोई नहीं देगा',
    hero_cta_wa:    'WhatsApp पर मुफ़्त कोटेशन पाएँ',
    hero_cta_calc:  'अपने सोने की कीमत जानें',
    hero_stats:     '5,000+ ग्राहक · ₹100 करोड़+ की खरीद · 4.9★',
    hero_pickup:    'बेंगलुरु और मुंबई में होम पिकअप उपलब्ध',
    tiles: [
      { t:'घर पर सेवा',     d:'हम आपके पास आते हैं, ताकि आपके सोने को कहीं ले जाना न पड़े।' },
      { t:'सटीक मूल्यांकन', d:'XRF टेस्टिंग से सही शुद्धता मापी जाती है, और रीडिंग आप ख़ुद देखते हैं।' },
      { t:'तुरंत ट्रांसफ़र',  d:'पैसा तुरंत आपके बैंक या UPI में, साथ में मुफ़्त और विस्तृत वैल्यूएशन सर्टिफ़िकेट।' },
    ],

    rate_title: 'हमारा खरीद रेट', rate_loading: 'लोड हो रहा है…', rate_updated: 'लाइव रेट · {time} पर अपडेट', rate_fetching: 'लाइव रेट लाया जा रहा है…',
    rate_unavailable: 'लाइव रेट अभी उपलब्ध नहीं है', rate_refresh: 'हर मिनट अपडेट होता है · GST सहित', rate_cta: 'WhatsApp पर कोटेशन माँगें',
    gst_excl: 'GST के बिना 24K:',
    gst_note: 'ऊपर दिखाया गया रेट GST सहित है। अगर आप GST-रजिस्टर्ड हैं, तो हम टैक्स क्रेडिट आपको वापस देते हैं।',

    calc_title: 'आपके सोने की अभी कितनी कीमत है?', calc_weight: 'वज़न (ग्राम)', calc_weight_ph: 'जैसे 10', calc_karat: 'शुद्धता चुनें',
    calc_est: 'अनुमानित कीमत', calc_at: '{k}K के लिए ₹{rate}/ग्राम पर', calc_cta: 'यह कीमत WhatsApp पर पाएँ',
    calc_disclaimer: 'यह सिर्फ़ अनुमान है। अंतिम कीमत आपके सामने XRF टेस्टिंग के बाद तय होती है।',
    calc_margin: 'किसी और खरीदार से कोटेशन मिला है? उनका मार्जिन जाँचें →',

    git_title: 'मुफ़्त अपॉइंटमेंट बुक करें', git_sub: 'अपनी जानकारी दें, हम WhatsApp पर समय तय करेंगे।',
    git_name: 'आपका नाम', git_name_ph: 'जैसे प्रिया एस', git_mobile: 'मोबाइल नंबर', git_mobile_ph: '10 अंकों का नंबर',
    git_pref: 'मुझे पसंद है', git_doorstep: 'घर से पिकअप', git_centre: 'सेंटर पर आना',
    git_book: 'मुफ़्त अपॉइंटमेंट बुक करें', git_call: 'अभी कॉल करें',
    git_consent: 'सबमिट करके, आप अपने सोने की बिक्री के बारे में संपर्क किए जाने के लिए सहमत हैं।',
    git_err: 'अपना नाम और सही 10 अंकों का मोबाइल नंबर डालें।',

    why_title: 'लोग Carat Money पर भरोसा क्यों करते हैं',
    why_intro: 'पुराना सोना बेचने में अक्सर अंदाज़ा, छिपी कटौतियाँ और कोई कागज़ात नहीं होते। हमने हर कदम को मापा हुआ, आपको दिखाया हुआ और दस्तावेज़ों के साथ बनाया है।',
    why_them: 'आम सोना खरीदार', why_tag: 'प्राइस गारंटी',
    why_rows: [
      { k:'शुद्धता जाँच',      us:'XRF टेस्टिंग, बिना नुकसान के, रीडिंग स्क्रीन पर आपको दिखाई जाती है।', them:'कसौटी पत्थर से जाँच, या ऐसी रीडिंग जो आपको दिखाई ही नहीं जाती।' },
      { k:'वज़न',             us:'आपके सामने तौला जाता है, 0.001 ग्राम तक सटीक।', them:'वज़न नीचे राउंड किया जाता है और पत्थरों का सिर्फ़ अंदाज़ा लगाया जाता है।' },
      { k:'कीमत',            us:'लाइव मार्केट से जुड़ा रेट, खुले तौर पर प्रकाशित।', them:'पुराने या अस्पष्ट रेट, जो काउंटर पर बदल जाते हैं।' },
      { k:'कटौतियाँ',          us:'कोई अतिरिक्त "वेस्टेज" कटौती नहीं।', them:'अलग-अलग नामों से छिपी कटौतियाँ: पत्थरों की ज़्यादा कटौती, पिघलाने में नुकसान, सर्विस चार्ज आदि।' },
      { k:'पेमेंट',            us:'तुरंत बैंक या UPI ट्रांसफ़र + मुफ़्त वैल्यूएशन सर्टिफ़िकेट।', them:'नकद, कोई कागज़ात नहीं, कोई इनवॉइस नहीं।' },
      { k:'स्वीकार्य ज्वेलरी',    us:'हर तरह की ज्वेलरी स्वीकार, टूटी या पुरानी, BIS हॉलमार्क हो या न हो। शुद्धता की वैज्ञानिक जाँच।', them:'बिना हॉलमार्क या दूसरे ब्रांड की ज्वेलरी लेने से मना।' },
    ],

    proc_title: 'Carat Money की प्रक्रिया, 4 आसान कदमों में', proc_sub: 'हर कदम पारदर्शी, और लगभग 15 मिनट में पूरा।',
    proc_steps: [
      { t:'Carat Money सेंटर आएँ या घर पर अपॉइंटमेंट बुक करें', d:'खारघर में हमारे सेंटर आएँ, या हम आपकी सुविधा के समय आपके घर आएँगे।' },
      { t:'आधुनिक मशीनों से सोने की जाँच', d:'आपके सामने XRF शुद्धता जाँच और सटीक तौल।' },
      { t:'बिक्री से पहले शुद्धता, वज़न और लाइव कीमत दिखाई जाती है', d:'बेचने का फ़ैसला लेने से पहले आप हर आँकड़ा देखते हैं।' },
      { t:'बिना किसी देरी के तुरंत पेमेंट', d:'ऑफ़र मानते ही बैंक या UPI ट्रांसफ़र।' },
    ],
    proc_cta: 'मुफ़्त अनुमान पाएँ',

    rev_title: 'हज़ारों लोग Carat Money पर भरोसा क्यों करते हैं', rev_sub: 'नवी मुंबई के विक्रेता हमारे बारे में क्या कहते हैं।', rev_sample: 'नमूना रिव्यू',
    review_quotes: [
      'उन्होंने XRF स्क्रीन मेरी तरफ़ घुमाई और मैंने शुद्धता की रीडिंग ख़ुद देखी। कोई अंदाज़ा नहीं।',
      'रेट उनकी वेबसाइट के लाइव भाव से मेल खाया, और मेरे निकलने से पहले पैसा UPI में आ गया।',
      'मेरी पुरानी चेन टूटी हुई थी और उस पर हॉलमार्क नहीं था। फिर भी उन्होंने ठीक से जाँच की और सही दाम दिया।',
      'वे तय समय पर घर आए और हर गहने का मुफ़्त वैल्यूएशन सर्टिफ़िकेट दिया।',
      'मेरे सामने आख़िरी मिलीग्राम तक तौला। कहीं कोई छिपी कटौती नहीं।',
    ],
    prev: 'पिछले रिव्यू', next: 'अगले रिव्यू', stars: '5 में से 5 स्टार',

    faq_title: 'अक्सर पूछे जाने वाले सवाल', faq_sub: 'सोना बेचने से पहले जानने लायक हर बात।',
    faq_panel_title: 'अब भी कोई सवाल है?', faq_panel_sub: 'इनमें से किसी पर भी संपर्क करें, हर दिन सुबह 9 से रात 9 बजे तक।', email: 'ईमेल',
    faqs: [
      { q:'मेरे सोने की कीमत कैसे तय होती है?', a:'हम आपका सोना तौलते हैं, XRF मशीन पर उसकी शुद्धता जाँचते हैं, और शुद्ध सोने की मात्रा को इस पेज पर दिखाए गए लाइव रेट से गुणा करते हैं। फ़ैसला लेने से पहले आप हर आँकड़ा देखते हैं।' },
      { q:'क्या जाँच के दौरान मेरी ज्वेलरी पिघलाई या ख़राब की जाती है?', a:'नहीं। XRF टेस्टिंग से कोई नुकसान नहीं होता, जाँच के दौरान आपकी ज्वेलरी जैसी है वैसी ही रहती है।' },
      { q:'क्या आप घर से पिकअप करते हैं?', a:'हाँ, बेंगलुरु और मुंबई में। हमारा एग्ज़ीक्यूटिव आपकी सुविधा के समय पर आता है, आपके सामने सोने की जाँच करता है और वहीं पक्का ऑफ़र देता है।' },
      { q:'क्या अनुमान मुफ़्त है?', a:'हाँ। अनुमान मुफ़्त है और कोई बाध्यता नहीं। ऑफ़र पसंद आए तभी बेचें।' },
      { q:'क्या कोई कटौती होती है?', a:'सिर्फ़ पत्थरों के वज़न की, जिसे हम मापकर आपको दिखाते हैं। कोई अतिरिक्त "वेस्टेज" कटौती या छिपा चार्ज नहीं।' },
      { q:'अगर मेरी ज्वेलरी टूटी हुई है या उस पर हॉलमार्क नहीं है तो?', a:'हम हर तरह की सोने की ज्वेलरी लेते हैं, टूटी, पुरानी और बिना हॉलमार्क वाली भी। XRF टेस्टिंग असली शुद्धता बताती है, इसलिए आपको सोने की असली मात्रा का पैसा मिलता है।' },
      { q:'मुझे पेमेंट कैसे मिलेगा?', a:'ऑफ़र मानते ही तुरंत, बैंक ट्रांसफ़र या UPI से। हम कभी नकद भुगतान नहीं करते।' },
      { q:'क्या मुझे कोई कागज़ात मिलेंगे?', a:'हाँ। आपको बिक्री का इनवॉइस और एक मुफ़्त, विस्तृत वैल्यूएशन सर्टिफ़िकेट मिलता है।' },
      { q:'क्या जाँच के बाद मैं बिना बेचे जा सकता/सकती हूँ?', a:'हाँ, बिना किसी शुल्क के। अंतिम ऑफ़र मानने तक आप बेचने के लिए बाध्य नहीं हैं।' },
      { q:'इसमें कितना समय लगता है?', a:'लगभग 15 मिनट। जाँच, ऑफ़र और पेमेंट सब एक ही बार में हो जाते हैं।' },
      { q:'कौन से दस्तावेज़ चाहिए?', a:'KYC के लिए आपका आधार और PAN।' },
      { q:'क्या आप बैंक या NBFC में गिरवी रखा सोना खरीदते हैं?', a:'हाँ। हम बैंक या NBFC में गिरवी रखा सोना छुड़ाने में मदद करते हैं और उसे आज के रेट पर खरीदते हैं। जानकारी के लिए हमें WhatsApp करें।' },
    ],

    visit_label: 'हमारे सेंटर आएँ', visit_title: 'Carat Money, खारघर', visit_hours: 'हर दिन, सुबह 9 से रात 9 बजे तक', visit_dir: 'रास्ता देखें',

    blog_title: 'गोल्ड इनसाइट्स', blog_sub: 'सोना बेचने से पहले सीधे जवाब।', blog_all: 'सभी लेख देखें', blog_read: 'पढ़ें', blog_note: 'लेख अंग्रेज़ी में हैं।',

    app_h: 'Carat Money, जल्द ही आपकी जेब में।',
    app_body: 'लाइव गोल्ड रेट देखें, अपनी ज्वेलरी की कीमत जानें और घर से पिकअप बुक करें — सब एक ही ऐप में। जल्द ही iOS और Android पर।',
    app_soon: 'जल्द आ रहा है', app_hint: 'लॉन्च की सूचना WhatsApp पर पाने के लिए किसी भी बटन पर टैप करें।',
    app_chip1: 'XRF से जाँची शुद्धता', app_chip2: 'तुरंत UPI पेमेंट',

    partner_text: 'हर रेफ़र किए गए ग्राहक पर कमाएँ। हम उनका सोना खरीदते हैं, आपको कमीशन मिलता है।', partner_cta: 'हमारे पार्टनर प्रोग्राम से जुड़ें →',

    f_onpage: 'इस पेज पर', f_explore: 'और देखें', f_contact: 'संपर्क',
    f_live: 'लाइव रेट', f_calc: 'वैल्यू कैलकुलेटर', f_why: 'हम क्यों', f_reviews: 'रिव्यू', f_faqs: 'सवाल-जवाब', f_visit: 'हमारा सेंटर',
    f_sell: 'सोना बेचें', f_buy: 'सोने के सिक्के खरीदें', f_margin: 'मार्जिन कैलकुलेटर', f_blog: 'ब्लॉग', f_partner: 'पार्टनर प्रोग्राम',
    f_rights: 'सर्वाधिकार सुरक्षित।',
    f_legal: 'इस वेबसाइट पर दिखाए गए सोने के रेट सांकेतिक हैं और बाज़ार के साथ बदलते रहते हैं; अंतिम कीमत आपके सामने सोने की जाँच के बाद तय होती है। इस वेबसाइट का उपयोग Carat Money की सेवा की शर्तों और गोपनीयता नीति के अधीन है। अपनी जानकारी सबमिट करके, आप Carat Money द्वारा आपकी पूछताछ के बारे में संपर्क किए जाने और इसी उद्देश्य से आपकी जानकारी के उपयोग के लिए सहमति देते हैं।',
    wa_float: 'WhatsApp पर चैट करें',
  },

  // ═══ KANNADA ═══════════════════════════════════════════════════════════════
  kn: {
    nav_calc: 'ಮೌಲ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್', nav_why: 'ನಾವೇ ಏಕೆ', nav_process: 'ಪ್ರಕ್ರಿಯೆ', nav_reviews: 'ವಿಮರ್ಶೆಗಳು', nav_faqs: 'ಪ್ರಶ್ನೋತ್ತರ', nav_blog: 'ಬ್ಲಾಗ್',
    whatsapp: 'WhatsApp', call: 'ಕರೆ ಮಾಡಿ', call_short: 'ಕರೆ', menu: 'ಮೆನು', partner_link: 'ಪಾರ್ಟ್ನರ್ ಪ್ರೋಗ್ರಾಂ', language: 'ಭಾಷೆ',

    hero_eyebrow:   'ನ್ಯಾಯಯುತ ಬೆಲೆಗೆ ನಾವು ಚಿನ್ನ ಖರೀದಿಸುತ್ತೇವೆ',
    hero_h1:        ['ನಿಮ್ಮ ಚಿನ್ನವನ್ನು ', 'ಲೈವ್', ' ಮಾರುಕಟ್ಟೆ ದರದಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ.'],
    hero_sub:       'ಹಣ ತಕ್ಷಣ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಥವಾ UPI ಗೆ.',
    hero_guarantee: 'ನಮ್ಮ ಗ್ಯಾರಂಟಿ — ನಮ್ಮ ಬೆಲೆಗೆ ಯಾರೂ ಸರಿಸಾಟಿಯಾಗಲಾರರು',
    hero_cta_wa:    'WhatsApp ನಲ್ಲಿ ಉಚಿತ ಕೊಟೇಶನ್ ಪಡೆಯಿರಿ',
    hero_cta_calc:  'ನಿಮ್ಮ ಚಿನ್ನದ ಮೌಲ್ಯ ತಿಳಿಯಿರಿ',
    hero_stats:     '5,000+ ಗ್ರಾಹಕರು · ₹100 ಕೋಟಿ+ ಖರೀದಿ · 4.9★',
    hero_pickup:    'ಬೆಂಗಳೂರು ಮತ್ತು ಮುಂಬೈನಲ್ಲಿ ಮನೆಯಿಂದ ಪಿಕಪ್ ಲಭ್ಯ',
    tiles: [
      { t:'ಮನೆ ಬಾಗಿಲಿಗೆ ಸೇವೆ', d:'ನಾವೇ ನಿಮ್ಮಲ್ಲಿಗೆ ಬರುತ್ತೇವೆ, ನಿಮ್ಮ ಚಿನ್ನವನ್ನು ಎಲ್ಲಿಗೂ ಕೊಂಡೊಯ್ಯಬೇಕಾಗಿಲ್ಲ.' },
      { t:'ನಿಖರ ಮೌಲ್ಯಮಾಪನ',  d:'XRF ಪರೀಕ್ಷೆ ನಿಖರ ಶುದ್ಧತೆಯನ್ನು ಅಳೆಯುತ್ತದೆ, ರೀಡಿಂಗ್ ಅನ್ನು ನೀವೇ ನೋಡುತ್ತೀರಿ.' },
      { t:'ತಕ್ಷಣ ವರ್ಗಾವಣೆ',   d:'ಹಣ ತಕ್ಷಣ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಥವಾ UPI ಗೆ, ಜೊತೆಗೆ ಉಚಿತ ಮತ್ತು ವಿವರವಾದ ಮೌಲ್ಯಮಾಪನ ಪ್ರಮಾಣಪತ್ರ.' },
    ],

    rate_title: 'ನಮ್ಮ ಖರೀದಿ ದರ', rate_loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…', rate_updated: 'ಲೈವ್ ದರ · {time} ಕ್ಕೆ ಅಪ್‌ಡೇಟ್', rate_fetching: 'ಲೈವ್ ದರ ಪಡೆಯಲಾಗುತ್ತಿದೆ…',
    rate_unavailable: 'ಲೈವ್ ದರ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ', rate_refresh: 'ಪ್ರತಿ ನಿಮಿಷ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ · GST ಸಹಿತ', rate_cta: 'WhatsApp ನಲ್ಲಿ ಕೊಟೇಶನ್ ಕೇಳಿ',
    gst_excl: 'GST ಇಲ್ಲದೆ 24K:',
    gst_note: 'ಮೇಲೆ ತೋರಿಸಿರುವ ದರ GST ಸಹಿತ. ನೀವು GST ನೋಂದಾಯಿತರಾಗಿದ್ದರೆ, ತೆರಿಗೆ ಕ್ರೆಡಿಟ್ ಅನ್ನು ನಿಮಗೆ ಹಿಂತಿರುಗಿಸುತ್ತೇವೆ.',

    calc_title: 'ನಿಮ್ಮ ಚಿನ್ನದ ಈಗಿನ ಮೌಲ್ಯ ಎಷ್ಟು?', calc_weight: 'ತೂಕ (ಗ್ರಾಂ)', calc_weight_ph: 'ಉದಾ. 10', calc_karat: 'ಶುದ್ಧತೆ ಆಯ್ಕೆಮಾಡಿ',
    calc_est: 'ಅಂದಾಜು ಮೌಲ್ಯ', calc_at: '{k}K ಗೆ ₹{rate}/ಗ್ರಾಂ ದರದಲ್ಲಿ', calc_cta: 'ಈ ಬೆಲೆಯನ್ನು WhatsApp ನಲ್ಲಿ ಪಡೆಯಿರಿ',
    calc_disclaimer: 'ಇದು ಕೇವಲ ಅಂದಾಜು. ಅಂತಿಮ ಮೌಲ್ಯವನ್ನು ನಿಮ್ಮ ಮುಂದೆಯೇ XRF ಪರೀಕ್ಷೆಯ ನಂತರ ದೃಢಪಡಿಸಲಾಗುತ್ತದೆ.',
    calc_margin: 'ಬೇರೆ ಖರೀದಿದಾರರಿಂದ ಕೊಟೇಶನ್ ಬಂದಿದೆಯೇ? ಅವರ ಮಾರ್ಜಿನ್ ಪರಿಶೀಲಿಸಿ →',

    git_title: 'ಉಚಿತ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ', git_sub: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನೀಡಿ, ನಾವು WhatsApp ನಲ್ಲಿ ಸಮಯವನ್ನು ದೃಢಪಡಿಸುತ್ತೇವೆ.',
    git_name: 'ನಿಮ್ಮ ಹೆಸರು', git_name_ph: 'ಉದಾ. ಪ್ರಿಯಾ ಎಸ್', git_mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', git_mobile_ph: '10 ಅಂಕಿಯ ಸಂಖ್ಯೆ',
    git_pref: 'ನನ್ನ ಆಯ್ಕೆ', git_doorstep: 'ಮನೆಯಿಂದ ಪಿಕಪ್', git_centre: 'ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ',
    git_book: 'ಉಚಿತ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ', git_call: 'ಈಗ ಕರೆ ಮಾಡಿ',
    git_consent: 'ಸಲ್ಲಿಸುವ ಮೂಲಕ, ನಿಮ್ಮ ಚಿನ್ನ ಮಾರಾಟದ ಕುರಿತು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ.',
    git_err: 'ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',

    why_title: 'ಜನರು Carat Money ಅನ್ನು ಏಕೆ ನಂಬುತ್ತಾರೆ',
    why_intro: 'ಹಳೆಯ ಚಿನ್ನ ಮಾರುವಾಗ ಸಾಮಾನ್ಯವಾಗಿ ಊಹೆ, ಮರೆಮಾಚಿದ ಕಡಿತಗಳು ಮತ್ತು ದಾಖಲೆಗಳ ಕೊರತೆ ಇರುತ್ತದೆ. ನಾವು ಪ್ರತಿಯೊಂದು ಹಂತವನ್ನೂ ಅಳೆದು, ನಿಮಗೆ ತೋರಿಸಿ, ದಾಖಲಿಸುವಂತೆ ರೂಪಿಸಿದ್ದೇವೆ.',
    why_them: 'ಸಾಮಾನ್ಯ ಚಿನ್ನ ಖರೀದಿದಾರರು', why_tag: 'ಬೆಲೆ ಗ್ಯಾರಂಟಿ',
    why_rows: [
      { k:'ಶುದ್ಧತೆ ಪರೀಕ್ಷೆ',     us:'XRF ಪರೀಕ್ಷೆ, ಯಾವುದೇ ಹಾನಿಯಿಲ್ಲದೆ, ರೀಡಿಂಗ್ ಅನ್ನು ಪರದೆಯ ಮೇಲೆ ನಿಮಗೆ ತೋರಿಸಲಾಗುತ್ತದೆ.', them:'ಒರೆಗಲ್ಲಿನ ಪರೀಕ್ಷೆ, ಅಥವಾ ನಿಮಗೆ ತೋರಿಸದ ರೀಡಿಂಗ್.' },
      { k:'ತೂಕ',              us:'ನಿಮ್ಮ ಮುಂದೆಯೇ ತೂಕ, 0.001 ಗ್ರಾಂವರೆಗೆ ನಿಖರ.', them:'ತೂಕವನ್ನು ಕಡಿಮೆಗೆ ರೌಂಡ್ ಮಾಡಲಾಗುತ್ತದೆ, ಕಲ್ಲುಗಳ ತೂಕವನ್ನು ಕೇವಲ ಅಂದಾಜಿಸಲಾಗುತ್ತದೆ.' },
      { k:'ಬೆಲೆ ನಿಗದಿ',         us:'ಲೈವ್ ಮಾರುಕಟ್ಟೆಗೆ ಜೋಡಿಸಿದ ದರ, ಬಹಿರಂಗವಾಗಿ ಪ್ರಕಟಿತ.', them:'ಹಳೆಯ ಅಥವಾ ಅಸ್ಪಷ್ಟ ದರಗಳು, ಕೌಂಟರ್‌ನಲ್ಲಿ ಬದಲಾಗುತ್ತವೆ.' },
      { k:'ಕಡಿತಗಳು',           us:'ಯಾವುದೇ ಹೆಚ್ಚುವರಿ "ವೇಸ್ಟೇಜ್" ಕಡಿತವಿಲ್ಲ.', them:'ಬೇರೆ ಬೇರೆ ಹೆಸರಿನಲ್ಲಿ ಮರೆಮಾಚಿದ ಕಡಿತಗಳು: ಕಲ್ಲುಗಳ ಅತಿಯಾದ ಕಡಿತ, ಕರಗಿಸುವಾಗಿನ ನಷ್ಟ, ಸೇವಾ ಶುಲ್ಕ ಇತ್ಯಾದಿ.' },
      { k:'ಪಾವತಿ',             us:'ತಕ್ಷಣ ಬ್ಯಾಂಕ್ ಅಥವಾ UPI ವರ್ಗಾವಣೆ + ಉಚಿತ ಮೌಲ್ಯಮಾಪನ ಪ್ರಮಾಣಪತ್ರ.', them:'ನಗದು, ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ, ಇನ್‌ವಾಯ್ಸ್ ಇಲ್ಲ.' },
      { k:'ಸ್ವೀಕರಿಸುವ ಆಭರಣಗಳು',  us:'ಎಲ್ಲಾ ಆಭರಣಗಳೂ ಸ್ವೀಕಾರ, ಮುರಿದ ಅಥವಾ ಹಳೆಯ, BIS ಹಾಲ್‌ಮಾರ್ಕ್ ಇರಲಿ ಇಲ್ಲದಿರಲಿ. ಶುದ್ಧತೆಯ ವೈಜ್ಞಾನಿಕ ಪರಿಶೀಲನೆ.', them:'ಹಾಲ್‌ಮಾರ್ಕ್ ಇಲ್ಲದ ಅಥವಾ ಬೇರೆ ಬ್ರ್ಯಾಂಡ್‌ನ ಆಭರಣಗಳನ್ನು ತಿರಸ್ಕರಿಸುತ್ತಾರೆ.' },
    ],

    proc_title: 'Carat Money ಪ್ರಕ್ರಿಯೆ, 4 ಸುಲಭ ಹಂತಗಳಲ್ಲಿ', proc_sub: 'ಪ್ರತಿ ಹಂತವೂ ಪಾರದರ್ಶಕ, ಸುಮಾರು 15 ನಿಮಿಷಗಳಲ್ಲಿ ಪೂರ್ಣ.',
    proc_steps: [
      { t:'Carat Money ಕೇಂದ್ರಕ್ಕೆ ಬನ್ನಿ ಅಥವಾ ಮನೆ ಬಾಗಿಲಿಗೆ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ', d:'ಖಾರ್‌ಘರ್‌ನಲ್ಲಿರುವ ನಮ್ಮ ಕೇಂದ್ರಕ್ಕೆ ಬನ್ನಿ, ಅಥವಾ ನಿಮಗೆ ಅನುಕೂಲವಾದ ಸಮಯಕ್ಕೆ ನಾವೇ ನಿಮ್ಮ ಮನೆಗೆ ಬರುತ್ತೇವೆ.' },
      { t:'ಸುಧಾರಿತ ಯಂತ್ರಗಳಿಂದ ಚಿನ್ನದ ಪರೀಕ್ಷೆ', d:'ನಿಮ್ಮ ಮುಂದೆಯೇ XRF ಶುದ್ಧತೆ ಪರೀಕ್ಷೆ ಮತ್ತು ನಿಖರ ತೂಕ.' },
      { t:'ಮಾರಾಟಕ್ಕೆ ಮುನ್ನ ಶುದ್ಧತೆ, ತೂಕ ಮತ್ತು ಲೈವ್ ಬೆಲೆ ತೋರಿಸಲಾಗುತ್ತದೆ', d:'ಮಾರಾಟದ ನಿರ್ಧಾರಕ್ಕೆ ಮುನ್ನ ಪ್ರತಿಯೊಂದು ಅಂಕಿಯನ್ನೂ ನೀವು ನೋಡುತ್ತೀರಿ.' },
      { t:'ಯಾವುದೇ ವಿಳಂಬವಿಲ್ಲದೆ ತಕ್ಷಣ ಪಾವತಿ', d:'ಆಫರ್ ಒಪ್ಪಿದ ಕ್ಷಣವೇ ಬ್ಯಾಂಕ್ ಅಥವಾ UPI ವರ್ಗಾವಣೆ.' },
    ],
    proc_cta: 'ಉಚಿತ ಅಂದಾಜು ಪಡೆಯಿರಿ',

    rev_title: 'ಸಾವಿರಾರು ಜನರು Carat Money ಅನ್ನು ಏಕೆ ನಂಬುತ್ತಾರೆ', rev_sub: 'ನವಿ ಮುಂಬೈನ ಮಾರಾಟಗಾರರು ನಮ್ಮ ಬಗ್ಗೆ ಏನು ಹೇಳುತ್ತಾರೆ.', rev_sample: 'ಮಾದರಿ ವಿಮರ್ಶೆಗಳು',
    review_quotes: [
      'ಅವರು XRF ಪರದೆಯನ್ನು ನನ್ನತ್ತ ತಿರುಗಿಸಿದರು, ಶುದ್ಧತೆಯ ರೀಡಿಂಗ್ ಅನ್ನು ನಾನೇ ನೋಡಿದೆ. ಯಾವುದೇ ಊಹೆ ಇಲ್ಲ.',
      'ದರ ಅವರ ವೆಬ್‌ಸೈಟ್‌ನ ಲೈವ್ ಬೆಲೆಗೆ ಹೊಂದಿಕೆಯಾಯಿತು, ನಾನು ಹೊರಡುವ ಮೊದಲೇ ಹಣ UPI ಗೆ ಬಂತು.',
      'ನನ್ನ ಹಳೆಯ ಸರ ಮುರಿದಿತ್ತು, ಹಾಲ್‌ಮಾರ್ಕ್ ಕೂಡ ಇರಲಿಲ್ಲ. ಆದರೂ ಸರಿಯಾಗಿ ಪರೀಕ್ಷಿಸಿ ನ್ಯಾಯಯುತ ಬೆಲೆ ನೀಡಿದರು.',
      'ಒಪ್ಪಿದ ಸಮಯಕ್ಕೇ ಮನೆಗೆ ಬಂದರು, ಪ್ರತಿ ಆಭರಣಕ್ಕೂ ಉಚಿತ ಮೌಲ್ಯಮಾಪನ ಪ್ರಮಾಣಪತ್ರ ಕೊಟ್ಟರು.',
      'ನನ್ನ ಮುಂದೆಯೇ ಕೊನೆಯ ಮಿಲಿಗ್ರಾಂವರೆಗೆ ತೂಕ ಮಾಡಿದರು. ಎಲ್ಲಿಯೂ ಮರೆಮಾಚಿದ ಕಡಿತವಿಲ್ಲ.',
    ],
    prev: 'ಹಿಂದಿನ ವಿಮರ್ಶೆಗಳು', next: 'ಮುಂದಿನ ವಿಮರ್ಶೆಗಳು', stars: '5 ರಲ್ಲಿ 5 ನಕ್ಷತ್ರಗಳು',

    faq_title: 'ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು', faq_sub: 'ಚಿನ್ನ ಮಾರುವ ಮೊದಲು ತಿಳಿಯಬೇಕಾದ ಎಲ್ಲವೂ.',
    faq_panel_title: 'ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?', faq_panel_sub: 'ಇವುಗಳಲ್ಲಿ ಯಾವುದರ ಮೂಲಕವಾದರೂ ಸಂಪರ್ಕಿಸಿ, ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 9 ರಿಂದ ರಾತ್ರಿ 9 ರವರೆಗೆ.', email: 'ಇಮೇಲ್',
    faqs: [
      { q:'ನನ್ನ ಚಿನ್ನದ ಬೆಲೆಯನ್ನು ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತದೆ?', a:'ನಾವು ನಿಮ್ಮ ಚಿನ್ನವನ್ನು ತೂಕ ಮಾಡಿ, XRF ಯಂತ್ರದಲ್ಲಿ ಶುದ್ಧತೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ, ಶುದ್ಧ ಚಿನ್ನದ ಪ್ರಮಾಣವನ್ನು ಈ ಪುಟದಲ್ಲಿ ತೋರಿಸಿರುವ ಲೈವ್ ದರದಿಂದ ಗುಣಿಸುತ್ತೇವೆ. ನಿರ್ಧರಿಸುವ ಮೊದಲು ಪ್ರತಿಯೊಂದು ಅಂಕಿಯನ್ನೂ ನೀವು ನೋಡುತ್ತೀರಿ.' },
      { q:'ಪರೀಕ್ಷೆಯ ವೇಳೆ ನನ್ನ ಆಭರಣವನ್ನು ಕರಗಿಸುತ್ತೀರಾ ಅಥವಾ ಹಾನಿ ಮಾಡುತ್ತೀರಾ?', a:'ಇಲ್ಲ. XRF ಪರೀಕ್ಷೆಯಿಂದ ಯಾವುದೇ ಹಾನಿಯಾಗುವುದಿಲ್ಲ, ಪರೀಕ್ಷೆಯ ವೇಳೆ ನಿಮ್ಮ ಆಭರಣ ಇದ್ದ ಹಾಗೆಯೇ ಇರುತ್ತದೆ.' },
      { q:'ನೀವು ಮನೆಯಿಂದ ಪಿಕಪ್ ಮಾಡುತ್ತೀರಾ?', a:'ಹೌದು, ಬೆಂಗಳೂರು ಮತ್ತು ಮುಂಬೈನಲ್ಲಿ. ನಮ್ಮ ಸಿಬ್ಬಂದಿ ನಿಮಗೆ ಅನುಕೂಲವಾದ ಸಮಯಕ್ಕೆ ಬಂದು, ನಿಮ್ಮ ಮುಂದೆಯೇ ಚಿನ್ನವನ್ನು ಪರೀಕ್ಷಿಸಿ, ಅಲ್ಲೇ ಖಚಿತ ಆಫರ್ ನೀಡುತ್ತಾರೆ.' },
      { q:'ಅಂದಾಜು ಉಚಿತವೇ?', a:'ಹೌದು. ಅಂದಾಜು ಉಚಿತ, ಯಾವುದೇ ಬದ್ಧತೆ ಇಲ್ಲ. ಆಫರ್ ಇಷ್ಟವಾದರೆ ಮಾತ್ರ ಮಾರಾಟ ಮಾಡಿ.' },
      { q:'ಯಾವುದಾದರೂ ಕಡಿತ ಇದೆಯೇ?', a:'ಕಲ್ಲುಗಳ ತೂಕ ಮಾತ್ರ, ಅದನ್ನು ನಾವು ಅಳೆದು ನಿಮಗೆ ತೋರಿಸುತ್ತೇವೆ. ಯಾವುದೇ ಹೆಚ್ಚುವರಿ "ವೇಸ್ಟೇಜ್" ಕಡಿತ ಅಥವಾ ಮರೆಮಾಚಿದ ಶುಲ್ಕವಿಲ್ಲ.' },
      { q:'ನನ್ನ ಆಭರಣ ಮುರಿದಿದ್ದರೆ ಅಥವಾ ಹಾಲ್‌ಮಾರ್ಕ್ ಇಲ್ಲದಿದ್ದರೆ?', a:'ಮುರಿದ, ಹಳೆಯ ಮತ್ತು ಹಾಲ್‌ಮಾರ್ಕ್ ಇಲ್ಲದ ಆಭರಣಗಳನ್ನೂ ಸೇರಿ ಎಲ್ಲಾ ಚಿನ್ನಾಭರಣಗಳನ್ನು ನಾವು ಸ್ವೀಕರಿಸುತ್ತೇವೆ. XRF ಪರೀಕ್ಷೆ ನಿಜವಾದ ಶುದ್ಧತೆಯನ್ನು ತಿಳಿಸುತ್ತದೆ, ಹಾಗಾಗಿ ನಿಜವಾದ ಚಿನ್ನದ ಪ್ರಮಾಣಕ್ಕೆ ನಿಮಗೆ ಹಣ ಸಿಗುತ್ತದೆ.' },
      { q:'ನನಗೆ ಪಾವತಿ ಹೇಗೆ ಸಿಗುತ್ತದೆ?', a:'ಆಫರ್ ಒಪ್ಪಿದ ತಕ್ಷಣ, ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ ಅಥವಾ UPI ಮೂಲಕ. ನಾವು ಎಂದಿಗೂ ನಗದು ಪಾವತಿಸುವುದಿಲ್ಲ.' },
      { q:'ನನಗೆ ಯಾವುದಾದರೂ ದಾಖಲೆಗಳು ಸಿಗುತ್ತವೆಯೇ?', a:'ಹೌದು. ಮಾರಾಟದ ಇನ್‌ವಾಯ್ಸ್ ಮತ್ತು ಉಚಿತ, ವಿವರವಾದ ಮೌಲ್ಯಮಾಪನ ಪ್ರಮಾಣಪತ್ರ ನಿಮಗೆ ಸಿಗುತ್ತದೆ.' },
      { q:'ಪರೀಕ್ಷೆಯ ನಂತರ ಮಾರಾಟ ಮಾಡದೇ ಹೋಗಬಹುದೇ?', a:'ಹೌದು, ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲದೆ. ಅಂತಿಮ ಆಫರ್ ಒಪ್ಪುವವರೆಗೆ ಮಾರಾಟ ಮಾಡಲು ನೀವು ಬದ್ಧರಲ್ಲ.' },
      { q:'ಇದಕ್ಕೆ ಎಷ್ಟು ಸಮಯ ಬೇಕು?', a:'ಸುಮಾರು 15 ನಿಮಿಷಗಳು. ಪರೀಕ್ಷೆ, ಆಫರ್ ಮತ್ತು ಪಾವತಿ ಎಲ್ಲವೂ ಒಂದೇ ಭೇಟಿಯಲ್ಲಿ ಮುಗಿಯುತ್ತದೆ.' },
      { q:'ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?', a:'KYC ಗಾಗಿ ನಿಮ್ಮ ಆಧಾರ್ ಮತ್ತು PAN.' },
      { q:'ಬ್ಯಾಂಕ್ ಅಥವಾ NBFC ಯಲ್ಲಿ ಅಡವಿಟ್ಟ ಚಿನ್ನವನ್ನು ಖರೀದಿಸುತ್ತೀರಾ?', a:'ಹೌದು. ಬ್ಯಾಂಕ್ ಅಥವಾ NBFC ಯಲ್ಲಿ ಅಡವಿಟ್ಟ ಚಿನ್ನವನ್ನು ಬಿಡಿಸಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ ಮತ್ತು ಅದನ್ನು ಇಂದಿನ ದರದಲ್ಲಿ ಖರೀದಿಸುತ್ತೇವೆ. ವಿವರಗಳಿಗೆ ನಮಗೆ WhatsApp ಮಾಡಿ.' },
    ],

    visit_label: 'ನಮ್ಮ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ', visit_title: 'Carat Money, ಖಾರ್‌ಘರ್', visit_hours: 'ಪ್ರತಿದಿನ, ಬೆಳಿಗ್ಗೆ 9 ರಿಂದ ರಾತ್ರಿ 9 ರವರೆಗೆ', visit_dir: 'ದಾರಿ ತೋರಿಸಿ',

    blog_title: 'ಚಿನ್ನದ ಒಳನೋಟಗಳು', blog_sub: 'ಚಿನ್ನ ಮಾರುವ ಮೊದಲು ನೇರ ಉತ್ತರಗಳು.', blog_all: 'ಎಲ್ಲಾ ಲೇಖನಗಳನ್ನು ನೋಡಿ', blog_read: 'ಓದಿ', blog_note: 'ಲೇಖನಗಳು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿವೆ.',

    app_h: 'Carat Money, ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಜೇಬಿನಲ್ಲಿ.',
    app_body: 'ಲೈವ್ ಚಿನ್ನದ ದರ ನೋಡಿ, ನಿಮ್ಮ ಆಭರಣದ ಮೌಲ್ಯ ತಿಳಿಯಿರಿ ಮತ್ತು ಮನೆಯಿಂದ ಪಿಕಪ್ ಬುಕ್ ಮಾಡಿ — ಎಲ್ಲವೂ ಒಂದೇ ಆ್ಯಪ್‌ನಲ್ಲಿ. ಶೀಘ್ರದಲ್ಲೇ iOS ಮತ್ತು Android ನಲ್ಲಿ.',
    app_soon: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ', app_hint: 'ಬಿಡುಗಡೆಯ ಸೂಚನೆಯನ್ನು WhatsApp ನಲ್ಲಿ ಪಡೆಯಲು ಯಾವುದೇ ಬಟನ್ ಒತ್ತಿ.',
    app_chip1: 'XRF ಪರೀಕ್ಷಿತ ಶುದ್ಧತೆ', app_chip2: 'ತಕ್ಷಣ UPI ಪಾವತಿ',

    partner_text: 'ನೀವು ಶಿಫಾರಸು ಮಾಡುವ ಪ್ರತಿ ಗ್ರಾಹಕರಿಂದಲೂ ಗಳಿಸಿ. ನಾವು ಅವರ ಚಿನ್ನ ಖರೀದಿಸುತ್ತೇವೆ, ನಿಮಗೆ ಕಮಿಷನ್ ಸಿಗುತ್ತದೆ.', partner_cta: 'ನಮ್ಮ ಪಾರ್ಟ್ನರ್ ಪ್ರೋಗ್ರಾಂಗೆ ಸೇರಿ →',

    f_onpage: 'ಈ ಪುಟದಲ್ಲಿ', f_explore: 'ಇನ್ನಷ್ಟು', f_contact: 'ಸಂಪರ್ಕ',
    f_live: 'ಲೈವ್ ದರ', f_calc: 'ಮೌಲ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್', f_why: 'ನಾವೇ ಏಕೆ', f_reviews: 'ವಿಮರ್ಶೆಗಳು', f_faqs: 'ಪ್ರಶ್ನೋತ್ತರ', f_visit: 'ನಮ್ಮ ಕೇಂದ್ರ',
    f_sell: 'ಚಿನ್ನ ಮಾರಿ', f_buy: 'ಚಿನ್ನದ ನಾಣ್ಯಗಳನ್ನು ಖರೀದಿಸಿ', f_margin: 'ಮಾರ್ಜಿನ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್', f_blog: 'ಬ್ಲಾಗ್', f_partner: 'ಪಾರ್ಟ್ನರ್ ಪ್ರೋಗ್ರಾಂ',
    f_rights: 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
    f_legal: 'ಈ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ತೋರಿಸಿರುವ ಚಿನ್ನದ ದರಗಳು ಸೂಚಕ ಮಾತ್ರ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯೊಂದಿಗೆ ಬದಲಾಗುತ್ತವೆ; ಅಂತಿಮ ಬೆಲೆಯನ್ನು ನಿಮ್ಮ ಮುಂದೆಯೇ ಚಿನ್ನವನ್ನು ಪರೀಕ್ಷಿಸಿದ ನಂತರ ದೃಢಪಡಿಸಲಾಗುತ್ತದೆ. ಈ ವೆಬ್‌ಸೈಟ್‌ನ ಬಳಕೆ Carat Money ಯ ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತಾ ನೀತಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸುವ ಮೂಲಕ, ನಿಮ್ಮ ವಿಚಾರಣೆಯ ಕುರಿತು Carat Money ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಮತ್ತು ಅದೇ ಉದ್ದೇಶಕ್ಕಾಗಿ ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಬಳಸಲು ನೀವು ಸಮ್ಮತಿಸುತ್ತೀರಿ.',
    wa_float: 'WhatsApp ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ',
  },
};

const LangCtx = createContext({ lang:'en', setLang:() => {}, t:k => (STR.en[k] !== undefined ? STR.en[k] : k) });
const useT  = () => useContext(LangCtx);
const makeT = lang => key => {
  const table = STR[lang] || STR.en;
  if (table[key] !== undefined) return table[key];
  if (STR.en[key] !== undefined) return STR.en[key];
  return key;
};
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));

function useLangState() {
  const [lang, setLangRaw] = useState(() => {
    try { const v = localStorage.getItem('cm_lang'); return LANG_CODES.includes(v) ? v : 'en'; } catch { return 'en'; }
  });
  const setLang = useCallback(v => {
    if (!LANG_CODES.includes(v)) return;
    setLangRaw(v);
    try { localStorage.setItem('cm_lang', v); } catch { /* private mode */ }
    track('language_change', { language:v });
  }, []);
  return [lang, setLang];
}

// ─── Global CSS (responsive layout lives here; colours stay inline) ───────────
const GLOBAL_CSS = `
  :root { --f-serif:'Fraunces', Georgia, serif; --f-sans:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; --f-mono:'JetBrains Mono', 'Courier New', monospace; }
  :root[lang="hi"] { --f-serif:'Fraunces', 'Noto Sans Devanagari', Georgia, serif; --f-sans:'Inter', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif; --f-mono:'JetBrains Mono', 'Noto Sans Devanagari', monospace; }
  :root[lang="kn"] { --f-serif:'Fraunces', 'Noto Sans Kannada', Georgia, serif; --f-sans:'Inter', 'Noto Sans Kannada', -apple-system, BlinkMacSystemFont, sans-serif; --f-mono:'JetBrains Mono', 'Noto Sans Kannada', monospace; }
  :root[lang="hi"] body *, :root[lang="kn"] body * { letter-spacing:0!important; }
  :root[lang="hi"] h1, :root[lang="hi"] h2, :root[lang="hi"] h3, :root[lang="kn"] h1, :root[lang="kn"] h2, :root[lang="kn"] h3 { line-height:1.35!important; }

  * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
  html { scroll-behavior:smooth; -webkit-text-size-adjust:100%; }
  body { margin:0; background:${C.paper}; }
  img { max-width:100%; }
  [id] { scroll-margin-top:72px; }
  @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes fadeSlide  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stickyDrop { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stickySwap { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp    { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes glowPulse  { 0%{box-shadow:0 0 0 0 rgba(224,183,101,.7)} 50%{box-shadow:0 0 0 14px rgba(224,183,101,0)} 100%{box-shadow:0 0 0 0 rgba(224,183,101,0)} }
  @keyframes floatY     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  input:focus,textarea:focus,select:focus { outline:none; border-color:${C.gold}!important; box-shadow:0 0 0 3px rgba(184,136,58,.14)!important; }
  a:focus-visible, button:focus-visible { outline:2px solid ${C.gold2}; outline-offset:2px; }
  button { font-family:inherit; }
  button:active:not(:disabled) { transform:translateY(1px); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior:auto; }
    *, *::before, *::after { animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; }
  }

  /* show / hide by screen size */
  @media (max-width:767.98px)  { .hide-m { display:none!important; } }
  @media (min-width:768px)     { .hide-d { display:none!important; } }
  @media (max-width:1023.98px) { .hide-lt-lg { display:none!important; } }
  @media (min-width:1024px)    { .hide-lg { display:none!important; } }

  /* top bar */
  @media (max-width:599.98px)  { .tb-name { display:none; } }
  @media (max-width:380px)     { .tb-live { display:none; } }
  @media (max-width:1279.98px) { .tb-links { display:none!important; } }
  @media (min-width:1280px)    { .tb-menu-btn { display:none!important; } }
  .tb-navlink { background:none; border:none; color:rgba(241,215,141,.82)!important; font-family:var(--f-sans); font-size:13.5px; font-weight:500; padding:8px 9px; border-radius:4px; cursor:pointer; white-space:nowrap; text-decoration:none; }
  .tb-navlink:hover { color:${C.gold3}!important; background:rgba(224,183,101,.08); }

  /* layout */
  .cm-wrap { width:100%; max-width:1264px; margin:0 auto; padding:0 16px; }
  @media (min-width:768px) { .cm-wrap { padding:0 32px; } }
  .cm-sec { padding:52px 0; }
  @media (min-width:1024px) { .cm-sec { padding:80px 0; } }
  .cm-h2 { font-family:var(--f-serif); font-weight:350; font-size:clamp(28px, 4vw, 42px); line-height:1.12; letter-spacing:-0.02em; margin:0; }

  /* hero */
  .hero { padding:calc(56px + 28px) 0 40px; background:radial-gradient(1200px 520px at 78% 0%, rgba(224,183,101,.13), transparent 60%), ${C.paper}; }
  @media (min-width:1024px) { .hero { padding:calc(56px + 56px) 0 64px; } }
  .hero-grid { display:grid; grid-template-columns:1fr; gap:20px; align-items:center; }
  @media (min-width:1024px) { .hero-grid { grid-template-columns:1.25fr .75fr; gap:56px; } }
  .hero-visual { order:-1; display:flex; flex-direction:column; align-items:center; }
  @media (min-width:1024px) { .hero-visual { order:0; } }
  .hero-mark-svg { width:104px; }
  @media (min-width:768px)  { .hero-mark-svg { width:140px; } }
  @media (min-width:1024px) { .hero-mark-svg { width:220px; } }
  .hero-text { text-align:center; }
  .hero-eyebrow { justify-content:center; }
  .hero-h1 { font-family:var(--f-serif); font-weight:350; font-size:clamp(34px, 5.4vw, 62px); line-height:1.04; letter-spacing:-0.025em; color:${C.ink}; margin:0 0 14px; }
  .hero-ctas { display:flex; flex-direction:column; gap:10px; margin:24px 0 18px; }
  @media (min-width:600px)  { .hero-ctas { flex-direction:row; justify-content:center; } }
  @media (min-width:1024px) { .hero-text { text-align:left; } .hero-ctas { justify-content:flex-start; } .hero-eyebrow { justify-content:flex-start; } .hero-eyebrow .ln-r { display:none; } }

  /* hero tiles: compact strip on phones, cards from tablet up */
  .tiles { display:grid; grid-template-columns:repeat(3,1fr); margin-top:28px; background:${C.white}; border:1px solid rgba(26,20,38,.1); border-radius:8px; box-shadow:0 2px 12px rgba(22,18,31,.06); }
  .tile { display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px; padding:14px 6px; }
  .tile + .tile { border-left:1px solid rgba(26,20,38,.08); }
  .tile-t { font-size:12.5px; font-weight:600; line-height:1.3; color:${C.ink}; }
  .tile-d { display:none; }
  .tile-ic { width:40px; height:40px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:${C.paper2}; color:${C.plum}; border:1px solid rgba(184,136,58,.25); }
  @media (min-width:768px) {
    .tiles { gap:20px; background:transparent; border:none; box-shadow:none; margin-top:48px; }
    .tile { align-items:flex-start; text-align:left; gap:14px; padding:22px; background:${C.white}; border:1px solid rgba(26,20,38,.1); border-radius:8px; box-shadow:0 2px 12px rgba(22,18,31,.06); }
    .tile + .tile { border-left:1px solid rgba(26,20,38,.1); }
    .tile-t { font-family:var(--f-serif); font-weight:350; font-size:20px; letter-spacing:-0.01em; margin-bottom:6px; }
    .tile-d { display:block; font-size:14px; color:${C.mute}; line-height:1.55; }
    .tile-ic { width:48px; height:48px; }
  }
  @media (min-width:1024px) { .tile { flex-direction:row; gap:16px; padding:24px; } }

  /* rate + calculator + get in touch */
  .rc-grid { display:grid; gap:16px; }
  @media (min-width:1024px) { .rc-grid { grid-template-columns:5fr 7fr; gap:24px; } }
  .karats { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
  .git { display:grid; background:${C.plum}; border:1px solid rgba(224,183,101,.2); border-radius:8px; overflow:hidden; margin-top:16px; box-shadow:0 8px 32px rgba(43,20,80,.18); }
  @media (min-width:1024px) { .git { grid-template-columns:300px 1fr; margin-top:24px; } }
  .git-img { position:relative; min-height:100%; }
  .git-body { padding:24px 20px; }
  @media (min-width:768px) { .git-body { padding:32px; } }
  .git-fields { display:grid; gap:14px; grid-template-columns:1fr; }
  @media (min-width:768px)  { .git-fields { grid-template-columns:1fr 1fr; } .git-fields .git-pref { grid-column:1 / -1; } }
  @media (min-width:1024px) { .git-fields { grid-template-columns:1fr 1fr 1.15fr; } .git-fields .git-pref { grid-column:auto; } }
  .git-actions { display:grid; gap:10px; grid-template-columns:1fr; margin-top:18px; }
  @media (min-width:768px) { .git-actions { grid-template-columns:auto auto 1fr; align-items:center; gap:12px; } }
  .seg { display:grid; grid-template-columns:1fr 1fr; gap:6px; }

  /* process: vertical timeline on phones, a row with a gold line on desktop */
  .proc { display:grid; }
  .proc-step { display:grid; grid-template-columns:44px 1fr; gap:16px; position:relative; padding-bottom:28px; }
  .proc-step:last-child { padding-bottom:0; }
  .proc-step:not(:last-child)::after { content:''; position:absolute; left:21.5px; top:50px; bottom:4px; width:1px; background:rgba(184,136,58,.45); }
  .proc-num { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${C.plum}; color:${C.gold3}; font-family:var(--f-serif); font-size:20px; border:1px solid rgba(224,183,101,.35); position:relative; z-index:1; }
  @media (min-width:1024px) {
    .proc { grid-template-columns:repeat(4,1fr); gap:28px; }
    .proc-step { grid-template-columns:1fr; justify-items:center; align-content:start; text-align:center; padding-bottom:0; }
    .proc-step:not(:last-child)::after { left:calc(50% + 30px); right:calc(-50% + 2px); top:22px; bottom:auto; width:auto; height:1px; }
  }

  /* reviews carousel */
  .rv-track { display:flex; gap:16px; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none; -webkit-overflow-scrolling:touch; padding:4px 2px 14px; }
  .rv-track::-webkit-scrollbar { display:none; }
  .rv-card { flex:0 0 86%; scroll-snap-align:start; }
  @media (min-width:768px)  { .rv-card { flex-basis:calc((100% - 16px) / 2); } }
  @media (min-width:1024px) { .rv-card { flex-basis:calc((100% - 32px) / 3); } }

  /* FAQ */
  .faq-grid { display:grid; gap:28px; }
  .faq-panel { order:2; }
  @media (min-width:1024px) { .faq-grid { grid-template-columns:5fr 7fr; gap:48px; align-items:start; } .faq-panel { order:0; position:sticky; top:84px; } }

  /* visit us */
  .visit { display:grid; background:${C.white}; border:1px solid rgba(184,136,58,.35); border-radius:8px; overflow:hidden; box-shadow:0 2px 12px rgba(22,18,31,.06); }
  .visit-map iframe { display:block; width:100%; height:220px; border:0; }
  @media (min-width:1024px) { .visit { grid-template-columns:3fr 2fr; } .visit-map iframe { height:100%; min-height:380px; } }

  /* blog cards */
  .blog-grid { display:grid; gap:16px; grid-template-columns:1fr; }
  @media (min-width:768px)  { .blog-grid { grid-template-columns:repeat(2,1fr); gap:20px; } .blog-grid.teaser { grid-template-columns:repeat(3,1fr); } }
  @media (min-width:1024px) { .blog-grid { grid-template-columns:repeat(3,1fr); gap:24px; } }
  .blog-card { transition:transform .2s, box-shadow .2s; }
  .blog-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,18,31,.12)!important; }

  /* app */
  .app-grid { display:grid; gap:40px; align-items:center; }
  .app-text { text-align:center; }
  .app-btns { display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:420px; margin:24px auto 0; }
  @media (min-width:1024px) { .app-grid { grid-template-columns:1fr 1fr; gap:56px; } .app-text { text-align:left; } .app-btns { margin-left:0; } .app-body { margin-left:0!important; } }
  .app-phone { width:236px; }
  @media (min-width:1024px) { .app-phone { width:268px; } }

  /* footer */
  .ft-grid { display:grid; gap:32px 24px; grid-template-columns:1fr 1fr; }
  .ft-span { grid-column:1 / -1; }
  @media (min-width:1024px) { .ft-grid { grid-template-columns:1.5fr 1fr 1fr 1.4fr; gap:40px; } .ft-span { grid-column:auto; } }
  .ft-link { display:block; color:rgba(241,215,141,.75)!important; text-decoration:none; font-size:14px; line-height:1.4; background:none; border:none; padding:5px 0; cursor:pointer; text-align:left; font-family:var(--f-sans); }
  .ft-link:hover { color:${C.gold3}!important; }
  .ft-pad { padding-bottom:96px; }
  @media (min-width:768px) { .ft-pad { padding-bottom:28px; } }
`;

// ─── Shared input style ───────────────────────────────────────────────────────
const INP = {
  width:'100%', padding:'13px 14px', fontSize:'16px', lineHeight:1.4,
  border:`1.5px solid rgba(26,20,38,.18)`, borderRadius:'4px',
  background:C.white, color:C.ink, fontWeight:400,
  outline:'none', transition:'border-color .15s,box-shadow .15s',
  WebkitAppearance:'none', fontFamily:SANS, boxSizing:'border-box',
};
const LBL = { fontSize:'14px', fontWeight:600, color:C.ink2, display:'block', marginBottom:'7px', fontFamily:SANS };

// ─── Back Button ──────────────────────────────────────────────────────────────
function BackBtn({ navigate }) {
  return (
    <Link to="/" navigate={navigate} style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:C.gold, fontFamily:MONO, fontSize:'12px', fontWeight:500, padding:'18px 0 8px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      <ArrowLeft size={14} strokeWidth={2}/> Home
    </Link>
  );
}
// ─── Eyebrow ──────────────────────────────────────────────────────────────────
const Eyebrow = ({ children, light }) => (
  <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color: light ? `rgba(241,215,141,0.6)` : C.mute, marginBottom:'10px' }}>{children}</div>
);

// ─── Primary CTA button ───────────────────────────────────────────────────────
const BtnPrimary = ({ onClick, disabled, children, style={} }) => (
  <button onClick={onClick} disabled={disabled} style={{ width:'100%', padding:'15px 20px', background: disabled ? C.paper2 : C.gold2, color: disabled ? C.mute : C.plum, border:'none', borderRadius:'4px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor: disabled ? 'not-allowed' : 'pointer', transition:'opacity .2s,transform .1s', letterSpacing:'0.01em', ...style }}>{children}</button>
);

// ─── WhatsApp CTA button ──────────────────────────────────────────────────────
const BtnWhatsApp = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{ width:'100%', padding:'15px 20px', background:C.green, color:C.white, border:'none', borderRadius:'999px', fontSize:'16px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 6px 20px rgba(37,211,102,.32)', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', transition:'opacity .2s' }}>{children}</button>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = React.forwardRef(({ children, dark, style={}, ...rest }, ref) => (
  <div ref={ref} {...rest} style={{ background: dark ? C.plum : C.white, borderRadius:'8px', border: dark ? `1px solid rgba(224,183,101,.2)` : `1px solid rgba(26,20,38,.1)`, padding:'24px', boxShadow: dark ? '0 8px 32px rgba(43,20,80,.18)' : '0 2px 12px rgba(22,18,31,.06)', ...style }}>{children}</div>
));

// ─── Page Header ─────────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div style={{ textAlign:'center', padding:'24px 0 16px' }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>
        <CaratMark size={64} color={C.gold2}/>
      </div>
      <div style={{ fontFamily:SERIF, fontSize:'28px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1.05 }}>
        Carat <span style={{ fontStyle:'italic', color:C.plum }}>Money</span>
      </div>
    </div>
  );
}

// ─── Crawlable internal link (real <a href>, in-app navigation on click) ─────
function Link({ to, navigate, children, style, ...rest }) {
  const onClick = e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // allow new-tab clicks
    e.preventDefault();
    e.stopPropagation();
    navigate(to);
  };
  return (
    <a href={to} onClick={onClick} style={{ color:'inherit', textDecoration:'none', display:'block', ...style }} {...rest}>
      {children}
    </a>
  );
}

const WhatsAppGlyph = ({ size = 16, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const HomeIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/><path d="M10 21v-6h4v6"/>
  </svg>
);

const SOCIALS = [
            {
              href: 'https://www.instagram.com/carat_money',
              label: 'Instagram',
              path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
            },
            {
              href: 'https://x.com/carat_money',
              label: 'X',
              path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
            },
            {
              href: 'https://www.youtube.com/@carat_money',
              label: 'YouTube',
              path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
            },
];

// ─── Call button → picker with both numbers ──────────────────────────────────
// variant: 'outline' (on plum), 'gold' (filled). full = stretch to container.
function CallPicker({ variant = 'outline', label, full = false, align = 'right', source = 'topbar' }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc   = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const big  = variant !== 'outline' || full;
  const look = variant === 'gold'
    ? { background:C.gold2, color:C.plum, border:`1px solid ${C.gold2}` }
    : { background:'transparent', color:C.white, border:'1px solid rgba(255,255,255,.3)' };
  return (
    <div ref={ref} style={{ position:'relative', width: full ? '100%' : 'auto' }}>
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-haspopup="menu"
        style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'7px', width: full ? '100%' : 'auto', padding: big ? '14px 20px' : '7px 12px', borderRadius: big ? '4px' : '999px', fontFamily:SANS, fontSize: big ? '15px' : '13px', fontWeight:600, whiteSpace:'nowrap', cursor:'pointer', ...look }}>
        <Phone size={big ? 16 : 14}/> {label || t('call')}
      </button>
      {open && (
        <div role="menu" style={{ position:'absolute', top:'calc(100% + 8px)', [align]:0, minWidth:'210px', width: full ? '100%' : 'auto', zIndex:120, background:C.white, borderRadius:'8px', border:'1px solid rgba(26,20,38,.1)', boxShadow:'0 8px 24px rgba(22,18,31,.18)', overflow:'hidden', animation:'fadeSlide .2s ease' }}>
          {CALL_NUMBERS.map((n, i) => (
            <a key={n.tel} href={`tel:${n.tel}`} role="menuitem" onClick={() => { track('call_click', { number:n.tel, source }); setOpen(false); }}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'13px 16px', color:C.ink, textDecoration:'none', fontFamily:SANS, fontSize:'14px', fontWeight:600, borderTop: i === 0 ? 'none' : '1px solid rgba(26,20,38,.08)' }}>
              <Phone size={14} color={C.gold}/> {n.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EN | हिं | ಕ switch ──────────────────────────────────────────────────────
// Each label uses its own script's font, so "हिं" and "ಕ" render properly on every page.
const LANG_FONT = { en: MONO, hi: "'Noto Sans Devanagari', sans-serif", kn: "'Noto Sans Kannada', sans-serif" };
function LangSwitch({ size = 'sm' }) {
  const { lang, setLang } = useT();
  return (
    <div role="group" aria-label="Language" style={{ display:'inline-flex', padding:'3px', borderRadius:'999px', border:'1px solid rgba(224,183,101,.35)', background:'rgba(0,0,0,.18)' }}>
      {LANGS.map(l => {
        const on = l.code === lang;
        return (
          <button key={l.code} type="button" lang={l.code} onClick={() => setLang(l.code)} aria-pressed={on} aria-label={l.name}
            style={{ minWidth:'34px', padding: size === 'lg' ? '8px 16px' : '5px 10px', borderRadius:'999px', border:'none', cursor:'pointer', background: on ? C.gold2 : 'transparent', color: on ? C.plum : 'rgba(241,215,141,.8)', fontFamily: LANG_FONT[l.code], fontSize: l.code === 'en' ? '12px' : '13px', fontWeight:600, lineHeight:1.25 }}>
            {l.short}
          </button>
        );
      })}
    </div>
  );
}

// ─── Top Bar (always visible) ────────────────────────────────────────────────
function TopBar({ spot, navigate, showLang = false }) {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const r24   = spot.display ?? SPOT_FALLBACK;
  const close = () => setMenuOpen(false);
  const go    = id => { close(); goSection(id, navigate); };
  const home  = e => {
    e.preventDefault(); close();
    if (window.location.pathname === '/') window.scrollTo({ top:0, behavior:'smooth' });
    else if (navigate) navigate('/');
    else window.location.href = '/';
  };
  const links = [
    ['calculator', t('nav_calc')],
    ['why',        t('nav_why')],
    ['process',    t('nav_process')],
    ['reviews',    t('nav_reviews')],
    ['faqs',       t('nav_faqs')],
  ];
  useEffect(() => {
    if (!menuOpen) return;
    const esc = e => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [menuOpen]);
  const menuRow = { display:'block', width:'100%', textAlign:'left', padding:'14px 0', background:'none', border:'none', borderBottom:'1px solid rgba(224,183,101,.12)', color:C.gold3, fontFamily:SANS, fontSize:'16px', fontWeight:500, cursor:'pointer', textDecoration:'none' };

  return (
    <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'56px', background:C.plum, borderBottom:'1px solid rgba(224,183,101,.25)', boxShadow:'0 2px 16px rgba(43,20,80,.25)' }}>
      <div className="cm-wrap" style={{ height:'100%', display:'flex', alignItems:'center', gap:'8px' }}>
        <a href="/" onClick={home} aria-label="Carat Money home" style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0, textDecoration:'none' }}>
          <CaratMark size={28} color={C.gold2}/>
          <span className="tb-name" style={{ fontFamily:SERIF, fontSize:'16px', fontWeight:350, color:C.gold2, whiteSpace:'nowrap' }}>
            Carat <span style={{ fontStyle:'italic' }}>Money</span>
          </span>
        </a>
        <button type="button" onClick={() => go('rate')} aria-label={`24K live rate ₹${fmt(r24,0)} per gram`}
          style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'999px', background:'rgba(0,0,0,.22)', border:'1px solid rgba(224,183,101,.2)', fontFamily:MONO, fontSize:'11px', whiteSpace:'nowrap', flexShrink:0, cursor:'pointer' }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:C.green }}/>
          <span style={{ color:'rgba(241,215,141,.7)' }}>24K</span>
          <span className="tb-live" style={{ color:C.gold2 }}>live</span>
          <span style={{ color:C.gold3 }}>₹{fmt(r24,0)}/g</span>
        </button>
        <nav className="tb-links" aria-label="Sections" style={{ display:'flex', alignItems:'center', gap:'2px', marginLeft:'6px' }}>
          {links.map(([id, label]) => <button key={id} type="button" className="tb-navlink" onClick={() => go(id)}>{label}</button>)}
          <Link to="/blog" navigate={navigate} className="tb-navlink" style={{ display:'inline-block' }}>{t('nav_blog')}</Link>
        </nav>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          {showLang && <div className="hide-m"><LangSwitch/></div>}
          <a className="hide-m" href={WA_LINK} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source:'topbar' })}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:C.green, color:C.ink, padding:'7px 12px', borderRadius:'999px', fontFamily:SANS, fontSize:'13px', fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' }}>
            <WhatsAppGlyph size={15} color={C.ink}/> WhatsApp
          </a>
          <CallPicker source="topbar" label={t('call_short')}/>
          <button type="button" className="tb-menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label={t('menu')} aria-expanded={menuOpen}
            style={{ width:'36px', height:'36px', display:'inline-flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'1px solid rgba(255,255,255,.25)', borderRadius:'8px', color:C.gold3, cursor:'pointer', flexShrink:0 }}>
            {menuOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div onClick={close} style={{ position:'fixed', top:'56px', left:0, right:0, bottom:0, background:'rgba(22,18,31,.45)', animation:'fadeIn .2s ease' }}/>
          <div style={{ position:'absolute', top:'56px', left:0, right:0, background:C.plum, borderBottom:'1px solid rgba(224,183,101,.25)', boxShadow:'0 16px 32px rgba(22,18,31,.35)', maxHeight:'calc(100dvh - 56px)', overflowY:'auto', animation:'stickyDrop .2s ease' }}>
            <div className="cm-wrap" style={{ paddingTop:'6px', paddingBottom:'20px' }}>
              {links.map(([id, label]) => <button key={id} type="button" onClick={() => go(id)} style={menuRow}>{label}</button>)}
              <Link to="/blog" navigate={navigate} style={menuRow}>{t('nav_blog')}</Link>
              {showLang && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding:'16px 0' }}>
                  <span style={{ fontFamily:SANS, fontSize:'14px', color:'rgba(241,215,141,.7)' }}>{t('language')}</span>
                  <LangSwitch size="lg"/>
                </div>
              )}
              <a href={WA_LINK} target="_blank" rel="noreferrer" onClick={() => { track('whatsapp_click', { source:'menu' }); close(); }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'8px', padding:'14px', borderRadius:'999px', background:C.green, color:C.ink, fontFamily:SANS, fontWeight:600, fontSize:'15px', textDecoration:'none' }}>
                <WhatsAppGlyph size={18} color={C.ink}/> {t('whatsapp')}
              </a>
              <a href={PARTNER_URL} target="_blank" rel="noreferrer" onClick={close}
                style={{ display:'block', textAlign:'center', marginTop:'16px', fontFamily:SANS, fontSize:'14px', fontWeight:600, color:C.gold2, textDecoration:'none' }}>
                {t('partner_link')} →
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHead({ title, lead, align = 'center', children }) {
  const centre = align === 'center';
  return (
    <div style={{ textAlign:align, maxWidth: centre ? '720px' : 'none', margin: centre ? '0 auto 32px' : '0 0 24px' }}>
      <h2 className="cm-h2" style={{ color:C.ink }}>{title}</h2>
      {lead && <p style={{ fontFamily:SANS, fontSize:'15px', color:C.mute, lineHeight:1.6, margin:'12px 0 0' }}>{lead}</p>}
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  HOMEPAGE SECTIONS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. Hero ─────────────────────────────────────────────────────────────────
function Hero({ navigate }) {
  const { t, lang } = useT();
  const en    = lang === 'en';
  const h     = t('hero_h1');
  const tiles = t('tiles');
  const icons = [<HomeIcon size={20}/>, <Microscope size={20} strokeWidth={1.75}/>, <IndianRupee size={20} strokeWidth={1.75}/>];
  const line  = { height:'1px', width:'32px', background:C.gold, opacity:.5, flexShrink:0 };
  return (
    <section id="top" className="hero">
      <div className="cm-wrap">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="hero-eyebrow" style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
              <span style={line}/>
              <span style={{ fontFamily: en ? MONO : SANS, fontSize: en ? '10px' : '13px', letterSpacing: en ? '0.2em' : 0, textTransform: en ? 'uppercase' : 'none', color:C.gold, fontWeight: en ? 500 : 600 }}>
                {t('hero_eyebrow')}
              </span>
              <span className="ln-r" style={line}/>
            </div>
            <h1 className="hero-h1">{h[0]}<span style={{ fontStyle:'italic', color:C.plum }}>{h[1]}</span>{h[2]}</h1>
            <p style={{ fontFamily:SERIF, fontSize:'clamp(20px, 2.4vw, 26px)', fontWeight:350, color:C.gold, margin:'0 0 16px', lineHeight:1.3 }}>{t('hero_sub')}</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:SANS, fontSize:'14px', fontWeight:600, color:C.ink2, lineHeight:1.45, textAlign:'left' }}>
              <ShieldCheck size={17} color={C.gold} style={{ flexShrink:0 }}/>{t('hero_guarantee')}
            </div>
            <div className="hero-ctas">
              <BtnPrimary onClick={() => openWA(WA_MSG, 'hero')} style={{ width:'auto', padding:'15px 24px' }}>
                <WhatsAppGlyph size={17}/> {t('hero_cta_wa')}
              </BtnPrimary>
              <button type="button" onClick={() => goSection('calculator', navigate)}
                style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'14px 22px', background:'transparent', color:C.plum, border:`1.5px solid ${C.plum}`, borderRadius:'4px', fontFamily:SANS, fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
                <Sparkles size={16}/> {t('hero_cta_calc')}
              </button>
            </div>
            <div style={{ fontFamily: en ? MONO : SANS, fontSize:'12px', color:C.mute, letterSpacing: en ? '0.04em' : 0, lineHeight:1.8 }}>
              {t('hero_stats')}<br/>{t('hero_pickup')}
            </div>
          </div>

          <div className="hero-visual">
            <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div aria-hidden="true" style={{ position:'absolute', left:'50%', top:'42%', width:'340px', height:'340px', transform:'translate(-50%,-50%)', borderRadius:'50%', background:'radial-gradient(circle, rgba(224,183,101,.22) 0%, rgba(224,183,101,0) 65%)', pointerEvents:'none' }}/>
              <HeroMark/>
              <div style={{ position:'relative', fontFamily:SERIF, fontSize:'clamp(30px, 3.2vw, 42px)', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1.05, marginTop:'14px' }}>
                Carat <span style={{ fontStyle:'italic', color:C.plum }}>Money</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tiles">
          {tiles.map((x, i) => (
            <div className="tile" key={i}>
              <div className="tile-ic">{icons[i]}</div>
              <div><div className="tile-t">{x.t}</div><div className="tile-d">{x.d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 2a. Live rate card (formulas unchanged) ──────────────────────────────────
function RateCard({ spot }) {
  const { t } = useT();
  const [showGstTip, setShowGstTip]       = useState(false);
  const [selectedKarat, setSelectedKarat] = useState('22');
  const r24     = spot.display ?? SPOT_FALLBACK;
  const r22     = Math.round(r24 * 22 / 24);
  const r18     = Math.round(r24 * 18 / 24);
  const selRate = selectedKarat === '22' ? r22 : r18;
  const preGST  = Math.round(r24 / 1.03);
  const time    = fmtTime(spot.updatedAt);
  return (
    <Card dark style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <h2 style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, color:C.gold2, letterSpacing:'-0.02em', lineHeight:1.1, margin:'0 0 12px' }}>{t('rate_title')}</h2>
      {spot.loading && !spot.display
        ? <span style={{ fontFamily:SERIF, fontSize:'40px', color:'rgba(241,215,141,.4)', letterSpacing:'-0.02em' }}>{t('rate_loading')}</span>
        : (
          <>
            <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
              <span style={{ fontFamily:SERIF, fontSize:'clamp(32px, 9vw, 56px)', fontWeight:350, lineHeight:1, letterSpacing:'-0.03em', color:C.gold3, whiteSpace:'nowrap' }}>₹{fmt(r24,0)}</span>
              <span style={{ fontFamily:SANS, fontSize:'13px', color:'rgba(241,215,141,.6)', whiteSpace:'nowrap' }}>/g · 24K</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderTop:'1px solid rgba(224,183,101,.15)', borderBottom:'1px solid rgba(224,183,101,.15)' }}>
              <select aria-label="Karat" value={selectedKarat} onChange={e => setSelectedKarat(e.target.value)}
                style={{ background:'rgba(224,183,101,.12)', border:'1px solid rgba(224,183,101,.3)', borderRadius:'4px', color:C.gold2, fontFamily:MONO, fontSize:'12px', fontWeight:500, padding:'6px 10px', cursor:'pointer', outline:'none', letterSpacing:'0.08em' }}>
                <option value="22" style={{ background:C.plum }}>22K</option>
                <option value="18" style={{ background:C.plum }}>18K</option>
              </select>
              <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                <span style={{ fontFamily:SERIF, fontSize:'clamp(18px, 5vw, 24px)', fontWeight:350, color:C.gold2, letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>₹{fmt(selRate,0)}</span>
                <span style={{ fontFamily:SANS, fontSize:'12px', color:'rgba(241,215,141,.5)', whiteSpace:'nowrap' }}>/g · {selectedKarat}K</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'10px' }}>
              <div style={{ fontFamily:SERIF, fontSize:'12px', color:'rgba(241,215,141,.45)', fontStyle:'italic', flex:1 }}>
                {spot.error && !spot.updatedAt ? t('rate_unavailable') : time ? fill(t('rate_updated'), { time }) : t('rate_fetching')}
              </div>
              <button type="button" onClick={() => setShowGstTip(v => !v)} aria-expanded={showGstTip} aria-label="GST details"
                style={{ background:'none', border:'none', fontSize:'15px', color:C.gold, cursor:'pointer', padding:'2px 4px', lineHeight:1 }}>ⓘ</button>
            </div>
            {showGstTip && (
              <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(224,183,101,.1)', borderRadius:'4px', fontFamily:SANS, fontSize:'13px', color:C.gold3, lineHeight:1.55, animation:'fadeSlide .25s ease' }}>
                {t('gst_excl')} <b>₹{fmt(preGST,0)}/g</b><br/>{t('gst_note')}
              </div>
            )}
          </>
        )}
      <div style={{ marginTop:'auto', paddingTop:'18px' }}>
        <div className="hide-lt-lg" style={{ marginBottom:'16px' }}>
          <BtnPrimary onClick={() => openWA("Hi Carat Money — I'd like a quote for my gold at today's rate.", 'rate_card')} style={{ padding:'14px 20px' }}>
            <WhatsAppGlyph size={16}/> {t('rate_cta')}
          </BtnPrimary>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', fontFamily:SANS, fontSize:'12px', color:'rgba(241,215,141,.45)' }}>
          <Zap size={12} strokeWidth={2.5}/> {t('rate_refresh')}
        </div>
      </div>
    </Card>
  );
}

// ─── 2b. Value calculator — weight × the karat rate shown on the rate card ───
function ValueCalculator({ spot, navigate }) {
  const { t } = useT();
  const [w, setW] = useState('');
  const [k, setK] = useState(22);
  const r24   = spot.display ?? SPOT_FALLBACK;
  const rate  = k === 24 ? r24 : Math.round(r24 * k / 24);
  const wN    = parseNum(w);
  const value = wN !== null && wN > 0 ? wN * rate : null;
  const onW = v => {
    const s = v.replace(',', '.');
    if (s === '' || /^\d{0,5}(\.\d{0,3})?$/.test(s)) setW(s);
  };
  const onCTA = () => {
    if (value === null) return;
    const lines = [
      "Hi Carat Money — I'd like to sell my gold.", '',
      `Weight: ${w} g · ${k}K`,
      `Website estimate: ₹${fmt(value,0)} (at ₹${fmt(rate,0)}/g)`, '',
      'Please share your best offer.',
    ];
    openWA(lines.join('\n'), 'calculator');
  };
  return (
    <Card id="calculator" style={{ display:'flex', flexDirection:'column' }}>
      <h2 style={{ fontFamily:SERIF, fontSize:'clamp(24px, 3vw, 30px)', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1.15, margin:'0 0 20px' }}>{t('calc_title')}</h2>
      <label htmlFor="calc-w" style={LBL}>{t('calc_weight')}</label>
      <div style={{ position:'relative', marginBottom:'18px' }}>
        <input id="calc-w" type="text" inputMode="decimal" autoComplete="off" placeholder={t('calc_weight_ph')} value={w} onChange={e => onW(e.target.value)} style={{ ...INP, paddingRight:'40px' }}/>
        <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', fontFamily:MONO, fontSize:'13px', color:C.mute, pointerEvents:'none' }}>g</span>
      </div>
      <div style={LBL}>{t('calc_karat')}</div>
      <div className="karats" role="group" aria-label={t('calc_karat')}>
        {KARATS.map(kk => {
          const on = kk === k;
          return (
            <button key={kk} type="button" aria-pressed={on} onClick={() => setK(kk)}
              style={{ padding:'12px 0', borderRadius:'4px', border: on ? `1.5px solid ${C.plum}` : '1.5px solid rgba(26,20,38,.15)', background: on ? C.plum : C.white, color: on ? C.gold3 : C.ink, fontFamily:MONO, fontSize:'14px', fontWeight:500, cursor:'pointer' }}>
              {kk}K
            </button>
          );
        })}
      </div>
      <div style={{ marginTop:'20px', padding:'18px 20px', background:C.paper, border:'1px solid rgba(184,136,58,.3)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontFamily:SANS, fontSize:'13px', fontWeight:600, color:C.mute, marginBottom:'4px' }}>{t('calc_est')}</div>
          <div data-testid="calc-value" style={{ fontFamily:SERIF, fontSize:'clamp(30px, 5vw, 42px)', fontWeight:350, color: value ? C.plum : 'rgba(43,20,80,.3)', letterSpacing:'-0.03em', lineHeight:1.05, whiteSpace:'nowrap' }}>
            ₹{value ? fmt(value,0) : '0'}
          </div>
          <div style={{ fontFamily:SANS, fontSize:'12px', color:C.mute, marginTop:'6px' }}>{fill(t('calc_at'), { rate: fmt(rate,0), k })}</div>
        </div>
        <CaratMark size={34} color={C.gold} showDots={false} style={{ flexShrink:0, opacity:.8 }}/>
      </div>
      <div style={{ marginTop:'16px' }}>
        <BtnWhatsApp onClick={onCTA} disabled={value === null}><WhatsAppGlyph size={18} color={C.white}/> {t('calc_cta')}</BtnWhatsApp>
      </div>
      <div style={{ fontFamily:SANS, fontSize:'12px', color:C.mute, marginTop:'12px', lineHeight:1.5, textAlign:'center' }}>{t('calc_disclaimer')}</div>
      <div style={{ textAlign:'center', marginTop:'10px' }}>
        <Link to="/margin" navigate={navigate} style={{ display:'inline', fontFamily:SANS, fontSize:'13px', color:C.gold, fontWeight:600 }}>{t('calc_margin')}</Link>
      </div>
    </Card>
  );
}

// ─── 2c. Get in touch → Google Sheet lead + WhatsApp ─────────────────────────
function GetInTouch() {
  const { t, lang } = useT();
  const [name, setName]     = useState('');
  const [mobile, setMobile] = useState('');
  const [pref, setPref]     = useState('');
  const [hp, setHp]         = useState('');   // spam trap — real visitors never see it
  const [tried, setTried]   = useState(false);
  const valid  = name.trim().length >= 2 && /^[6-9]\d{9}$/.test(mobile);
  const prefEn = pref === 'doorstep' ? 'Doorstep pickup' : pref === 'centre' ? 'Visit centre' : 'Not specified';
  const LBLD   = { ...LBL, color:'rgba(241,215,141,.85)' };

  const onBook = () => {
    if (!valid) { setTried(true); return; }
    if (hp) return;
    postLead({ name:name.trim(), mobile, preference:prefEn, source:'Homepage · Book free appointment', lang, page:window.location.href });
    track('generate_lead', { preference:prefEn });
    const lines = ["Hi Carat Money — I'd like to book a free appointment.", '', `Name: ${name.trim()}`, `Phone: +91${mobile}`, `Preference: ${prefEn}`];
    openWA(lines.join('\n'), 'book_appointment');
  };

  const chip = (key, label) => {
    const on = pref === key;
    return (
      <button type="button" aria-pressed={on} onClick={() => setPref(on ? '' : key)}
        style={{ padding:'13px 8px', borderRadius:'4px', cursor:'pointer', fontFamily:SANS, fontSize:'14px', fontWeight:600, border: on ? `1.5px solid ${C.gold2}` : '1.5px solid rgba(224,183,101,.3)', background: on ? C.gold2 : 'transparent', color: on ? C.plum : C.gold3 }}>
        {label}
      </button>
    );
  };

  return (
    <div id="book" className="git">
      <div className="git-img hide-lt-lg">
        <img src="/img-sell.jpg" alt="" width="1310" height="701" loading="lazy" decoding="async" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, rgba(43,20,80,0) 50%, ${C.plum})` }}/>
      </div>
      <div className="git-body">
        <h2 style={{ fontFamily:SERIF, fontSize:'clamp(24px, 3vw, 30px)', fontWeight:350, color:C.gold3, margin:'0 0 6px', letterSpacing:'-0.02em', lineHeight:1.15 }}>{t('git_title')}</h2>
        <p style={{ fontFamily:SANS, fontSize:'14px', color:'rgba(241,215,141,.65)', margin:'0 0 20px', lineHeight:1.55 }}>{t('git_sub')}</p>
        <div className="git-fields">
          <div>
            <label htmlFor="git-name" style={LBLD}>{t('git_name')}</label>
            <input id="git-name" type="text" autoComplete="name" placeholder={t('git_name_ph')} value={name} onChange={e => setName(e.target.value)} style={INP}/>
          </div>
          <div>
            <label htmlFor="git-mobile" style={LBLD}>{t('git_mobile')}</label>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', border:'1.5px solid rgba(26,20,38,.18)', overflow:'hidden' }}>
              <span style={{ padding:'13px 12px 13px 14px', fontSize:'16px', color:C.mute, fontWeight:500, borderRight:'1px solid rgba(26,20,38,.12)', flexShrink:0, fontFamily:SANS }}>+91</span>
              <input id="git-mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={t('git_mobile_ph')} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,10))} style={{ ...INP, border:'none', borderRadius:0, flex:1, minWidth:0 }}/>
            </div>
          </div>
          <div className="git-pref">
            <div style={LBLD}>{t('git_pref')}</div>
            <div className="seg">{chip('doorstep', t('git_doorstep'))}{chip('centre', t('git_centre'))}</div>
          </div>
        </div>
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)}
          style={{ position:'absolute', left:'-9999px', width:'1px', height:'1px', opacity:0 }}/>
        <div className="git-actions">
          <BtnWhatsApp onClick={onBook}><WhatsAppGlyph size={18} color={C.white}/> {t('git_book')}</BtnWhatsApp>
          <CallPicker variant="outline" full label={t('git_call')} source="get_in_touch" align="left"/>
          <div style={{ fontFamily:SANS, fontSize:'12px', color:'rgba(241,215,141,.45)', lineHeight:1.5 }}>{t('git_consent')}</div>
        </div>
        {tried && !valid && <div role="alert" style={{ marginTop:'10px', fontFamily:SANS, fontSize:'13px', color:'#FCA5A5', fontWeight:500 }}>{t('git_err')}</div>}
      </div>
    </div>
  );
}

// ─── 3. Why people trust Carat Money (table on desktop, accordion on phones) ─
const TRUST_ICONS = [Microscope, Scale, TrendingUp, Percent, Wallet, Gem];

function TrustIcon({ I, size = 44 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold2, background:`radial-gradient(circle at 30% 30%, ${C.purple}, ${C.plum})`, border:'1px solid rgba(224,183,101,.45)', boxShadow:'0 4px 14px rgba(0,0,0,.25)' }}>
      <I size={Math.round(size * 0.45)} strokeWidth={1.75}/>
    </div>
  );
}

function TrustCompare() {
  const { t } = useT();
  const rows = t('why_rows');
  const [open, setOpen] = useState(0);
  const tag = (
    <span style={{ display:'inline-block', marginTop:'8px', padding:'4px 10px', borderRadius:'999px', background:C.gold2, color:C.plum, fontFamily:SANS, fontSize:'11px', fontWeight:700, letterSpacing:'0.02em' }}>
      {t('why_tag')}
    </span>
  );
  const usBox   = { background:'rgba(224,183,101,.08)', border:'1px solid rgba(224,183,101,.25)', borderRadius:'8px', padding:'18px 20px', display:'flex', gap:'12px', alignItems:'flex-start', color:C.gold3, fontFamily:SANS, fontSize:'15px', lineHeight:1.55 };
  const themBox = { background:'rgba(0,0,0,.18)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'8px', padding:'18px 20px', display:'flex', gap:'12px', alignItems:'flex-start', color:'rgba(255,255,255,.62)', fontFamily:SANS, fontSize:'15px', lineHeight:1.55 };

  return (
    <section id="why" className="cm-sec">
      <div className="cm-wrap">
        <SectionHead title={t('why_title')} lead={t('why_intro')}/>
        <div style={{ background:C.plum, borderRadius:'10px', border:'1px solid rgba(224,183,101,.2)', boxShadow:'0 12px 40px rgba(43,20,80,.22)', padding:'clamp(16px, 3vw, 36px)' }}>

          {/* desktop table */}
          <div className="hide-lt-lg">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 200px 1fr', gap:'0 20px', alignItems:'end', paddingBottom:'20px', marginBottom:'8px', borderBottom:'1px solid rgba(224,183,101,.15)' }}>
              <div style={{ textAlign:'center' }}>
                <CaratMark size={44} color={C.gold2}/>
                <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, marginTop:'6px' }}>Carat <span style={{ fontStyle:'italic' }}>Money</span></div>
                {tag}
              </div>
              <div/>
              <div style={{ textAlign:'center' }}>
                <div style={{ display:'inline-flex', width:'56px', height:'56px', borderRadius:'50%', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.55)' }}><Store size={26} strokeWidth={1.5}/></div>
                <div style={{ fontFamily:SANS, fontSize:'16px', fontWeight:600, color:'rgba(255,255,255,.75)', marginTop:'10px' }}>{t('why_them')}</div>
              </div>
            </div>
            {rows.map((r, i) => {
              const I = TRUST_ICONS[i];
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 200px 1fr', gap:'0 20px', alignItems:'stretch', padding:'8px 0' }}>
                  <div style={usBox}><Check size={18} color={C.green} style={{ flexShrink:0, marginTop:'3px' }}/><span>{r.us}</span></div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', textAlign:'center' }}>
                    <TrustIcon I={I}/>
                    <div style={{ fontFamily:SANS, fontSize:'14px', fontWeight:600, color:C.white }}>{r.k}</div>
                  </div>
                  <div style={themBox}><X size={18} color="#F87171" style={{ flexShrink:0, marginTop:'3px' }}/><span>{r.them}</span></div>
                </div>
              );
            })}
          </div>

          {/* phone / tablet accordion */}
          <div className="hide-lg">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', textAlign:'center', paddingBottom:'16px', marginBottom:'14px', borderBottom:'1px solid rgba(224,183,101,.15)' }}>
              <div style={{ padding:'0 8px' }}>
                <CaratMark size={30} color={C.gold2}/>
                <div style={{ fontFamily:SERIF, fontSize:'17px', fontWeight:350, color:C.gold3, marginTop:'4px' }}>Carat <span style={{ fontStyle:'italic' }}>Money</span></div>
                {tag}
              </div>
              <div style={{ padding:'0 8px', borderLeft:'1px solid rgba(224,183,101,.15)' }}>
                <div style={{ display:'inline-flex', width:'40px', height:'40px', borderRadius:'50%', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.55)' }}><Store size={20} strokeWidth={1.5}/></div>
                <div style={{ fontFamily:SANS, fontSize:'14px', fontWeight:600, color:'rgba(255,255,255,.75)', marginTop:'8px', lineHeight:1.35 }}>{t('why_them')}</div>
              </div>
            </div>
            <div style={{ border:'1px solid rgba(224,183,101,.18)', borderRadius:'8px', overflow:'hidden' }}>
              {rows.map((r, i) => {
                const I = TRUST_ICONS[i];
                const isOpen = open === i;
                return (
                  <div key={i} style={{ borderTop: i ? '1px solid rgba(224,183,101,.14)' : 'none' }}>
                    <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:'none', border:'none', cursor:'pointer', color:C.white, fontFamily:SANS, fontSize:'15px', fontWeight:600, textAlign:'left' }}>
                      <TrustIcon I={I} size={38}/>
                      <span style={{ flex:1 }}>{r.k}</span>
                      <ChevronDown size={18} color={C.gold2} style={{ flexShrink:0, transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}/>
                    </button>
                    {isOpen && (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid rgba(224,183,101,.14)', animation:'fadeSlide .25s ease' }}>
                        <div style={{ padding:'14px', fontFamily:SANS, fontSize:'13.5px', lineHeight:1.55, color:C.gold3, background:'rgba(224,183,101,.06)' }}>
                          <Check size={15} color={C.green} style={{ display:'block', marginBottom:'6px' }}/>{r.us}
                        </div>
                        <div style={{ padding:'14px', fontFamily:SANS, fontSize:'13.5px', lineHeight:1.55, color:'rgba(255,255,255,.6)', borderLeft:'1px solid rgba(224,183,101,.14)' }}>
                          <X size={15} color="#F87171" style={{ display:'block', marginBottom:'6px' }}/>{r.them}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. Carat Money process in 4 easy steps ──────────────────────────────────
function Process() {
  const { t } = useT();
  const steps = t('proc_steps');
  return (
    <section id="process" className="cm-sec" style={{ background:C.white, borderTop:'1px solid rgba(26,20,38,.06)', borderBottom:'1px solid rgba(26,20,38,.06)' }}>
      <div className="cm-wrap">
        <SectionHead title={t('proc_title')} lead={t('proc_sub')}/>
        <div className="proc">
          {steps.map((s, i) => (
            <div className="proc-step" key={i}>
              <div className="proc-num">{i + 1}</div>
              <div>
                <h3 style={{ fontFamily:SANS, fontSize:'16px', fontWeight:600, color:C.ink, lineHeight:1.4, margin:'2px 0 6px' }}>{s.t}</h3>
                <p style={{ fontFamily:SANS, fontSize:'14px', color:C.mute, lineHeight:1.55, margin:0 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:'36px' }}>
          <BtnPrimary onClick={() => openWA(WA_MSG, 'process')} style={{ width:'auto', display:'inline-flex', padding:'14px 24px' }}>
            <WhatsAppGlyph size={16}/> {t('proc_cta')}
          </BtnPrimary>
        </div>
      </div>
    </section>
  );
}

// ─── 5. Why thousands trust Carat Money (reviews carousel) ───────────────────
const initials = n => n.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();

function Reviews() {
  const { t } = useT();
  const quotes   = t('review_quotes');
  const trackRef = useRef(null);
  const [idx, setIdx]     = useState(0);
  const [pages, setPages] = useState(REVIEWERS.length);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const step    = el.children[0].offsetWidth + 16;
    if (!step || step <= 16) return;
    const visible = Math.max(1, Math.round(el.clientWidth / step));
    setPages(Math.max(1, REVIEWERS.length - visible + 1));
    setIdx(Math.min(Math.round(el.scrollLeft / step), REVIEWERS.length - 1));
  }, []);
  useEffect(() => {
    measure();
    const el = trackRef.current;
    el?.addEventListener('scroll', measure, { passive:true });
    window.addEventListener('resize', measure);
    return () => { el?.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [measure]);
  const scrollToPage = i => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    el.scrollTo({ left: i * (el.children[0].offsetWidth + 16), behavior:'smooth' });
  };
  const arrow = { width:'40px', height:'40px', borderRadius:'50%', border:`1.5px solid ${C.plum}`, background:'transparent', color:C.plum, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' };
  const page  = Math.min(idx, pages - 1);

  return (
    <section id="reviews" className="cm-sec">
      <div className="cm-wrap">
        <SectionHead title={t('rev_title')} lead={t('rev_sub')}>
          {REVIEWS_ARE_SAMPLES && (
            <span style={{ display:'inline-block', marginTop:'12px', padding:'4px 12px', borderRadius:'999px', border:'1px dashed rgba(184,136,58,.6)', color:C.gold, fontFamily:SANS, fontSize:'12px', fontWeight:600 }}>
              {t('rev_sample')}
            </span>
          )}
        </SectionHead>
        <div ref={trackRef} className="rv-track">
          {REVIEWERS.map((r, i) => (
            <figure key={r.n} className="rv-card" style={{ margin:0, background:C.white, border:'1px solid rgba(26,20,38,.1)', borderRadius:'8px', overflow:'hidden', boxShadow:'0 2px 12px rgba(22,18,31,.06)', display:'flex', flexDirection:'column' }}>
              <blockquote style={{ margin:0, padding:'26px 22px 20px', position:'relative', flex:1 }}>
                <Quote size={44} color={C.gold2} aria-hidden="true" style={{ position:'absolute', top:'14px', left:'14px', opacity:.2 }}/>
                <p style={{ position:'relative', fontFamily:SANS, fontSize:'15px', lineHeight:1.65, color:C.ink2, margin:0 }}>“{quotes[i]}”</p>
              </blockquote>
              <figcaption style={{ background:C.paper, padding:'14px 22px', display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid rgba(26,20,38,.06)' }}>
                <div aria-hidden="true" style={{ width:'42px', height:'42px', borderRadius:'50%', background:C.plum, color:C.gold3, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SERIF, fontSize:'16px', flexShrink:0, border:'1px solid rgba(224,183,101,.4)' }}>{initials(r.n)}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontWeight:600, fontSize:'15px', color:C.ink }}>{r.n}</div>
                  <div style={{ fontFamily:SANS, fontSize:'13px', color:C.mute }}>{r.l}</div>
                </div>
                <div role="img" aria-label={t('stars')} style={{ marginLeft:'auto', display:'flex', gap:'2px', flexShrink:0 }}>
                  {[0,1,2,3,4].map(s => <Star key={s} size={14} fill={C.gold2} color={C.gold2}/>)}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'18px', marginTop:'14px' }}>
          <button type="button" aria-label={t('prev')} onClick={() => scrollToPage(Math.max(0, page - 1))} disabled={page === 0} style={{ ...arrow, opacity: page === 0 ? .35 : 1 }}><ChevronLeft size={18}/></button>
          <div style={{ display:'flex', gap:'8px' }}>
            {Array.from({ length:pages }).map((_, i) => (
              <button key={i} type="button" aria-label={`${i + 1} / ${pages}`} aria-current={i === page} onClick={() => scrollToPage(i)}
                style={{ width: i === page ? '22px' : '8px', height:'8px', borderRadius:'999px', border:'none', padding:0, cursor:'pointer', background: i === page ? C.plum : 'rgba(43,20,80,.2)', transition:'width .2s, background .2s' }}/>
            ))}
          </div>
          <button type="button" aria-label={t('next')} onClick={() => scrollToPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1} style={{ ...arrow, opacity: page >= pages - 1 ? .35 : 1 }}><ChevronRight size={18}/></button>
        </div>
      </div>
    </section>
  );
}

// ─── 6. FAQs + "Still have questions?" panel ─────────────────────────────────
function FAQSection() {
  const { t } = useT();
  const faqs = t('faqs');
  const [open, setOpen] = useState(0);
  const panelBtn = { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%', padding:'14px 20px', borderRadius:'4px', fontFamily:SANS, fontSize:'15px', fontWeight:600, textDecoration:'none', cursor:'pointer' };
  return (
    <section id="faqs" className="cm-sec" style={{ background:C.white, borderTop:'1px solid rgba(26,20,38,.06)', borderBottom:'1px solid rgba(26,20,38,.06)' }}>
      <div className="cm-wrap">
        <div className="faq-grid">
          <aside className="faq-panel" style={{ background:C.plum, borderRadius:'10px', padding:'28px 24px', border:'1px solid rgba(224,183,101,.2)', boxShadow:'0 12px 40px rgba(43,20,80,.2)' }}>
            <div aria-hidden="true" style={{ width:'48px', height:'48px', borderRadius:'50%', border:'1.5px solid rgba(224,183,101,.6)', color:C.gold2, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SERIF, fontSize:'26px', marginBottom:'16px' }}>?</div>
            <h3 style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, color:C.gold3, margin:'0 0 8px', letterSpacing:'-0.02em', lineHeight:1.15 }}>{t('faq_panel_title')}</h3>
            <p style={{ fontFamily:SANS, fontSize:'14px', color:'rgba(241,215,141,.65)', lineHeight:1.6, margin:'0 0 20px' }}>{t('faq_panel_sub')}</p>
            <div style={{ display:'grid', gap:'10px' }}>
              <a href={WA_LINK} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source:'faq_panel' })} style={{ ...panelBtn, background:C.green, color:C.white, borderRadius:'999px', boxShadow:'0 6px 20px rgba(37,211,102,.3)' }}>
                <WhatsAppGlyph size={18} color={C.white}/> {t('whatsapp')}
              </a>
              <CallPicker variant="outline" full source="faq_panel" align="left"/>
              <a href={`mailto:${EMAIL}`} onClick={() => track('email_click', { source:'faq_panel' })} style={{ ...panelBtn, background:'transparent', color:C.gold2, border:'1px solid rgba(224,183,101,.4)' }}>
                <Mail size={16}/> {t('email')}
              </a>
            </div>
          </aside>
          <div>
            <h2 className="cm-h2" style={{ color:C.ink }}>{t('faq_title')}</h2>
            <p style={{ fontFamily:SANS, fontSize:'15px', color:C.mute, lineHeight:1.6, margin:'10px 0 22px' }}>{t('faq_sub')}</p>
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={i} style={{ borderTop:'1px solid rgba(26,20,38,.12)', borderBottom: i === faqs.length - 1 ? '1px solid rgba(26,20,38,.12)' : 'none' }}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                    style={{ width:'100%', background:'none', border:'none', padding:'16px 0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', cursor:'pointer', textAlign:'left', fontFamily:SANS, fontSize:'15px', fontWeight:600, color: isOpen ? C.plum : C.ink }}>
                    {f.q}
                    <ChevronDown size={16} color={C.gold} style={{ flexShrink:0, transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}/>
                  </button>
                  {isOpen && <div style={{ fontFamily:SANS, fontSize:'14px', color:C.mute, lineHeight:1.65, paddingBottom:'16px', animation:'fadeSlide .25s ease' }}>{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 7. Visit us (map + details) ─────────────────────────────────────────────
function VisitUs() {
  const { t, lang } = useT();
  const row = { display:'flex', alignItems:'flex-start', gap:'10px', fontFamily:SANS, fontSize:'15px', color:C.ink2, lineHeight:1.5 };
  return (
    <section id="visit" className="cm-sec">
      <div className="cm-wrap">
        <div className="visit">
          <div className="visit-map">
            <iframe title="Carat Money on Google Maps" src={MAP_EMBED} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
          </div>
          <div style={{ padding:'24px 22px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ fontFamily: lang === 'en' ? MONO : SANS, fontSize: lang === 'en' ? '10px' : '13px', letterSpacing: lang === 'en' ? '0.18em' : 0, textTransform: lang === 'en' ? 'uppercase' : 'none', color:C.gold, fontWeight:500 }}>{t('visit_label')}</div>
            <h2 style={{ fontFamily:SERIF, fontSize:'clamp(26px, 3vw, 32px)', fontWeight:350, color:C.ink, margin:0, letterSpacing:'-0.02em', lineHeight:1.15 }}>{t('visit_title')}</h2>
            <div style={row}><MapPin size={18} color={C.gold} style={{ flexShrink:0, marginTop:'2px' }}/><address style={{ fontStyle:'normal' }}>{ADDRESS}</address></div>
            <div style={row}><Clock size={18} color={C.gold} style={{ flexShrink:0, marginTop:'2px' }}/>{t('visit_hours')}</div>
            <div style={row}><Mail size={18} color={C.gold} style={{ flexShrink:0, marginTop:'2px' }}/><a href={`mailto:${EMAIL}`} style={{ color:C.ink2, textDecoration:'none', wordBreak:'break-all' }}>{EMAIL}</a></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'auto', paddingTop:'8px' }}>
              <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer" onClick={() => track('directions_click')}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'14px 12px', borderRadius:'4px', background:C.plum, color:C.gold3, fontFamily:SANS, fontSize:'15px', fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' }}>
                <Navigation size={16}/> {t('visit_dir')}
              </a>
              <CallPicker variant="gold" full source="visit"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 8. Blog cards (homepage teaser + /blog grid) ────────────────────────────
function BlogCard({ a, navigate, readLabel = 'Read', clamp = 2 }) {
  return (
    <Link to={`/blog/${a.slug}`} navigate={navigate} className="blog-card"
      style={{ background:C.white, borderRadius:'8px', border:'1px solid rgba(26,20,38,.1)', boxShadow:'0 2px 12px rgba(22,18,31,.06)', overflow:'hidden', display:'flex', flexDirection:'column', height:'100%' }}>
      {a.cover
        ? <img src={a.cover} alt="" loading="lazy" style={{ width:'100%', aspectRatio:'16 / 9', objectFit:'cover', display:'block' }}/>
        : <div style={{ height:'3px', background:`linear-gradient(90deg, ${C.gold}, ${C.gold3})` }}/>}
      <div style={{ padding:'22px', display:'flex', flexDirection:'column', flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
          <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.16em', color:C.gold, textTransform:'uppercase' }}>{a.category}</div>
          <div style={{ fontFamily:MONO, fontSize:'9px', color:C.mute, letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{a.readTime}</div>
        </div>
        <h3 style={{ fontFamily:SERIF, fontSize:'21px', fontWeight:350, lineHeight:1.25, letterSpacing:'-0.015em', margin:'0 0 10px', color:C.ink }}>{a.title}</h3>
        <p style={{ fontFamily:SANS, fontSize:'14px', color:C.mute, lineHeight:1.6, margin:'0 0 16px', display:'-webkit-box', WebkitLineClamp:clamp, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.excerpt}</p>
        <div style={{ marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.06em' }}>{a.date}</div>
          <div style={{ fontFamily:MONO, fontSize:'11px', color:C.gold, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase' }}>{readLabel} →</div>
        </div>
      </div>
    </Link>
  );
}

function BlogTeaser({ navigate }) {
  const { t, lang } = useT();
  return (
    <section id="blog" className="cm-sec" style={{ background:C.white, borderTop:'1px solid rgba(26,20,38,.06)', borderBottom:'1px solid rgba(26,20,38,.06)' }}>
      <div className="cm-wrap">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:'12px 24px', flexWrap:'wrap', marginBottom:'28px' }}>
          <div>
            <h2 className="cm-h2" style={{ color:C.ink }}>{t('blog_title')}</h2>
            <p style={{ fontFamily:SANS, fontSize:'15px', color:C.mute, lineHeight:1.6, margin:'10px 0 0' }}>
              {t('blog_sub')}{lang !== 'en' && t('blog_note') ? ` ${t('blog_note')}` : ''}
            </p>
          </div>
          <Link to="/blog" navigate={navigate} style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:SANS, fontSize:'14px', fontWeight:600, color:C.gold, whiteSpace:'nowrap' }}>
            {t('blog_all')} →
          </Link>
        </div>
        <div className="blog-grid teaser">
          {ARTICLES_SORTED.slice(0, 3).map(a => <BlogCard key={a.slug} a={a} navigate={navigate} readLabel={t('blog_read')}/>)}
        </div>
      </div>
    </section>
  );
}

// ─── 9. App — coming soon ────────────────────────────────────────────────────
function PhoneMock({ spot }) {
  const r24 = spot.display ?? SPOT_FALLBACK;
  const r22 = Math.round(r24 * 22 / 24);
  const wt  = 12.48;
  const val = Math.round(wt * r22);
  const tileS = { background:C.white, borderRadius:'12px', padding:'10px', border:'1px solid rgba(26,20,38,.08)', display:'flex', flexDirection:'column', gap:'6px', fontFamily:SANS, fontSize:'10.5px', fontWeight:600, color:C.ink };
  return (
    <div className="app-phone" aria-hidden="true" style={{ position:'relative', zIndex:1, aspectRatio:'9 / 18.5', background:C.ink, borderRadius:'38px', padding:'9px', boxShadow:'0 30px 60px rgba(22,18,31,.35), inset 0 0 0 1px rgba(255,255,255,.08)' }}>
      <div style={{ position:'relative', height:'100%', borderRadius:'30px', overflow:'hidden', background:C.paper, display:'flex', flexDirection:'column' }}>
        <div style={{ position:'absolute', top:'8px', left:'50%', transform:'translateX(-50%)', width:'80px', height:'22px', borderRadius:'12px', background:C.ink, zIndex:2 }}/>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 22px 0', fontFamily:SANS, fontSize:'10px', fontWeight:600, color:C.ink }}>
          <span>9:41</span><span style={{ width:'18px', height:'9px', border:`1.5px solid ${C.ink}`, borderRadius:'3px', display:'inline-block', marginTop:'2px' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'16px 14px 10px' }}>
          <CaratMark size={18} color={C.gold}/>
          <span style={{ fontFamily:SERIF, fontSize:'15px', color:C.ink }}>Carat <span style={{ fontStyle:'italic', color:C.plum }}>Money</span></span>
          <span style={{ marginLeft:'auto', width:'24px', height:'24px', borderRadius:'50%', background:C.paper2, border:'1px solid rgba(184,136,58,.3)' }}/>
        </div>
        <div style={{ margin:'0 12px', padding:'14px', borderRadius:'14px', background:C.plum }}>
          <div style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:MONO, fontSize:'8.5px', letterSpacing:'0.12em', color:C.gold2 }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:C.green }}/> LIVE 24K
          </div>
          <div style={{ fontFamily:SERIF, fontSize:'26px', color:C.gold3, lineHeight:1.1, marginTop:'4px' }}>₹{fmt(r24,0)}<span style={{ fontSize:'11px', color:'rgba(241,215,141,.6)' }}>/g</span></div>
          <div style={{ fontFamily:SANS, fontSize:'10px', color:'rgba(241,215,141,.6)', marginTop:'2px' }}>22K ₹{fmt(r22,0)}/g</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', margin:'10px 12px 0' }}>
          <div style={tileS}><Sparkles size={16} color={C.gold}/>Value my gold</div>
          <div style={tileS}><HomeIcon size={16} color={C.gold}/>Book pickup</div>
        </div>
        <div style={{ margin:'10px 12px 0', padding:'12px', borderRadius:'14px', background:C.white, border:'1px solid rgba(26,20,38,.08)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:SANS, fontSize:'10.5px', fontWeight:600, color:C.ink }}>
            Valuation certificate
            <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'9px', color:'#15803D', background:'#DCFCE7', padding:'2px 6px', borderRadius:'999px' }}><Check size={9}/> Verified</span>
          </div>
          <div style={{ fontFamily:MONO, fontSize:'9px', color:C.mute, marginTop:'6px' }}>22K · 12.480 g · 91.67%</div>
          <div style={{ fontFamily:SERIF, fontSize:'18px', color:C.plum, marginTop:'4px' }}>₹{fmt(val,0)}</div>
        </div>
        <div style={{ margin:'10px 12px 0', padding:'10px 12px', borderRadius:'14px', background:C.white, border:'1px solid rgba(26,20,38,.08)', display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ width:'28px', height:'28px', borderRadius:'50%', background:C.paper2, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Clock size={14} color={C.gold}/></span>
          <span style={{ fontFamily:SANS, fontSize:'10.5px', lineHeight:1.35, color:C.ink }}><b style={{ fontWeight:600 }}>Pickup booked</b><br/><span style={{ color:C.mute }}>Today · 4:30 pm · Kharghar</span></span>
        </div>
        <div style={{ margin:'auto 12px 16px', padding:'11px', borderRadius:'10px', background:C.green, color:C.ink, textAlign:'center', fontFamily:SANS, fontSize:'11px', fontWeight:600 }}>
          Book doorstep pickup
        </div>
      </div>
    </div>
  );
}

function AppSoon({ spot }) {
  const { t } = useT();
  const notify = platform => {
    track('app_notify', { platform });
    openWA(`Hi Carat Money — please notify me when the Carat Money app launches on ${platform}.`, `app_${platform.toLowerCase()}`);
  };
  const chip = { display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderRadius:'8px', background:C.plum, color:C.gold3, fontFamily:SANS, fontSize:'13px', fontWeight:600, boxShadow:'0 10px 24px rgba(43,20,80,.3)', border:'1px solid rgba(224,183,101,.25)', whiteSpace:'nowrap' };
  return (
    <section id="app" className="cm-sec" style={{ overflow:'hidden' }}>
      <div className="cm-wrap">
        <div className="app-grid">
          <div className="app-text">
            <h2 className="cm-h2" style={{ color:C.ink }}>{t('app_h')}</h2>
            <p style={{ fontFamily:SANS, fontSize:'16px', color:C.mute, lineHeight:1.65, margin:'14px 0 0', maxWidth:'520px', marginLeft:'auto', marginRight:'auto' }} className="app-body">{t('app_body')}</p>
            <div className="app-btns">
              {['iOS', 'Android'].map(p => (
                <button key={p} type="button" onClick={() => notify(p)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:C.plum, color:C.gold3, border:'1px solid rgba(224,183,101,.3)', borderRadius:'8px', cursor:'pointer', textAlign:'left' }}>
                  <Smartphone size={22} color={C.gold2} style={{ flexShrink:0 }}/>
                  <span>
                    <span style={{ display:'block', fontFamily:SANS, fontSize:'11px', color:'rgba(241,215,141,.6)' }}>{t('app_soon')}</span>
                    <span style={{ display:'block', fontFamily:SANS, fontSize:'16px', fontWeight:600 }}>{p}</span>
                  </span>
                </button>
              ))}
            </div>
            <div style={{ fontFamily:SANS, fontSize:'12px', color:C.mute, marginTop:'12px' }}>{t('app_hint')}</div>
          </div>
          <div style={{ position:'relative', display:'flex', justifyContent:'center', padding:'24px 0' }}>
            <div aria-hidden="true" style={{ position:'absolute', left:'50%', top:'50%', width:'min(460px, 92vw)', aspectRatio:'1', transform:'translate(-50%,-50%)', borderRadius:'50%', background:'radial-gradient(circle, rgba(224,183,101,.32) 0%, rgba(224,183,101,0) 62%)' }}/>
            <div aria-hidden="true" style={{ position:'absolute', left:'50%', top:'50%', width:'min(420px, 84vw)', aspectRatio:'1', transform:'translate(-50%,-50%)', borderRadius:'50%', border:'2px dotted rgba(184,136,58,.35)' }}/>
            <div aria-hidden="true" style={{ position:'absolute', left:'calc(50% - min(210px, 42vw))', top:'38%', width:'14px', height:'14px', borderRadius:'50%', background:C.gold2 }}/>
            <div aria-hidden="true" style={{ position:'absolute', right:'calc(50% - min(200px, 40vw))', top:'22%', width:'10px', height:'10px', borderRadius:'50%', background:C.plum }}/>
            <PhoneMock spot={spot}/>
            <div className="hide-lt-lg" style={{ position:'absolute', left:'2%', top:'30%', zIndex:2, animation:'floatY 4s ease-in-out infinite' }}>
              <span style={chip}><Check size={15} color={C.green}/> {t('app_chip1')}</span>
            </div>
            <div className="hide-lt-lg" style={{ position:'absolute', right:'2%', bottom:'26%', zIndex:2, animation:'floatY 4s ease-in-out 1.5s infinite' }}>
              <span style={chip}><Check size={15} color={C.green}/> {t('app_chip2')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 10. Partner strip ───────────────────────────────────────────────────────
function PartnerStrip() {
  const { t } = useT();
  return (
    <div className="cm-wrap" style={{ paddingBottom:'48px' }}>
      <div style={{ border:'1px solid rgba(184,136,58,.45)', borderRadius:'8px', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px 24px', flexWrap:'wrap', background:'rgba(224,183,101,.06)' }}>
        <div style={{ fontFamily:SANS, fontSize:'14px', color:C.ink2, lineHeight:1.55 }}>{t('partner_text')}</div>
        <a href={PARTNER_URL} target="_blank" rel="noreferrer" onClick={() => track('partner_click')}
          style={{ fontFamily:SANS, fontSize:'14px', fontWeight:600, color:C.gold, textDecoration:'none', whiteSpace:'nowrap' }}>
          {t('partner_cta')}
        </a>
      </div>
    </div>
  );
}

// ─── 11. Footer ──────────────────────────────────────────────────────────────
function SiteFooter({ navigate }) {
  const { t, lang } = useT();
  const en = lang === 'en';
  const onPage = [['rate', t('f_live')], ['calculator', t('f_calc')], ['why', t('f_why')], ['reviews', t('f_reviews')], ['faqs', t('f_faqs')], ['visit', t('f_visit')]];
  const explore = [['/sell', t('f_sell')], ['/buy', t('f_buy')], ['/margin', t('f_margin')], ['/blog', t('f_blog')]];
  const H = ({ children }) => (
    <div style={{ fontFamily: en ? MONO : SANS, fontSize: en ? '11px' : '13px', letterSpacing: en ? '0.16em' : 0, textTransform: en ? 'uppercase' : 'none', color:C.gold2, marginBottom:'12px', fontWeight:500 }}>{children}</div>
  );
  const line = { display:'flex', alignItems:'flex-start', gap:'8px', fontFamily:SANS, fontSize:'14px', color:'rgba(241,215,141,.75)', lineHeight:1.5, marginBottom:'10px', textDecoration:'none' };
  return (
    <footer style={{ background:C.plum, borderTop:'1px solid rgba(224,183,101,.2)' }}>
      <div className="cm-wrap" style={{ paddingTop:'48px' }}>
        <div className="ft-grid">
          <div className="ft-span">
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <CaratMark size={40} color={C.gold2}/>
              <span style={{ fontFamily:SERIF, fontSize:'24px', fontWeight:350, color:C.gold3 }}>Carat <span style={{ fontStyle:'italic' }}>Money</span></span>
            </div>
            <div style={{ fontFamily:SANS, fontSize:'14px', color:'rgba(241,215,141,.6)', marginTop:'12px', lineHeight:1.5 }}>{t('hero_eyebrow')}</div>
            {SHOW_CERTIFICATIONS && (
              <div style={{ display:'flex', alignItems:'center', gap:'16px', marginTop:'18px', flexWrap:'wrap' }}>
                <img src="/badge-ibja.png" alt="IBJA" height="36" loading="lazy" style={{ height:'36px', width:'auto' }}/>
                <img src="/badge-iso-27001.png" alt="ISO 27001 certified" height="60" loading="lazy" style={{ height:'60px', width:'auto' }}/>
              </div>
            )}
            <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
              {SOCIALS.map(({ href, label, path }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(224,183,101,.1)', border:'1px solid rgba(224,183,101,.25)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" fill={C.gold2} style={{ display:'block' }} aria-hidden="true"><path d={path}/></svg>
                </a>
              ))}
            </div>
          </div>
          <nav aria-label={t('f_onpage')}>
            <H>{t('f_onpage')}</H>
            {onPage.map(([id, label]) => <button key={id} type="button" className="ft-link" onClick={() => goSection(id, navigate)}>{label}</button>)}
          </nav>
          <nav aria-label={t('f_explore')}>
            <H>{t('f_explore')}</H>
            {explore.map(([to, label]) => <Link key={to} to={to} navigate={navigate} className="ft-link">{label}</Link>)}
            <a href={PARTNER_URL} target="_blank" rel="noreferrer" className="ft-link">{t('f_partner')}</a>
          </nav>
          <div className="ft-span">
            <H>{t('f_contact')}</H>
            <div style={line}><MapPin size={16} color={C.gold2} style={{ flexShrink:0, marginTop:'2px' }}/><address style={{ fontStyle:'normal' }}>{ADDRESS}</address></div>
            <div style={line}><Clock size={16} color={C.gold2} style={{ flexShrink:0, marginTop:'2px' }}/>{t('visit_hours')}</div>
            {CALL_NUMBERS.map(n => (
              <a key={n.tel} href={`tel:${n.tel}`} onClick={() => track('call_click', { number:n.tel, source:'footer' })} style={line}><Phone size={16} color={C.gold2} style={{ flexShrink:0, marginTop:'2px' }}/>+91 {n.label}</a>
            ))}
            <a href={`mailto:${EMAIL}`} style={line}><Mail size={16} color={C.gold2} style={{ flexShrink:0, marginTop:'2px' }}/>{EMAIL}</a>
            <a href={WA_LINK} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source:'footer' })} style={line}><WhatsAppGlyph size={16} color={C.gold2}/>{t('whatsapp')}</a>
          </div>
        </div>
        <div className="ft-pad" style={{ borderTop:'1px solid rgba(224,183,101,.15)', marginTop:'40px', paddingTop:'20px' }}>
          <div style={{ fontFamily:SANS, fontSize:'13px', color:'rgba(241,215,141,.8)', marginBottom:'10px' }}>© {new Date().getFullYear()} Carat Money. {t('f_rights')}</div>
          <p style={{ fontFamily:SANS, fontSize:'12px', lineHeight:1.65, color:'rgba(241,215,141,.5)', margin:0, maxWidth:'900px' }}>{t('f_legal')}</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating WhatsApp button (phones only) ──────────────────────────────────
function FloatingWA() {
  const { t } = useT();
  return (
    <a href={WA_LINK} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source:'floating' })} aria-label={t('wa_float')} className="hide-d"
      style={{ position:'fixed', right:'16px', bottom:'calc(16px + env(safe-area-inset-bottom, 0px))', zIndex:90, width:'56px', height:'56px', borderRadius:'50%', background:C.green, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(37,211,102,.4)' }}>
      <WhatsAppGlyph size={28} color={C.white}/>
    </a>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ navigate, spot }) {
  // FAQ structured data (English) so the questions can show in Google results
  useEffect(() => {
    document.getElementById('cm-faq-schema')?.remove();
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id   = 'cm-faq-schema';
    el.text = JSON.stringify({
      '@context':'https://schema.org',
      '@type':'FAQPage',
      mainEntity: STR.en.faqs.map(f => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } })),
    });
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  // Arriving at /#section (from another page or a shared link) → scroll there
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const tm = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
    return () => clearTimeout(tm);
  }, []);

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <TopBar spot={spot} navigate={navigate} showLang/>
      <main>
        <Hero navigate={navigate}/>
        <section id="rate" className="cm-sec" style={{ paddingTop:'8px' }}>
          <div className="cm-wrap">
            <div className="rc-grid">
              <RateCard spot={spot}/>
              <ValueCalculator spot={spot} navigate={navigate}/>
            </div>
            <GetInTouch/>
          </div>
        </section>
        <TrustCompare/>
        <Process/>
        <Reviews/>
        <FAQSection/>
        <VisitUs/>
        <BlogTeaser navigate={navigate}/>
        <AppSoon spot={spot}/>
        <PartnerStrip/>
      </main>
      <SiteFooter navigate={navigate}/>
      <FloatingWA/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  OTHER PAGES (logic unchanged — only bug fixes)
// ═════════════════════════════════════════════════════════════════════════════

// ─── Articles Data ────────────────────────────────────────────────────────────
// Swap body + meta for CMS API response later — structure stays identical.
const ARTICLES = [
  {
    slug:            'is-your-gold-buyer-cheating-you',
    title:           'Is your gold buyer cheating you?',
    excerpt:         "Most gold buyers keep 10–15% above the spot rate. Here's exactly how to check their margin before you sell.",
    category:        'BUYER MARGINS',
    readTime:        '4 MIN READ',
    date:            '27 Apr 2026',
    primaryCTA:      'margin',
    midArticleNudge: true,
    body: [
      { type:'p',  text:"When you walk into a gold buyer's shop, they have one advantage over you: they know exactly what your gold is worth and you don't. That information gap is where their profit lives — and it's often much larger than most sellers realise." },
      { type:'h2', text:'What is a buyer\'s margin?' },
      { type:'p',  text:"Every gold buyer purchases your gold at a price below the market spot rate. The difference between what they pay you and what they can sell it for is their margin. A fair margin covers their operational costs — testing equipment, shop rent, staff. An unfair margin is simply excess profit taken from you." },
      { type:'p',  text:'In India, buyer margins typically range from 6% to 18% above the spot rate. A margin below 8% is considered fair. Anything above 12% is high. Above 15%, you should walk away.' },
      { type:'h2', text:'How buyers hide the margin' },
      { type:'p',  text:'The most common tactics gold buyers use to widen their margin without you noticing:' },
      { type:'p',  text:'1. Overstating stone weight — they weigh your stones at full value and deduct it entirely, even though they recover a significant portion when melting.' },
      { type:'p',  text:'2. Understating purity — a machine that reads 91.6% might be reported to you as 89% or 90%. Even a 1% difference on purity translates to hundreds of rupees on a 20g piece.' },
      { type:'p',  text:'3. Using a stale rate — some buyers use a rate from earlier in the day, even if the live spot rate has moved up significantly since morning.' },
      { type:'nudge' },
      { type:'h2', text:'How to check the margin yourself' },
      { type:'p',  text:"You need four numbers: gross weight, stone weight, wastage, and purity — all of which the buyer must show you. Once you have those, compare what they're offering against the live spot rate." },
      { type:'p',  text:"Carat Money's margin calculator does this in seconds. Enter what your buyer told you and it shows you exactly what percentage above spot they're keeping. If it's above 12%, push back or walk away." },
      { type:'p',  text:'Knowledge is your only leverage in a gold buying transaction. Use it.' },
    ],
  },
  {
    slug:            'what-is-gold-buyer-margin',
    title:           'What is gold buyer margin and why it matters',
    excerpt:         'Understanding the margin your buyer keeps is the single most important thing you can do before selling your gold.',
    category:        'GOLD BASICS',
    readTime:        '3 MIN READ',
    date:            '28 Apr 2026',
    primaryCTA:      'margin',
    midArticleNudge: false,
    body: [
      { type:'p',  text:"Gold buyer margin is the percentage difference between what a buyer pays you and what they can recover when they sell or melt your gold at the current market rate. It's how every gold buyer makes money — and knowing this number puts you in control of the transaction." },
      { type:'h2', text:'Why the spot rate matters' },
      { type:'p',  text:'The spot rate is the internationally traded price of 24K gold per gram at any given moment. Every reputable gold buyer in India uses it as their benchmark. When a buyer offers you ₹13,500 per gram for 22K gold and the spot rate implies ₹14,200, they\'re keeping a 4.9% margin.' },
      { type:'p',  text:"That sounds small. On 50 grams of gold worth ₹7,10,000, that's ₹34,800 in their pocket that could have been yours." },
      { type:'h2', text:"What's a fair margin?" },
      { type:'p',  text:'A margin of 5–8% is considered fair in the industry — it covers testing, operations, and a reasonable profit. Margins of 10–15% are on the higher side. Anything above 15% is exploitative, particularly for sellers who don\'t know the spot rate.' },
      { type:'h2', text:'How to use this information' },
      { type:'p',  text:"Before you agree to any offer, ask the buyer for their exact purity reading, the stone weight they're deducting, and the rate they're offering per gram. With those three numbers, you can calculate their margin in seconds using our free tool." },
      { type:'p',  text:'Walk in informed. Walk out with a fair price.' },
    ],
  },
  {
    slug:            'gold-selling-tips',
    title:           'Selling gold: 5 things to know first',
    excerpt:         "The gold buying market is active — but knowing these five things before you sell can make a significant difference to what you walk away with.",
    category:        'SELLING TIPS',
    readTime:        '5 MIN READ',
    date:            '29 Apr 2026',
    primaryCTA:      'sell',
    midArticleNudge: true,
    body: [
      { type:'p',  text:'Selling gold can feel overwhelming — dozens of buyers, wildly different offers, and very little transparency. Most sellers accept the first reasonable-sounding offer without realising they could do significantly better. Here\'s what to know before you walk in.' },
      { type:'h2', text:'1. Check the live rate first' },
      { type:'p',  text:'Before you visit any buyer, check the live spot rate for gold. This is your benchmark. Any buyer offering more than 10–12% below this rate is taking an unfair margin. Carat Money shows you the live rate on our homepage — free, no registration required.' },
      { type:'h2', text:'2. Get multiple quotes' },
      { type:'p',  text:"Don't sell to the first buyer you visit. Get at least two or three quotes. The difference between a 7% margin buyer and a 14% margin buyer on 40 grams of gold is approximately ₹40,000. That's worth a few extra hours." },
      { type:'nudge' },
      { type:'h2', text:'3. Ask for the purity reading' },
      { type:'p',  text:'Insist on seeing the XRF machine reading yourself. Some buyers will show you a number — make sure it matches what\'s printed on the machine screen, not just what they tell you verbally. Even a 1% understatement in purity can cost you thousands.' },
      { type:'h2', text:'4. Understand the deductions' },
      { type:'p',  text:"Buyers deduct stone weight and wastage from your gross weight before calculating your payout. Ask exactly how much they're deducting and why. Stone deductions should be weighed separately, not estimated." },
      { type:'h2', text:'5. You can negotiate' },
      { type:'p',  text:"Most sellers don't realise that gold buying is negotiable. If you know the margin the buyer is keeping (use our calculator), you have a number to push back on. A buyer keeping 14% will often come down to 10–11% if you simply ask — and know your numbers." },
    ],
  },
    {
    slug:            'how-is-gold-valued-step-by-step',
    title:           'How is gold valued? A simple step-by-step guide',
    excerpt:         "Walk through exactly how a buyer values your gold — and the four points where they quietly cheat you.",
    category:        'GOLD BASICS',
    readTime:        '3 MIN READ',
    date:            '23 May 2026',
    primaryCTA:      'whatsapp',
    midArticleNudge: true,
    body: [
      { type:'p',  text:"You walk into a shop with a 25g gold chain. What happens next decides how much money you take home — and most of it happens in steps you can't see. Here's the whole process, in plain language, with the exact points where buyers cheat." },
      { type:'h2', text:'Step 1: They weigh your gold' },
      { type:'p',  text:"First, your chain goes on a scale. Say it weighs 25 grams. This is the gross weight — everything together, gold plus any stones." },
      { type:'p',  text:"Where they cheat: if your chain has stones, the buyer estimates the stone weight instead of weighing it separately. They'll say your 25g chain has 4g of stones when it really has 2g — and you just lost 2g of gold value." },
      { type:'h2', text:'Step 2: They remove stone and wastage weight' },
      { type:'p',  text:"Buyers subtract the stone weight and a 'wastage' amount (gold supposedly lost when melting). On our 25g chain, take out 2g stones and 1g wastage — you're left with 22g of net weight. This 22g is what you actually get paid for." },
      { type:'p',  text:"Where they cheat: wastage should be tiny or zero with modern melting. Some buyers deduct 5–8% as wastage for no reason. On 25g, a 2g excess wastage deduction is roughly ₹2,000 gone." },
      { type:'nudge' },
      { type:'h2', text:'Step 3: They test the purity' },
      { type:'p',  text:"Your gold is checked on an XRF machine — a spectrometer that shows exactly how pure it is, like 91.6% for 22K. The machine displays the number on a screen." },
      { type:'p',  text:"Where they cheat: the buyer reads the screen, not you. The machine shows 91.6% but they tell you 89%. That 2.6% gap on 22g of gold is over ₹3,000 — and you'd never know. Always ask to see the screen yourself." },
      { type:'h2', text:"Step 4: They apply the day's rate" },
      { type:'p',  text:"Finally, they multiply your net weight by the purity by the day's gold rate. If 24K gold is ₹15,000 per gram, your 22g at 91.6% purity is worth roughly 22 × 0.916 × 15,000 = about ₹3,02,000 before any margin." },
      { type:'p',  text:"Where they cheat: they use an old rate from the morning when prices have risen, or quote a rate well below the live market price. A 3% lower rate on a ₹3,00,000 chain is ₹9,000 straight out of your pocket." },
      { type:'h2', text:'Putting it all together' },
      { type:'p',  text:"Four steps, four places to lose money: inflated stone weight, excess wastage, an understated purity reading, and a stale or low rate. Each one looks small. Together they can cost you 15–20% of your gold's real value." },
      { type:'p',  text:"The only way to catch it is to know what a fair number looks like before you walk in. Our margin calculator does that in 30 seconds — and factors in a few extra details for a precise figure. Then message us and we'll give you an offer you can compare against." },
    ],
  },

  {
    slug:            'why-gold-buyers-pay-less-than-spot',
    title:           'Why gold buyers pay less than today\'s rate',
    excerpt:         "Every buyer pays below the market rate. Here's exactly where the gap comes from — and the margin we keep, published.",
    category:        'OUR PRICING',
    readTime:        '5 MIN READ',
    date:            '29 Jul 2026',
    primaryCTA:      'margin',
    midArticleNudge: true,
    body: [
      { type:'p',  text:"Search 'gold rate today' and you'll get a number — somewhere around ₹14,000 per gram for 24K. Walk into a shop with a pair of bangles and the offer will be lower. Often noticeably lower. Most sellers read that gap as being cheated. Sometimes it is. Usually it isn't. But almost nobody in this trade will explain the gap in numbers, which is exactly why it feels like being cheated." },
      { type:'p',  text:"So here is the explanation, with our own arithmetic attached." },

      { type:'h2', text:'The rate you saw isn\'t the rate for your bangle' },
      { type:'p',  text:"The quoted rate is a benchmark for pure, refined, investment-grade gold — a 999 bar, in a vault, ready to trade. Your bangles are not that. They're roughly 91.6% gold by design, mixed with copper and silver for hardness, held together with solder that's a different alloy again, possibly set with stones, and shaped into something that has to be melted and refined before it becomes the thing the benchmark actually prices." },
      { type:'p',  text:"The distance between those two objects is the gap. It isn't one deduction, and it isn't all margin." },

      { type:'h2', text:'Where the gap actually comes from' },
      { type:'p',  text:"First, purity is measured, not assumed. A piece stamped 916 is nominally 91.6% gold. Tested, it's often slightly different — 91.2%, 91.4%, occasionally higher. Older pieces, pieces made outside the hallmarking regime, and pieces that have been repaired vary more, because solder joints are usually a lower-grade alloy than the body of the piece. This is why any buyer worth dealing with tests in front of you, and why you should never accept a price based on the stamp alone." },
      { type:'p',  text:"Second, jewellery isn't bullion yet. Before your gold can be sold at the benchmark rate it has to be assayed, melted and refined. That costs money, and it's a real cost the buyer carries, not a fee invented to take from you." },
      { type:'p',  text:"Third, the buyer's margin. We're a business. We buy below the rate and sell at or near it, and the difference funds the testing equipment, the premises, the staff, the insurance on holding other people's gold, and a profit. Every buyer has this margin. The only question worth asking is whether they'll tell you what it is. Ours is 3–5% below live spot, depending on the piece and the quantity." },
      { type:'p',  text:"For context, our own guides put a fair industry margin at 5–8%, and anything above 12% as a reason to walk away. We're publishing a number below the range we call fair, because the point of publishing it is that you can check it." },

      { type:'h2', text:'Our formula, written out' },
      { type:'p',  text:"Gross weight, minus stone and solder weight, gives net gold weight. Net gold weight multiplied by tested purity gives your pure gold content. Pure gold content multiplied by the live spot rate gives gross value. Take 3–5% off that, and you have your payout." },
      { type:'p',  text:"That's the whole thing. Five lines. There's nothing behind it. If a buyer can't write their own version of this on a piece of paper for you, that tells you something worth knowing." },

      { type:'nudge' },

      { type:'h2', text:'A worked example, every number shown' },
      { type:'p',  text:"A customer brings in a pair of 22K bangles with stone work. Figures below are illustrative — the rate moves daily." },
      { type:'p',  text:"The bangles weigh 47.200g on the scale. That's the gross weight. The stones and lac are removed and weighed separately: 3.400g. That leaves a net gold weight of 43.800g." },
      { type:'p',  text:"XRF puts the purity at 91.4%. So 43.800g at 91.4% gives 40.033g of actual pure gold." },
      { type:'p',  text:"With live spot at ₹14,300 per gram, that gold is worth about ₹5,72,500 gross. At a 4% margin, the payout is roughly ₹5,49,500." },
      { type:'p',  text:"Look at what happened at the top of that calculation. 47.2 grams of jewellery contained just over 40 grams of actual gold. That single line — gross weight versus pure gold content — accounts for more of the gap than our margin does, and it's the line most sellers have never had explained to them." },
      { type:'p',  text:"And for comparison: the same bangles at a 12% margin would pay about ₹5,03,700. That's a difference of roughly ₹45,800 on one transaction, for gold that was tested identically." },

      { type:'h2', text:'What we don\'t deduct' },
      { type:'p',  text:"Making charges. When you bought that piece you paid for the goldsmith's labour and the showroom's design. That value is real, but it doesn't survive melting — the labour is gone the moment the piece goes into the crucible. Some buyers deduct a further percentage for making charges on resale anyway. There's no basis for it, and we don't." },
      { type:'p',  text:"A separate wastage percentage. Modern refining recovers almost all of the gold that goes in. Buyers who deduct 5–8% as 'wastage' on top of their margin are charging you twice for the same thing. Our margin is the margin — there is no second deduction behind it under a different name." },
      { type:'p',  text:"Anything discovered after you've agreed. The number we quote after testing is the number you're paid. If something changes the calculation, you see it before you agree, not after." },
      { type:'p',  text:"The general principle: if you can't get a deduction explained in weight or percentage terms, it isn't a deduction — it's a discount being taken quietly." },

      { type:'h2', text:'How to check any offer, including ours' },
      { type:'p',  text:"You don't need a calculator for this. Ask the buyer for two numbers: your net gold weight and your tested purity. Multiply them, and you have your pure gold content in grams." },
      { type:'p',  text:"Now divide the offer by that number. What you get is the effective rate per gram of pure gold you're actually being paid. Compare it to the day's 24K rate. The difference, as a percentage, is the buyer's entire take — margin, refining, and anything they didn't mention, all in one honest number." },
      { type:'p',  text:"Run it on our offer. Run it on the shop down the road. It's the only comparison that means anything, because it strips out every difference in how deductions are named and just asks what you actually receive per gram of gold." },
      { type:'p',  text:"If a buyer won't give you the net weight and the purity reading, you can't run this check — and that refusal is your answer." },
    ],
  },
];

const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

const articleDate = (d) => {
  const [day, mon, year] = d.split(' ');
  return new Date(+year, MONTHS[mon] ?? 0, +day);
};

const ARTICLES_SORTED = [...ARTICLES].sort((a, b) => articleDate(b.date) - articleDate(a.date));

// ─── Blog Back Button ─────────────────────────────────────────────────────────
function BlogBackBtn({ navigate }) {
  return (
    <Link to="/blog" navigate={navigate} style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:C.gold, fontFamily:MONO, fontSize:'12px', fontWeight:500, padding:'18px 0 8px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      <ArrowLeft size={14} strokeWidth={2}/> Blog
    </Link>
  );
}

// ─── Blog Index Page (3-column grid, newest first) ────────────────────────────
function BlogIndexPage({ navigate, spot }) {
  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <TopBar spot={spot} navigate={navigate}/>
      <div style={{ height:'56px' }}/>
      <div className="cm-wrap" style={{ paddingBottom:'64px' }}>
        <BackBtn navigate={navigate}/>
        <div style={{ textAlign:'center', margin:'12px auto 36px', maxWidth:'720px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'14px' }}>
            <div style={{ height:'1px', width:'48px', background:C.gold, opacity:0.35 }}/>
            <div style={{ fontFamily:MONO, fontSize:'9px', letterSpacing:'0.2em', color:C.gold, textTransform:'uppercase' }}>· GOLD INSIGHTS ·</div>
            <div style={{ height:'1px', width:'48px', background:C.gold, opacity:0.35 }}/>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'clamp(30px, 4.5vw, 44px)', fontWeight:350, lineHeight:1.1, letterSpacing:'-0.02em', margin:0, color:C.ink }}>
            Everything you need to know<br/>before you sell your <span style={{ fontStyle:'italic', color:C.plum }}>gold</span>
          </h1>
        </div>
        <div className="blog-grid">
          {ARTICLES_SORTED.map(a => <BlogCard key={a.slug} a={a} navigate={navigate} clamp={3}/>)}
        </div>
      </div>
    </div>
  );
}

// ─── Blog Article Page ────────────────────────────────────────────────────────
function BlogArticlePage({ navigate, slug }) {
  const article = ARTICLES.find(a => a.slug === slug);

  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} | Carat Money`;
    setCanonical(`https://carat.money/blog/${article.slug}`);
    const em = (sel, attr, val, content) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    em('meta[name="description"]',        'name',     'description',    article.excerpt);
    em('meta[property="og:title"]',       'property', 'og:title',       `${article.title} | Carat Money`);
    em('meta[property="og:description"]', 'property', 'og:description', article.excerpt);
    em('meta[property="og:url"]',         'property', 'og:url',         `https://carat.money/blog/${article.slug}`);
    em('meta[property="og:type"]',        'property', 'og:type',        'article');
  }, [article]);

  if (!article) {
    return (
      <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', padding:'40px 18px' }}>
          <div style={{ fontFamily:SERIF, fontSize:'48px', fontWeight:350, color:C.gold2, marginBottom:'16px' }}>404</div>
          <div style={{ fontFamily:SERIF, fontSize:'22px', color:C.ink, marginBottom:'24px' }}>Article not found</div>
          <button onClick={() => navigate('/blog')} style={{ fontFamily:MONO, fontSize:'12px', color:C.gold, background:'none', border:`1px solid ${C.gold}`, borderRadius:'4px', padding:'10px 18px', cursor:'pointer', letterSpacing:'0.1em' }}>← BACK TO BLOG</button>
        </div>
      </div>
    );
  }

  const MidNudge = () => (
    <div onClick={() => navigate('/margin')} style={{ margin:'28px 0', padding:'18px 20px', background:`rgba(184,136,58,.08)`, border:`1px solid rgba(184,136,58,.2)`, borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
      <div>
        <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.16em', color:C.gold, marginBottom:'5px' }}>FREE TOOL</div>
        <div style={{ fontFamily:SERIF, fontSize:'16px', fontWeight:350, color:C.ink, lineHeight:1.3 }}>Already got a quote? Check your buyer's margin in 30 seconds →</div>
      </div>
    </div>
  );

  const renderBody = () => article.body.map((block, i) => {
    if (block.type === 'h2') return (
      <h2 key={i} style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, lineHeight:1.2, letterSpacing:'-0.02em', margin:'28px 0 12px', color:C.ink }}>{block.text}</h2>
    );
    if (block.type === 'p') return (
      <p key={i} style={{ fontSize:'16px', color:C.ink2, lineHeight:1.75, margin:'0 0 18px', fontFamily:SANS, fontWeight:400 }}>{block.text}</p>
    );
    if (block.type === 'nudge' && article.midArticleNudge) return <MidNudge key={i}/>;
    return null;
  });

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BlogBackBtn navigate={navigate}/>
        <PageHeader/>

        <div style={{ marginBottom:'28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.16em', color:C.gold, textTransform:'uppercase' }}>{article.category}</div>
            <div style={{ fontFamily:MONO, fontSize:'9px', color:C.mute, letterSpacing:'0.08em' }}>{article.readTime}</div>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'34px', fontWeight:350, lineHeight:1.08, letterSpacing:'-0.02em', margin:'0 0 14px', color:C.ink }}>{article.title}</h1>
          <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.06em', paddingBottom:'20px', borderBottom:`1px solid rgba(26,20,38,.08)` }}>
            Carat Money · {article.date}
          </div>
        </div>

        <div style={{ marginBottom:'36px' }}>{renderBody()}</div>

        {/* Bottom CTAs */}
        <div style={{ borderTop:`1px solid rgba(26,20,38,.08)`, paddingTop:'28px', marginBottom:'24px' }}>
          <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.16em', color:C.mute, marginBottom:'14px', textAlign:'center' }}>
            {article.primaryCTA === 'sell' ? 'READY TO SELL?' : 'READY TO CHECK YOUR BUYER?'}
          </div>
          {article.primaryCTA === 'whatsapp' ? (
            <>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I'd like to get an offer for my gold.")}`, '_blank')} style={{ width:'100%', padding:'15px 20px', background:C.gold2, color:C.plum, border:'none', borderRadius:'4px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', marginBottom:'10px', letterSpacing:'0.01em' }}>
                <MessageCircle size={16}/> Get an offer on WhatsApp
              </button>
              <button onClick={() => navigate('/margin')} style={{ width:'100%', padding:'14px 20px', background:'transparent', color:C.gold, border:`1.5px solid ${C.gold}`, borderRadius:'4px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', letterSpacing:'0.01em' }}>
                <TrendingDown size={16}/> Check your buyer's margin now
              </button>
            </>
          ) : article.primaryCTA === 'margin' ? (
            <>
              <button onClick={() => navigate('/margin')} style={{ width:'100%', padding:'15px 20px', background:C.gold2, color:C.plum, border:'none', borderRadius:'4px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', marginBottom:'10px', letterSpacing:'0.01em' }}>
                <TrendingDown size={16}/> Check your buyer's margin now
              </button>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I'd like to get a quote for my gold.")}`, '_blank')} style={{ width:'100%', padding:'14px 20px', background:'transparent', color:C.green, border:`1.5px solid ${C.green}`, borderRadius:'999px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', letterSpacing:'0.01em' }}>
                <MessageCircle size={16}/> Get a better offer on WhatsApp
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/sell')} style={{ width:'100%', padding:'15px 20px', background:C.gold2, color:C.plum, border:'none', borderRadius:'4px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', marginBottom:'10px', letterSpacing:'0.01em' }}>
                <MessageCircle size={16}/> Get your best price from Carat Money
              </button>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I'd like to get a quote for my gold.")}`, '_blank')} style={{ width:'100%', padding:'14px 20px', background:'transparent', color:C.green, border:`1.5px solid ${C.green}`, borderRadius:'999px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', letterSpacing:'0.01em' }}>
                <MessageCircle size={16}/> Get a better offer on WhatsApp
              </button>
            </>
          )}
        </div>
        
        {/* Article share */}
        <div style={{ background:C.plum, borderRadius:'8px', padding:'20px', border:`1px solid rgba(224,183,101,.2)`, textAlign:'center' }}>
          <div style={{ fontFamily:SERIF, fontSize:'18px', fontWeight:350, color:C.gold3, marginBottom:'6px', letterSpacing:'-0.02em' }}>Found this useful?</div>
          <div style={{ fontSize:'13px', color:`rgba(241,215,141,.6)`, marginBottom:'16px', lineHeight:1.55 }}>Share with someone selling gold soon.</div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title} — worth reading before you sell your gold:\nhttps://carat.money/blog/${article.slug}`)}`, '_blank')} style={{ flex:1, padding:'12px', background:C.green, color:C.white, border:'none', borderRadius:'999px', fontSize:'13px', fontWeight:600, fontFamily:SANS, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
              <MessageCircle size={14}/> WhatsApp
            </button>
            <button onClick={async () => { await copyToClipboard(`https://carat.money/blog/${article.slug}`); }} style={{ flex:1, padding:'12px', background:'transparent', color:C.gold2, border:`1px solid rgba(224,183,101,.4)`, borderRadius:'4px', fontSize:'13px', fontWeight:600, fontFamily:SANS, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
              <Copy size={14}/> Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sell Page ────────────────────────────────────────────────────────────────
function SellPage({ navigate, spot }) {
  const [name, setName]     = useState('');
  const [mobile, setMobile] = useState('');
  const [weight, setWeight] = useState('');
  const [city, setCity]     = useState('');
  const setMobileG  = v => setMobile(v.replace(/\D/g,'').slice(0,10));
  const mobileValid = mobile.length === 10 && /^[6-9]/.test(mobile);
  const canSubmit   = mobileValid && name.trim().length >= 2 && parseNum(weight) > 0;
  const onSubmit = () => {
    if (!canSubmit) return;
    const lines = ["Hi Carat Money — I'd like to sell my gold.",'',`Name: ${name.trim()}`,`Phone: +91${mobile}`,`Approx. weight: ${weight}g`];
    if (city.trim()) lines.push(`City: ${city.trim()}`);
    lines.push('','Please send me a quote.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank');
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <TopBar spot={spot} navigate={navigate}/>
      <div style={{ height:'56px' }}/>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BackBtn navigate={navigate}/>
        <PageHeader/>
        <div style={{ textAlign:'center', padding:'12px 0 24px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'32px', fontWeight:350, lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 8px', color:C.ink }}>
            Sell your gold to <span style={{ fontStyle:'italic', color:C.plum }}>Carat Money</span>
          </h1>
          <p style={{ fontSize:'15px', color:C.mute, lineHeight:1.55, margin:0 }}>Share your details and we'll reach out on WhatsApp.</p>
        </div>
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>Your Details</Eyebrow>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Full name</label>
            <input type="text" placeholder="e.g. Priya S" value={name} onChange={e=>setName(e.target.value)} style={INP}/>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Mobile number</label>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', border:`1.5px solid rgba(26,20,38,.18)`, overflow:'hidden' }}>
              <span style={{ padding:'13px 12px 13px 14px', fontSize:'16px', color:C.mute, fontWeight:500, borderRight:`1px solid rgba(26,20,38,.12)`, flexShrink:0, fontFamily:SANS }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={{ ...INP, border:'none', borderRadius:0, flex:1, minWidth:0 }}/>
            </div>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Approx. gross weight</label>
            <div style={{ position:'relative' }}>
              <input type="number" inputMode="decimal" placeholder="e.g. 25" value={weight} onChange={e=>setWeight(e.target.value)} style={{ ...INP, paddingRight:'58px' }}/>
              <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:C.mute, fontSize:'13px', fontWeight:500, pointerEvents:'none', fontFamily:MONO }}>grams</span>
            </div>
          </div>
          <div>
            <label style={LBL}>City <span style={{ color:C.mute, fontWeight:400, fontSize:'13px' }}>(optional)</span></label>
            <input type="text" placeholder="e.g. Bangalore" value={city} onChange={e=>setCity(e.target.value)} style={INP}/>
          </div>
        </Card>
        <Card dark style={{ marginBottom:'14px' }}>
          <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', marginBottom:'18px' }}>Get your WhatsApp quote</div>
          <BtnWhatsApp onClick={onSubmit} disabled={!canSubmit}>
            <MessageCircle size={18}/> Send details on WhatsApp
          </BtnWhatsApp>
          <div style={{ fontSize:'12px', color:`rgba(241,215,141,.4)`, marginTop:'12px', textAlign:'center', lineHeight:1.5, fontFamily:MONO, letterSpacing:'0.04em' }}>
            By submitting, you agree to be contacted about your gold sale.
          </div>
        </Card>
        <div style={{ fontFamily:SERIF, fontSize:'13px', color:C.mute, textAlign:'center', lineHeight:1.7, fontStyle:'italic' }}>
          We'll reach out within a few hours to schedule a visit.
        </div>
      </div>
    </div>
  );
}

// ─── Open Box Modal ───────────────────────────────────────────────────────────
function OpenBoxModal({ onClose }) {
  const Step = ({ icon, title, desc }) => (
    <div style={{ display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'22px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'6px', background:C.paper2, border:`1px solid rgba(184,136,58,.2)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:C.gold }}>{icon}</div>
      <div>
        <div style={{ fontFamily:SANS, fontSize:'16px', fontWeight:600, color:C.ink, marginBottom:'4px' }}>{title}</div>
        <div style={{ fontSize:'14px', color:C.mute, lineHeight:1.55 }}>{desc}</div>
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(22,18,31,.6)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .25s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.paper, borderRadius:'10px 10px 0 0', width:'100%', maxWidth:'520px', maxHeight:'92vh', overflowY:'auto', padding:'28px 24px 32px', animation:'slideUp .3s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', gap:'12px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, margin:0, lineHeight:1.15, color:C.ink, letterSpacing:'-0.02em' }}>How Open Box Delivery Works</h2>
          <button onClick={onClose} style={{ background:C.paper2, border:'none', borderRadius:'50%', width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.mute, flexShrink:0 }}><X size={16}/></button>
        </div>
        <p style={{ fontSize:'14px', color:C.mute, lineHeight:1.55, marginTop:0, marginBottom:'26px' }}>
          We'll open the package at your doorstep so you can check the product before accepting it.
        </p>
        <Step icon={<KeyRound size={22} strokeWidth={2}/>}    title="Share OTP to start"     desc="Give the start OTP to the delivery partner to begin verification."/>
        <Step icon={<Search size={22} strokeWidth={2}/>}      title="Check the product"      desc="Make sure the product and packaging look right and in good condition."/>
        <Step icon={<ShieldCheck size={22} strokeWidth={2}/>} title="Confirm with final OTP" desc="Share the final OTP only if everything's fine. If not, hand it back to the delivery partner."/>
        <div style={{ padding:'14px 16px', background:`rgba(184,136,58,.1)`, borderRadius:'6px', display:'flex', gap:'10px', alignItems:'flex-start', border:`1px solid rgba(184,136,58,.2)` }}>
          <AlertCircle size={18} color={C.gold} style={{ flexShrink:0, marginTop:'2px' }}/>
          <div style={{ fontSize:'13px', color:C.ink2, lineHeight:1.5, fontWeight:500 }}>
            Open box delivery orders are checked during delivery, so once they are accepted, they can't be returned.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Buy Page ─────────────────────────────────────────────────────────────────
function BuyPage({ navigate }) {
  const [qty, setQty]                 = useState({'0.1':0,'0.5':0,'1':0});
  const [name, setName]               = useState('');
  const [mobile, setMobile]           = useState('');
  const [pincode, setPincode]         = useState('');
  const [address, setAddress]         = useState('');
  const [showOpenBox, setShowOpenBox] = useState(false);

  const prices = { '0.1':Math.round(BUY_RATE_24K*0.1), '0.5':Math.round(BUY_RATE_24K*0.5), '1':Math.round(BUY_RATE_24K) };
  const totalCoins  = qty['0.1']+qty['0.5']+qty['1'];
  const totalAmount = qty['0.1']*prices['0.1']+qty['0.5']*prices['0.5']+qty['1']*prices['1'];
  const setQ        = (size, delta) => setQty(prev => ({...prev,[size]:Math.max(0,Math.min(99,prev[size]+delta))}));
  const setMobileG  = v => setMobile(v.replace(/\D/g,'').slice(0,10));
  const setPincodeG = v => setPincode(v.replace(/\D/g,'').slice(0,6));
  const mobileValid = mobile.length===10 && /^[6-9]/.test(mobile);
  const canSubmit   = mobileValid && pincode.length===6 && name.trim().length>=2 && address.trim().length>=8 && totalCoins>0;

  const onSubmit = () => {
    if (!canSubmit) return;
    const lines = ['Hi Carat Money — I want to buy gold coins.',''];
    if (qty['1']>0)   lines.push(`${qty['1']} × 1g coin · ₹${fmt(qty['1']*prices['1'],0)}`);
    if (qty['0.5']>0) lines.push(`${qty['0.5']} × 0.5g coin · ₹${fmt(qty['0.5']*prices['0.5'],0)}`);
    if (qty['0.1']>0) lines.push(`${qty['0.1']} × 0.1g coin · ₹${fmt(qty['0.1']*prices['0.1'],0)}`);
    lines.push('',`Total: ₹${fmt(totalAmount,0)} (${totalCoins} coins)`,'');
    lines.push(`Name: ${name.trim()}`,`Phone: +91${mobile}`,`Pincode: ${pincode}`,`Address: ${address.trim()}`,'','Please confirm availability and delivery.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank');
  };

  const StepperRow = ({ size, label }) => {
    const count = qty[size], sub = count*prices[size];
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 0', borderTop:`1px solid rgba(26,20,38,.08)` }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'16px', fontWeight:600, color:C.ink, marginBottom:'2px' }}>{label}</div>
          <div style={{ fontFamily:MONO, fontSize:'12px', color:C.mute }}>₹{fmt(prices[size],0)} each · incl. GST</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
          <button onClick={()=>setQ(size,-1)} disabled={count===0} style={{ width:'36px', height:'36px', borderRadius:'4px', background:count===0?C.paper2:C.paper, border:`1.5px solid rgba(26,20,38,.15)`, color:count===0?C.mute:C.plum, display:'flex', alignItems:'center', justifyContent:'center', cursor:count===0?'not-allowed':'pointer', opacity:count===0?.4:1 }}>
            <Minus size={16} strokeWidth={2.5}/>
          </button>
          <span style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.ink, minWidth:'24px', textAlign:'center' }}>{count}</span>
          <button onClick={()=>setQ(size,+1)} style={{ width:'36px', height:'36px', borderRadius:'4px', background:C.paper, border:`1.5px solid rgba(26,20,38,.15)`, color:C.plum, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Plus size={16} strokeWidth={2.5}/>
          </button>
        </div>
        <div style={{ fontFamily:SERIF, fontSize:'16px', fontWeight:350, color:sub>0?C.ink:C.paper2, minWidth:'80px', textAlign:'right' }}>
          {sub>0?`₹${fmt(sub,0)}`:'—'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BackBtn navigate={navigate}/>
        <PageHeader/>
        <div style={{ textAlign:'center', padding:'12px 0 24px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'32px', fontWeight:350, lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 8px' }}>
            Buy <span style={{ fontStyle:'italic', color:C.plum }}>24K</span> gold coins
          </h1>
          <p style={{ fontSize:'15px', color:C.mute, lineHeight:1.55, margin:0 }}>BIS-hallmarked · 999.9 purity · 48-hr open-box return</p>
        </div>
        <Card style={{ marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'6px' }}>
            <Eyebrow>Today's Coin Prices</Eyebrow>
            <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.06em' }}>Updated {BUY_RATE_DATE}</div>
          </div>
          <StepperRow size="0.1" label="0.1g coin"/>
          <StepperRow size="0.5" label="0.5g coin"/>
          <StepperRow size="1"   label="1g coin"/>
          {totalCoins>0 ? (
            <div style={{ marginTop:'16px', padding:'16px', background:C.plum, borderRadius:'6px', border:`1px solid rgba(224,183,101,.2)` }}>
              <Eyebrow light>Order Total</Eyebrow>
              <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'8px' }}>
                <span style={{ fontFamily:SERIF, fontSize:'32px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(totalAmount,0)}</span>
                <span style={{ fontFamily:MONO, fontSize:'12px', color:`rgba(241,215,141,.5)` }}>· {totalCoins} {totalCoins===1?'coin':'coins'}</span>
              </div>
              <div style={{ fontFamily:SANS, fontSize:'13px', color:`rgba(241,215,141,.6)`, lineHeight:1.7 }}>
                {qty['1']>0&&<>{qty['1']} × 1g (₹{fmt(qty['1']*prices['1'],0)})</>}
                {qty['1']>0&&(qty['0.5']>0||qty['0.1']>0)&&' + '}
                {qty['0.5']>0&&<>{qty['0.5']} × 0.5g (₹{fmt(qty['0.5']*prices['0.5'],0)})</>}
                {qty['0.5']>0&&qty['0.1']>0&&' + '}
                {qty['0.1']>0&&<>{qty['0.1']} × 0.1g (₹{fmt(qty['0.1']*prices['0.1'],0)})</>}
              </div>
            </div>
          ) : (
            <div style={{ marginTop:'16px', padding:'14px', background:C.paper2, borderRadius:'6px', fontFamily:MONO, fontSize:'12px', color:C.mute, textAlign:'center', letterSpacing:'0.06em' }}>
              Tap + to add coins to your order
            </div>
          )}
          <div style={{ marginTop:'14px', padding:'14px', background:`rgba(184,136,58,.08)`, borderRadius:'6px', fontFamily:SANS, fontSize:'13px', color:C.mute, lineHeight:1.6, textAlign:'center', border:`1px solid rgba(184,136,58,.15)` }}>
            Need a custom coin?{' '}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I'm interested in a custom gold coin.")}`} target="_blank" rel="noreferrer" style={{ color:C.gold, fontWeight:600, textDecoration:'none' }}>WhatsApp us</a>
            {' '}to discuss specific weights or designs.
          </div>
        </Card>
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>Delivery Details</Eyebrow>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Full name</label>
            <input type="text" placeholder="e.g. Priya S" value={name} onChange={e=>setName(e.target.value)} style={INP}/>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Mobile number</label>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', border:`1.5px solid rgba(26,20,38,.18)`, overflow:'hidden' }}>
              <span style={{ padding:'13px 12px 13px 14px', fontSize:'16px', color:C.mute, fontWeight:500, borderRight:`1px solid rgba(26,20,38,.12)`, flexShrink:0, fontFamily:SANS }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={{ ...INP, border:'none', borderRadius:0, flex:1, minWidth:0 }}/>
            </div>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Pincode</label>
            <input type="tel" inputMode="numeric" placeholder="6-digit pincode" value={pincode} onChange={e=>setPincodeG(e.target.value)} style={INP}/>
          </div>
          <div>
            <label style={LBL}>Delivery address</label>
            <textarea placeholder="House / Flat no, street, area, city" value={address} onChange={e=>setAddress(e.target.value)} rows={3} style={{ ...INP, resize:'vertical', minHeight:'90px', fontFamily:SANS }}/>
          </div>
        </Card>
        <Card dark style={{ marginBottom:'14px' }}>
          <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', marginBottom:'18px' }}>Place your order</div>
          <BtnWhatsApp onClick={onSubmit} disabled={!canSubmit}>
            <MessageCircle size={18}/> Send order on WhatsApp
          </BtnWhatsApp>
          <div style={{ fontSize:'12px', color:`rgba(241,215,141,.4)`, marginTop:'12px', textAlign:'center', lineHeight:1.5, fontFamily:MONO, letterSpacing:'0.04em' }}>
            We'll confirm availability and arrange delivery.
          </div>
        </Card>
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>Why Carat Money</Eyebrow>
          {[
            { icon:<Shield size={16} strokeWidth={2}/>, text:'BIS-hallmarked, 999.9 purity', tip:false },
            { icon:<Check size={16} strokeWidth={2}/>,  text:'48-hour open-box delivery',    tip:true  },
            { icon:<Check size={16} strokeWidth={2}/>,  text:'Assay certificate included',   tip:false },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderTop:i===0?'none':`1px solid rgba(26,20,38,.08)` }}>
              <span style={{ color:C.gold, flexShrink:0, display:'inline-flex' }}>{item.icon}</span>
              <span style={{ fontSize:'15px', color:C.ink, flex:1 }}>{item.text}</span>
              {item.tip && <span onClick={()=>setShowOpenBox(true)} style={{ fontFamily:MONO, fontSize:'12px', color:C.gold, cursor:'pointer', userSelect:'none' }}>ⓘ</span>}
            </div>
          ))}
        </Card>
        <div style={{ fontFamily:MONO, fontSize:'11px', color:C.mute, textAlign:'center', lineHeight:1.8, letterSpacing:'0.06em' }}>
          Coin prices include 3% GST · Free doorstep delivery within Bangalore
        </div>
      </div>
      {showOpenBox && <OpenBoxModal onClose={()=>setShowOpenBox(false)}/>}
    </div>
  );
}

// ─── Share Section ────────────────────────────────────────────────────────────
function ShareSection() {
  const [copied, setCopied] = useState(false);
  const url  = typeof window!=='undefined' ? `${window.location.origin}/margin` : '';
  const text = `Found this free tool that shows you what gold buyers keep as margin above the spot rate. Saved me from a bad deal — try it before you sell:\n${url}`;
  const onWA   = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank');
  const onCopy = async () => { const ok=await copyToClipboard(url); if(ok){setCopied(true);setTimeout(()=>setCopied(false),2000);} };
  return (
    <div style={{ background:C.plum, borderRadius:'8px', padding:'24px', border:`1px solid rgba(224,183,101,.2)`, marginBottom:'14px', textAlign:'center', animation:'fadeSlide .5s ease-out' }}>
      <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, marginBottom:'6px', letterSpacing:'-0.02em' }}>Found this useful?</div>
      <div style={{ fontSize:'14px', color:`rgba(241,215,141,.6)`, marginBottom:'20px', lineHeight:1.55 }}>Share with friends or family who might be selling gold soon.</div>
      <div style={{ display:'flex', gap:'10px' }}>
        <button onClick={onWA} style={{ flex:1, padding:'13px', background:C.green, color:C.white, border:'none', borderRadius:'999px', fontSize:'14px', fontWeight:600, fontFamily:SANS, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer', boxShadow:'0 4px 14px rgba(37,211,102,.3)' }}>
          <MessageCircle size={15}/> WhatsApp
        </button>
        <button onClick={onCopy} style={{ flex:1, padding:'13px', background:'transparent', color:C.gold2, border:`1px solid rgba(224,183,101,.4)`, borderRadius:'4px', fontSize:'14px', fontWeight:600, fontFamily:SANS, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
          {copied?<><Check size={15}/>Copied</>:<><Copy size={15}/>Copy link</>}
        </button>
      </div>
    </div>
  );
}

// ─── Floating Share Button ────────────────────────────────────────────────────
function FloatingShareButton({ highlighted }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const [pulsed, setPulsed] = useState(false);

  useEffect(() => {
    if (highlighted && !pulsed) setPulsed(true);
  }, [highlighted]);

  const url  = typeof window!=='undefined' ? `${window.location.origin}/margin` : '';
  const text = `Found this free tool that shows you what gold buyers keep as margin above the spot rate. Saved me from a bad deal — try it before you sell:\n${url}`;
  const onWA   = () => { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank'); setOpen(false); };
  const onCopy = async () => { const ok=await copyToClipboard(url); if(ok){setCopied(true);setTimeout(()=>{setCopied(false);setOpen(false);},1500);} };

  const btnStyle = highlighted ? {
    background: C.gold2, color: C.plum,
    border: `1px solid ${C.gold}`,
    animation: pulsed ? 'glowPulse 0.6s ease-out 1' : 'none',
    boxShadow: '0 6px 20px rgba(224,183,101,.35)',
  } : {
    background: `rgba(43,20,80,.7)`, color: `rgba(241,215,141,.5)`,
    border: `1px solid rgba(224,183,101,.15)`,
    boxShadow: '0 4px 14px rgba(43,20,80,.2)',
  };

  return (
    <>
      {open && <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(22,18,31,.3)', animation:'fadeIn .2s ease' }}/>}
      <div style={{ position:'fixed', bottom:'20px', left:'20px', zIndex:100, display:'flex', flexDirection:'column-reverse', gap:'10px', alignItems:'flex-start' }}>
        <button onClick={()=>setOpen(v=>!v)} style={{ padding:'12px 18px', borderRadius:'4px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:MONO, fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', transition:'background .4s, color .4s, box-shadow .4s', ...btnStyle }}>
          <Share2 size={14} strokeWidth={2}/>
          {highlighted ? 'SHARE THIS RESULT' : 'SHARE TOOL'}
        </button>
        {open && <>
          <button onClick={onWA} style={{ background:C.green, color:C.white, padding:'11px 16px', borderRadius:'999px', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:SANS, fontSize:'13px', fontWeight:600, boxShadow:'0 4px 14px rgba(37,211,102,.3)', animation:'fadeSlide .25s ease-out' }}>
            <MessageCircle size={14}/> WhatsApp
          </button>
          <button onClick={onCopy} style={{ background:C.plum, color:C.gold2, padding:'11px 16px', borderRadius:'4px', border:`1px solid rgba(224,183,101,.3)`, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:MONO, fontSize:'12px', fontWeight:500, animation:'fadeSlide .25s ease-out' }}>
            {copied?<><Check size={14}/>COPIED</>:<><Copy size={14}/>COPY LINK</>}
          </button>
        </>}
      </div>
    </>
  );
}

// ─── Margin Page ──────────────────────────────────────────────────────────────
function MarginPage({ navigate, spot }) {
  const calcRate = spot.raw ?? SPOT_FALLBACK;

  const [ornaments,     setOrnaments]     = useState(()=>[blankOrnament()]);
  const [serviceFee,    setServiceFee]    = useState('');
  const [revisedTotal,  setRevisedTotal]  = useState('');
  const [mobile,        setMobile]        = useState('');
  const [collapsed,     setCollapsed]     = useState(new Set());
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isMulti = ornaments.length > 1;
  const feeN    = parseNum(serviceFee) ?? 0;
  const revN    = parseNum(revisedTotal);

  const ornamentData = useMemo(() => ornaments.map(o => {
    const g=parseNum(o.gross), s=parseNum(o.stone)??0, w=parseNum(o.wastage)??0, p=parseNum(o.purity), ppg=parseNum(o.pricePerGram);
    const netWeight=g!==null?g-s-w:null, netError=g!==null&&netWeight!==null&&netWeight<=0;
    const isValid=netWeight!==null&&netWeight>0&&p!==null&&p>0&&p<=100&&ppg!==null&&ppg>0;
    let purchaseContrib=null,salesContrib=null,effRate=null;
    if(isValid){const purity=p/100,recoverable=netWeight+STONE_RECOVERY*s+WASTAGE_RECOVERY*w;purchaseContrib=netWeight*ppg;salesContrib=recoverable*purity*calcRate;effRate=ppg/purity;}
    return {id:o.id,gross:g,stone:s,wastage:w,purity:p,ppg,netWeight,netError,isValid,purchaseContrib,salesContrib,effRate};
  }), [ornaments, calcRate]);

  const margin1 = useMemo(() => {
    const valid=ornamentData.filter(d=>d.isValid); if(!valid.length)return null;
    const fee=feeN/100,sumPR=valid.reduce((a,d)=>a+d.purchaseContrib,0),sumS=valid.reduce((a,d)=>a+d.salesContrib,0),sumNP=valid.reduce((a,d)=>a+d.netWeight*(d.purity/100),0),pt=sumPR*(1-fee);
    const value=(1-pt/sumS)*100;
    if(!isFinite(value)||isNaN(value))return null;
    return {value,eff:pt/sumNP,total:pt,purchase_total:pt,sales_total:sumS,ornamentCount:valid.length,totalNetWeight:valid.reduce((a,d)=>a+d.netWeight,0)};
  }, [ornamentData, feeN]);

  const [shareHighlighted, setShareHighlighted] = useState(false);
  const marginCardRef = useRef(null);
  useEffect(() => {
    if (!marginCardRef.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio > 0.5 && margin1 !== null) setShareHighlighted(true);
    }, { threshold: [0, 0.5] });
    io.observe(marginCardRef.current);
    return () => io.disconnect();
  }, [margin1]);

  const margin2 = useMemo(() => {
    if(revN===null||revN<=0)return null;
    const valid=ornamentData.filter(d=>d.isValid); if(!valid.length)return null;
    const sumS=valid.reduce((a,d)=>a+d.salesContrib,0),sumNP=valid.reduce((a,d)=>a+d.netWeight*(d.purity/100),0);
    return {value:(1-revN/sumS)*100,eff:revN/sumNP,total:revN,purchase_total:revN,sales_total:sumS};
  }, [revN, ornamentData]);

  const lotSummary = useMemo(() => {
    const w=ornamentData.filter(d=>d.netWeight!==null&&d.netWeight>0); if(!w.length)return null;
    return {ornamentCount:ornaments.length,totalGross:w.reduce((a,d)=>a+d.gross,0),totalNet:w.reduce((a,d)=>a+d.netWeight,0)};
  }, [ornamentData, ornaments.length]);

  const showLotSticky = isMulti && lotSummary !== null && margin1 === null;
  const stickyVisible = margin1 !== null || showLotSticky;

  const [activeSection, setActiveSection] = useState('first');
  const revisedObserverRef = useRef(null);
  const attachRevisedObserver = useCallback(node => {
    if(revisedObserverRef.current){revisedObserverRef.current.disconnect();revisedObserverRef.current=null;}
    if(!node)return;
    const io=new IntersectionObserver(([e])=>setActiveSection(e.intersectionRatio>0.35?'revised':'first'),{threshold:[0,.35,.6]});
    io.observe(node); revisedObserverRef.current=io;
  }, []);
  useEffect(() => ()=>revisedObserverRef.current?.disconnect(), []);

  const anyNetError = ornamentData.some(d=>d.netError);
  const progressText = (() => {
    if(anyNetError) return "Stone + wastage can't exceed gross.";
    if(margin1!==null) return null;
    if(!isMulti){const d=ornamentData[0],missing=3-[d.gross,d.purity,d.ppg].filter(v=>v!==null&&v>0).length;
      if(missing===3)return"Fill in what your buyer told you.";if(missing===2)return"Keep going — 2 more fields.";if(missing===1)return"Almost there. One last field.";}
    return "Complete at least one ornament to see the margin.";
  })();
  const filled = !isMulti ? [ornamentData[0].gross,ornamentData[0].purity,ornamentData[0].ppg].filter(v=>v!==null&&v>0).length : 0;

  const tone = v => {
    if(v==null||isNaN(v)||!isFinite(v)) return{fg:C.mute,bg:C.paper2,label:''};
    if(v<0)  return{fg:'#991B1B',bg:'#FEE2E2',label:'Above spot — verify this'};
    if(v<6)  return{fg:'#15803D',bg:'#DCFCE7',label:'Fair margin'};
    if(v<10) return{fg:'#B45309',bg:'#FEF3C7',label:'On the higher side'};
    if(v<15) return{fg:'#B91C1C',bg:'#FEE2E2',label:'High — push back'};
    return       {fg:'#991B1B',bg:'#FEE2E2',label:'Very high — push back hard'};
  };

  const updateOrnament = (id,field,value) => setOrnaments(prev=>prev.map(o=>o.id===id?{...o,[field]:value}:o));
  const addOrnament = () => {
    if(ornaments.length>=MAX_ORNAMENTS)return;
    const vids=ornamentData.filter(d=>d.isValid).map(d=>d.id);
    setCollapsed(prev=>new Set([...prev,...vids]));
    setOrnaments(prev=>[...prev,blankOrnament()]);
  };
  const removeOrnament = id => {
    if(ornaments.length<=1)return;
    setOrnaments(prev=>prev.filter(o=>o.id!==id));
    setCollapsed(prev=>{const n=new Set(prev);n.delete(id);return n;});
  };
  const toggleCollapse = id => setCollapsed(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});
  const setWeightF = (id,field,v) => {if(v==='')return updateOrnament(id,field,'');const n=parseFloat(v);if(isNaN(n)||n<0)return;updateOrnament(id,field,v);};
  const setPurityF = (id,v) => {if(v==='')return updateOrnament(id,'purity','');const n=parseFloat(v);if(isNaN(n)||n<0||n>100)return;updateOrnament(id,'purity',v);};
  const setPriceF  = (id,v) => {if(v==='')return updateOrnament(id,'pricePerGram','');const[i]=String(v).split('.');if(i.replace('-','').length>5)return;const n=parseFloat(v);if(isNaN(n)||n<0)return;updateOrnament(id,'pricePerGram',v);};
  const setFeeG    = v => {if(v==='')return setServiceFee('');const n=parseFloat(v);if(isNaN(n)||n<0||n>10)return;setServiceFee(v);};
  const setRevG    = v => {if(v==='')return setRevisedTotal('');const n=parseFloat(v);if(isNaN(n)||n<0)return;setRevisedTotal(v);};
  const setMobileG  = v => setMobile(v.replace(/\D/g,'').slice(0,10));
  const mobileValid = mobile.length===10 && /^[6-9]/.test(mobile);

  const onCTA = () => {
    if(!mobileValid)return;
    const body=['Hi Carat Money — I used the margin checker.',''];
    if(isMulti&&margin1){body.push(`Lot: ${margin1.ornamentCount} ornaments · ${fmt(margin1.totalNetWeight)}g net`);ornamentData.filter(d=>d.isValid).forEach((d,i)=>body.push(`  ${i+1}. ${fmt(d.netWeight)}g net · ${d.purity}% · ₹${fmt(d.ppg,0)}/g`));}
    else{const d=ornamentData[0];body.push(`Gross: ${d.gross??'—'}g · Stone: ${d.stone}g · Wastage: ${d.wastage}g`,`Net: ${d.netWeight?fmt(d.netWeight):'—'}g @ ${d.purity??'—'}% purity`,`Buyer's offer: ₹${d.ppg?fmt(d.ppg,0):'—'}/g`);}
    body.push(`Service fee: ${feeN}%`);
    if(margin1)body.push(`Buyer quote: ${margin1.value.toFixed(1)}% margin · ₹${fmt(margin1.total,0)}`);
    if(revN)body.push(`Revised offer: ₹${fmt(revN,0)} total`);
    if(margin2)body.push(`Revised margin: ${margin2.value.toFixed(1)}%`);
    body.push('',`My number: +91${mobile}`,'Would like a better quote, please.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body.join('\n'))}`,'_blank');
  };

  const t1 = tone(margin1?.value);
  const t2 = tone(margin2?.value);
  const collapsedSummary = d => !d.isValid ? 'Incomplete' : `${fmt(d.netWeight)}g · ${d.purity}% · ₹${fmt(d.ppg,0)}/g`;

  const fldRow  = { marginBottom:'18px' };
  const labRow  = { display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'7px', gap:'8px' };
  const lab     = { fontSize:'14px', fontWeight:600, color:C.ink2, fontFamily:SANS };
  const unt     = { fontFamily:MONO, fontSize:'11px', color:C.mute, letterSpacing:'0.04em', textAlign:'right' };
  const rdOnly  = { background:C.paper2, color:C.ink, fontWeight:600, border:`1.5px dashed rgba(26,20,38,.2)`, fontSize:'16px', padding:'13px 14px', borderRadius:'4px', minHeight:'48px', display:'flex', alignItems:'center', boxSizing:'border-box' };
  const errStyle= { borderColor:'#DC2626', color:'#DC2626' };
  const errTxt  = { fontSize:'13px', color:'#DC2626', marginTop:'6px', fontWeight:500 };
  const pfxWrap = { position:'relative' };
  const pfx     = { position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:C.mute, fontWeight:500, pointerEvents:'none', fontFamily:SANS };

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink, paddingTop:'56px' }}>
      <TopBar spot={spot} navigate={navigate}/>

      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BackBtn navigate={navigate}/>
        <PageHeader/>

        <div style={{ textAlign:'center', padding:'10px 0 24px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'34px', fontWeight:350, lineHeight:1.08, letterSpacing:'-0.02em', margin:'0 0 10px', color:C.ink }}>
            Is your gold buyer <span style={{ fontStyle:'italic', color:C.plum }}>cheating you?</span>
          </h1>
          <p style={{ fontSize:'15px', color:C.mute, marginTop:0, lineHeight:1.55, maxWidth:'400px', marginLeft:'auto', marginRight:'auto' }}>
            Check your gold buyer's margin. See exactly what they're keeping above today's spot price.
          </p>
        </div>

        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>{isMulti ? `Your Lot · ${ornaments.length} Ornaments` : 'What Your Buyer Told You'}</Eyebrow>
          {ornaments.map((o,idx) => {
            const d=ornamentData[idx], isCollapsed=isMulti&&collapsed.has(o.id);
            return (
              <div key={o.id} style={{ paddingTop:idx===0?0:'20px', marginTop:idx===0?0:'20px', borderTop:idx===0?'none':`1px solid rgba(26,20,38,.08)` }}>
                {isMulti && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:isCollapsed?0:'16px', cursor:'pointer', userSelect:'none' }} onClick={()=>toggleCollapse(o.id)}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'22px', height:'22px', borderRadius:'50%', background:C.paper2, color:C.plum, fontFamily:SERIF, fontSize:'12px', fontWeight:350, flexShrink:0 }}>{idx+1}</div>
                    <span style={{ fontSize:'14px', fontWeight:600, color:C.ink }}>Ornament {idx+1}</span>
                    {isCollapsed && <span style={{ fontSize:'13px', color:C.mute, marginLeft:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>· {collapsedSummary(d)}</span>}
                    <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                      <button style={{ background:'transparent', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer', color:C.mute, display:'inline-flex', alignItems:'center' }} onClick={e=>{e.stopPropagation();toggleCollapse(o.id);}}>
                        {isCollapsed?<ChevronDown size={16}/>:<ChevronUp size={16}/>}
                      </button>
                      {ornaments.length>1 && <button style={{ background:'transparent', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer', color:C.mute, display:'inline-flex', alignItems:'center' }} onClick={e=>{e.stopPropagation();removeOrnament(o.id);}}><Trash2 size={15}/></button>}
                    </span>
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div style={fldRow}>
                      <div style={labRow}><label style={lab}>Gross weight</label><span style={unt}>grams · weighing scale</span></div>
                      <input type="number" inputMode="decimal" placeholder="e.g. 10.25" value={o.gross} onChange={e=>setWeightF(o.id,'gross',e.target.value)} style={INP}/>
                    </div>
                    <div style={{ display:'flex', gap:'10px', marginBottom:'18px' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={labRow}><label style={lab}>Stone</label><span style={unt}>g</span></div>
                        <input type="number" inputMode="decimal" placeholder="0" value={o.stone} onChange={e=>setWeightF(o.id,'stone',e.target.value)} style={INP}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={labRow}><label style={lab}>Wastage</label><span style={unt}>g</span></div>
                        <input type="number" inputMode="decimal" placeholder="0" value={o.wastage} onChange={e=>setWeightF(o.id,'wastage',e.target.value)} style={INP}/>
                      </div>
                    </div>
                    <div style={fldRow}>
                      <div style={labRow}><label style={lab}>Net weight</label><span style={unt}>auto-calculated</span></div>
                      <div style={{...rdOnly,...(d.netError?errStyle:{})}}>{d.netWeight!==null?fmt(d.netWeight):'—'}</div>
                      {d.netError && <div style={errTxt}>Net weight must be greater than zero.</div>}
                    </div>
                    <div style={fldRow}>
                      <div style={labRow}><label style={lab}>Purity</label><span style={unt}>% · 2 decimals</span></div>
                      <input type="number" inputMode="decimal" placeholder="e.g. 91.60" step="0.01" value={o.purity} onChange={e=>setPurityF(o.id,e.target.value)} style={INP}/>
                      <div style={{ fontFamily:SANS, fontSize:'13px', color:C.mute, marginTop:'7px', lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:'5px' }}>
                        <Info size={13} style={{ flexShrink:0, marginTop:'1px' }}/><span>Ask the buyer to show you the exact reading on their purity machine.</span>
                      </div>
                    </div>
                    <div style={{ marginBottom:0 }}>
                      <div style={labRow}><label style={lab}>Purchase price per gram</label><span style={unt}>₹/g at stated purity</span></div>
                      <div style={pfxWrap}>
                        <span style={pfx}>₹</span>
                        <input type="number" inputMode="decimal" placeholder="e.g. 13500" value={o.pricePerGram} onChange={e=>setPriceF(o.id,e.target.value)} style={{ ...INP, paddingLeft:'30px' }}/>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {ornaments.length < MAX_ORNAMENTS && (
            <button style={{ width:'100%', marginTop:'20px', padding:'13px', background:C.paper, color:C.gold, border:`1.5px dashed rgba(184,136,58,.4)`, borderRadius:'4px', fontSize:'14px', fontWeight:600, fontFamily:SANS, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px' }} onClick={addOrnament}>
              <Plus size={16}/>Add another ornament
            </button>
          )}
          {ornaments.length >= MAX_ORNAMENTS && (
            <div style={{ marginTop:'14px', padding:'12px 14px', background:C.paper2, borderRadius:'4px', fontFamily:MONO, fontSize:'11px', color:C.mute, textAlign:'center', lineHeight:1.55, letterSpacing:'0.04em' }}>
              Max {MAX_ORNAMENTS} ornaments. For larger lots, <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{ color:C.gold, fontWeight:500 }}>WhatsApp us</a>.
            </div>
          )}

          <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:`1px solid rgba(26,20,38,.08)` }}>
            <div style={labRow}><label style={lab}>Service fee</label><span style={unt}>% · max 10%</span></div>
            <input type="number" inputMode="decimal" placeholder="e.g. 3" step="0.1" max="10" value={serviceFee} onChange={e=>setFeeG(e.target.value)} style={INP}/>
          </div>
        </Card>

        <Card ref={marginCardRef} style={{ textAlign:'center', padding:'32px 24px', minHeight:'180px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' }}>
          {margin1 === null ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
              <Sparkles size={22} color={C.gold} style={{ opacity:0.55 }}/>
              <div style={{ fontFamily:SERIF, fontSize:'18px', color:C.mute, fontWeight:350, maxWidth:'300px', lineHeight:1.45, fontStyle:'italic', animation:'pulse 2.4s ease-in-out infinite' }}>{progressText}</div>
              {!isMulti && <div style={{ display:'flex', gap:'6px', marginTop:'2px' }}>{[0,1,2].map(i=><div key={i} style={{ width:'26px', height:'4px', borderRadius:'4px', background:i<filled?C.gold:C.paper2, transition:'background .3s' }}/>)}</div>}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', width:'100%', animation:'fadeSlide .45s ease' }}>
              <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.16em', color:C.mute, textAlign:'center' }}>
                BUYER'S MARGIN · BUYER QUOTE{isMulti ? ` · ${margin1.ornamentCount} ORNAMENTS` : ''}
              </div>
              <div style={{ background:C.paper2, border:`1px solid rgba(26,20,38,.1)`, borderRadius:'6px', padding:'16px', textAlign:'center', width:'100%', boxSizing:'border-box' }}>
                <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'12px 28px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.14em', color:C.mute, marginBottom:'6px' }}>YOU RECEIVE</div>
                    <div style={{ fontFamily:SERIF, fontSize:'36px', fontWeight:350, color:C.ink, letterSpacing:'-0.025em', lineHeight:1 }}>₹{fmt(margin1.total,0)}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.14em', color:C.mute, marginBottom:'6px' }}>{isMulti?'BLENDED 24K RATE':'EFFECTIVE 24K RATE'}</div>
                    <div style={{ fontFamily:SERIF, fontSize:'24px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(margin1.eff,0)}<span style={{ fontSize:'14px', color:C.mute }}>/g</span></div>
                  </div>
                </div>
                {isMulti && <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, marginTop:'8px', letterSpacing:'0.04em' }}>Weighted across {margin1.ornamentCount} ornaments · after {feeN}% fee</div>}
              </div>
              <div style={{ width:'40px', height:'1px', background:C.paper2 }}/>
              <div style={{ fontFamily:SERIF, fontSize:'68px', fontWeight:350, lineHeight:1, letterSpacing:'-0.04em', color:t1.fg }}>{margin1.value.toFixed(1)}%</div>
              <div style={{ fontSize:'13px', fontWeight:600, padding:'7px 14px', borderRadius:'4px', background:t1.bg, color:t1.fg, letterSpacing:'0.01em', fontFamily:SANS }}>{t1.label}</div>

              {isMulti && (
                <>
                  <button style={{ background:'transparent', border:'none', color:C.gold, fontSize:'12px', fontWeight:500, fontFamily:MONO, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 8px', letterSpacing:'0.1em' }} onClick={()=>setShowBreakdown(v=>!v)}>
                    {showBreakdown?<ChevronUp size={14}/>:<ChevronDown size={14}/>}{showBreakdown?'HIDE BREAKDOWN':'PER-ORNAMENT BREAKDOWN'}
                  </button>
                  {showBreakdown && (
                    <div style={{ marginTop:'8px', width:'100%', textAlign:'left', animation:'fadeSlide .3s ease' }}>
                      {ornamentData.filter(x=>x.isValid).map((d,i) => {
                        const fee=feeN/100, effPF=d.effRate*(1-fee), cPF=d.purchaseContrib*(1-fee);
                        return (
                          <div key={d.id} style={{ padding:'14px 0', borderTop:i===0?'none':`1px dashed rgba(26,20,38,.08)` }}>
                            <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.14em', color:C.gold, marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:C.paper2, color:C.plum, fontFamily:SERIF, fontSize:'11px' }}>{i+1}</span>
                              ORNAMENT {i+1}
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'10px', columnGap:'18px' }}>
                              {[['Net weight',`${fmt(d.netWeight)}g`],['Purity',`${d.purity}%`],['24K rate (post-fee)',`₹${fmt(effPF,0)}/g`],['Sub-total',`₹${fmt(cPF,0)}`]].map(([l,v]) => (
                                <div key={l} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                                  <span style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.04em' }}>{l}</span>
                                  <span style={{ fontSize:'14px', color:C.ink, fontWeight:600, fontFamily:SERIF, letterSpacing:'-0.01em' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {(() => {
                        const valid=ornamentData.filter(x=>x.isValid),tG=valid.reduce((a,d)=>a+d.gross,0),tN=valid.reduce((a,d)=>a+d.netWeight,0),tD=valid.reduce((a,d)=>a+d.stone+d.wastage,0);
                        return (
                          <div style={{ marginTop:'14px', paddingTop:'16px', borderTop:`1px solid rgba(184,136,58,.2)` }}>
                            <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.14em', color:C.gold, marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:C.gold, color:C.white, fontFamily:SERIF, fontSize:'11px' }}>Σ</span>
                              TOTAL LOT
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'10px', columnGap:'18px' }}>
                              {[['Gross weight',`${fmt(tG)}g`],['Total deducted',`${fmt(tD)}g`],['Net weight',`${fmt(tN)}g`],['You receive',`₹${fmt(margin1.total,0)}`]].map(([l,v]) => (
                                <div key={l} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                                  <span style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.04em' }}>{l}</span>
                                  <span style={{ fontSize:'14px', color:C.ink, fontWeight:600, fontFamily:SERIF, letterSpacing:'-0.01em' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {margin1 !== null && (() => {
          const fairVal  = margin1.sales_total * 0.94;
          const youGet   = margin1.total;
          const diff     = fairVal - youGet;
          const short    = diff > 0;
          return (
            <Card style={{ marginBottom:'14px', animation:'fadeSlide .5s ease', textAlign:'center' }}>
              <Eyebrow>Your Gold's Fair Value</Eyebrow>
              <div style={{ fontFamily:SERIF, fontSize:'clamp(28px, 8vw, 68px)', fontWeight:350, letterSpacing:'-0.04em', color:C.plum, lineHeight:1, marginBottom:'6px', whiteSpace:'nowrap' }}>
                {fmtRange(fairVal)}
              </div>
              <div style={{ marginBottom:'14px' }}/>
              {short ? (
                <div style={{ padding:'12px 14px', background:'#FEE2E2', borderRadius:'6px', fontSize:'13px', color:'#991B1B', fontWeight:500, lineHeight:1.55 }}>
                  Your buyer is offering <b>₹{fmt(Math.abs(diff),0)} less</b> than a fair price.
                </div>
              ) : (
                <div style={{ padding:'12px 14px', background:'#DCFCE7', borderRadius:'6px', fontSize:'13px', color:'#15803D', fontWeight:500, lineHeight:1.55 }}>
                  Your buyer's offer is within the fair range.
                </div>
              )}
            </Card>
          );
        })()}

        {margin1 !== null && (
          <Card dark style={{ marginBottom:'14px', animation:'fadeSlide .55s ease', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'160px', height:'160px', borderRadius:'50%', background:`radial-gradient(circle,rgba(224,183,101,.15) 0%,transparent 70%)`, pointerEvents:'none' }}/>
            <div style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', marginBottom:'10px', position:'relative' }}>Get the fair price from Carat Money</div>
            <div style={{ fontSize:'14px', color:`rgba(241,215,141,.6)`, lineHeight:1.6, marginBottom:'18px', position:'relative' }}>Share your number and we'll send you a quote on WhatsApp.</div>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', padding:'0 0 0 14px', overflow:'hidden', marginBottom:'14px', position:'relative' }}>
              <span style={{ fontSize:'16px', color:C.mute, fontWeight:500, paddingRight:'10px', borderRight:`1px solid rgba(26,20,38,.12)`, fontFamily:SANS }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit mobile number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={{ flex:1, border:'none', background:'transparent', padding:'14px', fontSize:'16px', fontWeight:500, color:C.ink, outline:'none', minWidth:0, fontFamily:SANS }}/>
            </div>
            <BtnWhatsApp onClick={onCTA} disabled={!mobileValid}>
              <MessageCircle size={18}/> Get a better offer on WhatsApp
            </BtnWhatsApp>
            <div style={{ fontFamily:MONO, fontSize:'11px', color:`rgba(241,215,141,.35)`, marginTop:'12px', textAlign:'center', lineHeight:1.5, letterSpacing:'0.04em', position:'relative' }}>
              By submitting, you agree to be contacted about your gold sale.
            </div>
          </Card>
        )}

        {margin1 !== null && <ShareSection/>}
      </div>

      <FloatingShareButton highlighted={shareHighlighted}/>
    </div>
  );
}

function PartnerRedirect() {
  useEffect(() => {
    window.location.replace('https://carat-money-partners.web.app/partner/');
  }, []);
  return (
    <div style={{ minHeight:'100dvh', background:C.paper, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS }}>
      <div style={{ textAlign:'center', padding:'40px 18px' }}>
        <CaratMark size={64} color={C.gold2}/>
        <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.ink, marginTop:'16px' }}>
          Redirecting to Partner Portal…
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { route, navigate, blogSlug } = useRoute();
  const spot = useSpotRate();
  const [lang, setLang] = useLangState();
  useSEO(blogSlug ? null : route);

  // Language switch applies to the homepage only; other pages stay English.
  const effLang = route === '/' ? lang : 'en';
  useLayoutEffect(() => { document.documentElement.lang = effLang; }, [effLang]);
  const ctx = useMemo(() => ({ lang:effLang, setLang, t:makeT(effLang) }), [effLang, setLang]);

  let page;
  if      (route==='/sell')    page = <SellPage        navigate={navigate} spot={spot}/>;
  else if (route==='/buy')     page = <BuyPage         navigate={navigate} spot={spot}/>;
  else if (route==='/margin')  page = <MarginPage      navigate={navigate} spot={spot}/>;
  else if (route==='/blog')    page = <BlogIndexPage   navigate={navigate} spot={spot}/>;
  else if (route==='/partner') page = <PartnerRedirect/>;
  else if (blogSlug)           page = <BlogArticlePage navigate={navigate} slug={blogSlug}/>;
  else                         page = <HomePage        navigate={navigate} spot={spot}/>;
  return <LangCtx.Provider value={ctx}><style>{GLOBAL_CSS}</style>{page}</LangCtx.Provider>;
}
