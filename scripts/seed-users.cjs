// VANIKA NET — User seeder
// Generates ~620 demo accounts: 400 custodians + 90 forest + 50 scientists + 10 MoEFCC + 20 buyers + 50 researchers
// Run once: `node scripts/seed-users.cjs` from sarna-webapp root
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Hash helper — SHA-256 with salt
function hash(password, salt){
  return crypto.createHash('sha256').update(salt + ':' + password).digest('hex');
}

// Read grove data from public/data.js — extract GROVES array manually
const dataJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'data.js'), 'utf8');
// Replace `window.GROVES=` with `module.exports.GROVES=` and require it
const sandbox = { window: {} };
const code = dataJs.replace(/window\./g, 'sandbox.');
eval(code);
const GROVES = sandbox.GROVES;

console.log(`Loaded ${GROVES.length} groves from data.js`);

// First-name pool for randomised demo custodians
const FIRST_NAMES_M = ['Birsa','Lalu','Mangal','Sukhdev','Doman','Charan','Tilak','Manjhi','Premchand','Etwari','Anil','Ratnam','Shyam','Krishan','Janki','Ramdev','Naseeruddin','Bachcha','Sahdev','Gopal'];
const FIRST_NAMES_F = ['Phulwati','Sukurmoni','Roshni','Sushila','Mangri','Sundari','Lalita','Phool','Sita','Rani','Janki','Devi','Munni','Asha','Kamla','Savita','Rekha','Lalsa','Sona','Munni'];
const LAST_NAMES = {
  'Munda':['Munda'], 'Ho':['Ho','Singh-Ho'], 'Oraon':['Oraon','Tirkey'],
  'Santhal':['Hembrom','Hansda','Murmu','Tudu','Mardi','Marandi','Soren'],
  'Birjia (PVTG)':['Birjia'], 'Pahariya (PVTG)':['Pahariya'],
  'Bhumij':['Bhumij'], 'Tharu':['Tharu','Mahato','Chaudhary'],
  'Sahni (Mallah)':['Sahni'], 'Sahni · Mansoori':['Sahni','Mansoori'],
  'Mallah · Sahni':['Sahni','Mallah'], 'Mallah':['Mallah','Sahni'],
  'Kharwar':['Kharwar'], 'Multi-caste':['Yadav','Mahato','Singh','Kumar','Verma'],
  'Multi-caste Mallah':['Sahni','Mallah'], 'Multi-caste pilgrim':['Mishra','Pandey'],
  'Multi-caste Buddhist':['Mishra','Singh'], 'Multi-caste Jain':['Jain','Mehta'],
  'Bhuiyan':['Bhuiyan']
};
function pickName(tribe, isFem){
  const f = isFem ? FIRST_NAMES_F : FIRST_NAMES_M;
  const fn = f[Math.floor(Math.random()*f.length)];
  const lasts = LAST_NAMES[tribe] || ['Singh','Kumar'];
  const ln = lasts[Math.floor(Math.random()*lasts.length)];
  return fn + ' ' + ln;
}
// Deterministic randomness from seed
function seeded(seed){let s=0;for(let i=0;i<seed.length;i++)s=((s<<5)-s+seed.charCodeAt(i))|0;return ()=>{s=(s*16807)%2147483647;return s/2147483647}}

const users = [];
let userIdCounter = 1;
const newUser = (u) => {
  const salt = crypto.randomBytes(8).toString('hex');
  users.push({
    id: 'U-' + String(userIdCounter++).padStart(5, '0'),
    salt, passwordHash: hash(u.password, salt),
    ...u, password: undefined,  // never persist plaintext
    createdAt: new Date().toISOString(),
    failedAttempts: 0, lockedUntil: null
  });
};

// =====================================================
// 1) CUSTODIANS — 10 per grove × 40 = 400
// =====================================================
const CUSTODIAN_ROLES = [
  {ro:'Pahan',        seq:'01'},
  {ro:'Deputy Pahan', seq:'02'},
  {ro:'Naike',        seq:'03'},
  {ro:'Mahila Pradhan', seq:'04', fem:true},
  {ro:'Mahila Mandal', seq:'05', fem:true},
  {ro:'Yuvak Mandal', seq:'06'},
  {ro:'Bharra',       seq:'07'},
  {ro:'Manjhi',       seq:'08'},
  {ro:'Seed-keeper',  seq:'09', fem:true},
  {ro:'Elder',        seq:'10'},
];
GROVES.forEach(g => {
  const rng = seeded(g.id);
  CUSTODIAN_ROLES.forEach((c, idx) => {
    // The first one (Pahan) gets the existing custodian name from data.js
    const name = idx === 0 ? g.custodian : pickName(g.tribe, c.fem);
    const username = `CST-${g.id.replace('-','')}-${c.seq}`;
    newUser({
      username,
      password: 'sarna2026',
      role: 'custodian', name,
      title: `${c.ro} · ${g.name}`,
      tribe: g.tribe, district: g.district, state: g.state,
      groveId: g.id, area: g.region,
      upi: `+91${Math.floor(7000000000 + rng()*2999999999)}@upi`.replace(/\..*/,''),
      email: username.toLowerCase()+'@sarna.gov.in',
      isLead: idx === 0
    });
  });
});

// =====================================================
// 2) FOREST OFFICERS — 3 per district
// Use the grove-ID prefix as the district code (KHU-001 → KHU)
// =====================================================
const districtMap = {};   // district -> {state, code}
GROVES.forEach(g => {
  if (!districtMap[g.district]) {
    const grovePrefix = g.id.split('-')[0];  // 'KHU' from 'KHU-001'
    districtMap[g.district] = { state: g.state, code: grovePrefix };
  }
});
const FOREST_TITLES = ['DFO', 'ACF', 'Range Officer'];
Object.entries(districtMap).forEach(([district, info]) => {
  FOREST_TITLES.forEach((t, idx) => {
    const username = `FRO-${info.code}-${String(idx+1).padStart(2,'0')}`;
    newUser({
      username, password: 'sarna2026',
      role: 'forest', name: pickName('Multi-caste', idx===2),
      title: `${t} · ${district}`,
      district, state: info.state, districtCode: info.code,
      area: info.state.toLowerCase().slice(0,4),
      email: username.toLowerCase()+'@forest.'+info.state.toLowerCase().replace(' ','')+'.gov.in'
    });
  });
});

// =====================================================
// 3) ZSI CENTRAL — SINGLE national scientific authority
// All routing using toRole:'scientist' resolves to this one user.
// =====================================================
newUser({
  username: 'SCI-CENTRAL-01',
  password: 'sarna2026',
  role: 'scientist',
  name: 'Dr. Rajesh Kumar',
  title: 'Director · Zoological Survey of India Central · Animal Discovery Programme',
  zone: 'Kolkata HQ (Central)',
  area: 'zsi',
  jurisdiction: 'National (all 40 sites)',
  email: 'sci-central-01@zsi.gov.in'
});

// =====================================================
// 4) MoEFCC CENTRAL — SINGLE national authority account
// All routing using toRole:'policy' resolves to this one user.
// =====================================================
newUser({
  username: 'MOE-CENTRAL-01',
  password: 'sarna2026',
  role: 'policy',
  name: 'Asha Sharma',
  title: 'Joint Secretary · MoEFCC Central · Forests, Climate Change & Tribal Affairs',
  area: 'central',
  jurisdiction: 'National',
  email: 'moe-central-01@moefcc.gov.in'
});

// =====================================================
// 5) CARBON BUYERS — 20 (neutral fictional company codes)
// =====================================================
const BUYER_COMPANIES = [
  {code:'GSF', name:'Green Sustain Fund', kind:'ESG fund'},
  {code:'EDC', name:'Eco Development Corp', kind:'Corporate ESG'},
  {code:'CCT', name:'Carbon Commit Trust', kind:'Climate trust'},
  {code:'IRT', name:'International Reforestation', kind:'International'},
  {code:'NCP', name:'Nordic Climate Partners', kind:'International'},
  {code:'PSV', name:'Pacific Sustainability Ventures', kind:'International'},
  {code:'ECF', name:'Eastern Carbon Fund', kind:'Domestic'},
  {code:'SGI', name:'Sustainable Green India', kind:'Domestic'},
  {code:'TCB', name:'Tropical Carbon Buyers', kind:'Boutique'},
  {code:'GCM', name:'Global Carbon Markets', kind:'International'},
  {code:'IND', name:'Indus Sustainability', kind:'Domestic'},
  {code:'ESG', name:'ESG Pioneers Fund', kind:'Corporate'},
  {code:'CFI', name:'Climate Finance India', kind:'Domestic'},
  {code:'BCB', name:'Bharat Carbon Bureau', kind:'Govt-affiliated'},
  {code:'RNF', name:'Rainforest Fund', kind:'International'},
  {code:'OFR', name:'Offset Registry Direct', kind:'Registry'},
  {code:'SRP', name:'Sustainability Research Partners', kind:'Academic'},
  {code:'CCV', name:'Climate Capital Ventures', kind:'VC'},
  {code:'NGI', name:'Net-Zero Green Initiative', kind:'Coalition'},
  {code:'TRC', name:'Tropical Restore Capital', kind:'Capital'}
];
BUYER_COMPANIES.forEach(b => {
  const username = `BUY-${b.code}-01`;
  newUser({
    username, password: 'sarna2026',
    role: 'buyer',
    name: pickName('Multi-caste', false),
    title: `ESG Lead · ${b.name}`,
    company: b.name, companyCode: b.code, kind: b.kind, area: 'global',
    email: username.toLowerCase()+'@'+b.code.toLowerCase()+'.com'
  });
});

// =====================================================
// 6) RESEARCHER CENTRAL — SINGLE academic representative
// All routing using toRole:'analyst' resolves to this one user.
// =====================================================
newUser({
  username: 'RES-CENTRAL-01',
  password: 'sarna2026',
  role: 'analyst',
  name: 'Dr. Priya Verma',
  title: 'Senior Research Fellow · Wildlife Institute of India · MoU Liaison',
  institution: 'Wildlife Institute of India (Central liaison)',
  area: 'academic',
  jurisdiction: 'Academic representative for all consortium institutions',
  email: 'res-central-01@wii.gov.in'
});

// =====================================================
// WRITE
// =====================================================
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
// Empty sessions + inbox files
if (!fs.existsSync(path.join(dataDir, 'sessions.json'))) fs.writeFileSync(path.join(dataDir, 'sessions.json'), '{}');
if (!fs.existsSync(path.join(dataDir, 'inbox.json'))) fs.writeFileSync(path.join(dataDir, 'inbox.json'), '[]');

// Summary
const summary = {};
users.forEach(u => summary[u.role] = (summary[u.role] || 0) + 1);
console.log('\n✅ Generated', users.length, 'users:');
Object.entries(summary).forEach(([r, n]) => console.log(`  · ${r}: ${n}`));
console.log('\nAll passwords: sarna2026');
console.log('Saved to: data/users.json');
