const express = require('express');
const fs = require('fs');
<<<<<<< HEAD
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cron = require('node-cron');
const emailjs = require('emailjs-com');

const app = express();
app.use(express.json());
app.use(express.static('.'));

const USER_FILE = './user.json';
const SECRET_KEY = 'YOUR_SECRET_KEY'; // change to a strong secret

// --- EmailJS configuration ---
const SERVICE_ID = 'service_5hj0odj';       // replace with your EmailJS service ID
const TEMPLATE_ID = 'template_wy4233a';     // replace with your EmailJS template ID
const USER_ID = 'tTUQN847BmqEqGeuV';          // replace with your EmailJS public key
const TO_NAME = 'Branvee bets';                // recipient name
const TO_EMAIL = 'commandofamere@gmail.com';  // recipient email

// --- Helper functions ---
function loadUser() {
  if (!fs.existsSync(USER_FILE)) {
    fs.writeFileSync(USER_FILE, JSON.stringify({ dailyPasswordHash: "", lastGenerated: "", plainPassword: "" }));
  }
  return JSON.parse(fs.readFileSync(USER_FILE));
}

function saveUser(user) {
  fs.writeFileSync(USER_FILE, JSON.stringify(user, null, 2));
}

function generateRandomPassword(length = 16) {
  return crypto.randomBytes(Math.ceil(length*3/4))
    .toString('base64')
    .replace(/\+/g,'A')
    .replace(/\//g,'B')
    .slice(0,length);
}

// --- Generate daily password ---
async function generateDailyPassword() {
  const pwd = generateRandomPassword();
  const hash = await bcrypt.hash(pwd, 10);
  const user = loadUser();
  user.dailyPasswordHash = hash;
  user.lastGenerated = new Date().toISOString();
  user.plainPassword = pwd; // store plaintext for email & reference
  saveUser(user);
  console.log("Today's password is:", pwd);

  // Send email
  await sendPasswordEmail(pwd);
}

// --- Send password email ---
async function sendPasswordEmail(password) {
  try {
    const templateParams = {
      to_name: TO_NAME,
      password: password
    };
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
    console.log('Daily password email sent!');
  } catch (err) {
    console.error('Email sending error:', err);
  }
}

// --- Run once on server start ---
(async () => {
  const user = loadUser();
  if (!user.dailyPasswordHash) await generateDailyPassword();
})();

// --- Schedule daily password generation at 00:00 ---
cron.schedule('0 0 * * *', async () => {
  console.log('Generating new daily password...');
  await generateDailyPassword();
});

// --- Routes ---
app.get('/', (req, res) => res.sendFile(__dirname + '/login.html'));

app.post('/user/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const user = loadUser();
    const match = await bcrypt.compare(password, user.dailyPasswordHash);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    res.json({ ok: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/matches', (req, res) => res.sendFile(__dirname + '/matches.html'));

// --- Secure page to view today's password ---
app.get('/today-password', (req, res) => {
  const user = loadUser();
  const key = req.query.key;
  if (key !== SECRET_KEY) return res.status(403).send('Forbidden');

  res.send(`
    <html>
      <head>
        <title>Today's Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; text-align:center; margin-top:50px;">
        <h1>Yamaalfixed1x2</h1>
        <p><strong>Today's Password:</strong></p>
        <h2 style="color:blue;">${user.plainPassword}</h2>
      </body>
    </html>
  `);
});

// --- Start server ---
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
=======
const path = require('path');

const app = express();
app.use(express.json()); // parse JSON bodies
app.use(express.static(__dirname)); // serve static files

// ------------------ FILE PATHS ------------------
const PASSWORD_FILE = path.join(__dirname, 'password.json');
const TODAY_FILE = path.join(__dirname, 'todayMatches.json');
const YESTERDAY_FILE = path.join(__dirname, 'yesterdayMatches.json');

// ------------------ CREATE FILES IF MISSING ------------------
if (!fs.existsSync(PASSWORD_FILE)) fs.writeFileSync(PASSWORD_FILE, JSON.stringify({ password: "1234" }, null, 2));
if (!fs.existsSync(TODAY_FILE)) fs.writeFileSync(TODAY_FILE, JSON.stringify({ games: [], totalOdds: 0 }, null, 2));
if (!fs.existsSync(YESTERDAY_FILE)) fs.writeFileSync(YESTERDAY_FILE, JSON.stringify([], null, 2));

// ------------------ PASSWORD ROUTES ------------------
app.get('/password', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(PASSWORD_FILE, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read password file" });
  }
});

app.post('/password', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "No password provided" });
  try {
    fs.writeFileSync(PASSWORD_FILE, JSON.stringify({ password }, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save password" });
  }
});

// ------------------ TODAY'S MATCHES ------------------
app.get('/today', (req, res) => res.sendFile(TODAY_FILE));

app.post('/today', (req, res) => {
  const todayDate = new Date().toDateString();
  const games = (req.body.games || []).map(game => ({
    ...game,
    date: todayDate,
    result: game.result || "Pending"
  }));
  const totalOdds = req.body.totalOdds || 0;

  // Save only to todayMatches.json
  fs.writeFileSync(TODAY_FILE, JSON.stringify({ games, totalOdds }, null, 2));

  res.json({ ok: true });
});

// ------------------ YESTERDAY'S MATCHES ------------------
app.get('/yesterday', (req, res) => res.sendFile(YESTERDAY_FILE));

app.post('/yesterday', (req, res) => {
  const matches = req.body.map(match => ({
    ...match,
    date: match.date || new Date().toDateString()
  }));
  fs.writeFileSync(YESTERDAY_FILE, JSON.stringify(matches, null, 2));
  res.json({ ok: true });
});

// ------------------ PAGES ------------------
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/matches', (req, res) => res.sendFile(path.join(__dirname, 'matches.html')));
// ------------------ ALL MATCHES (combined for front-end) ------------------
app.get('/matches', (req, res) => {
  try {
    const todayData = JSON.parse(fs.readFileSync(TODAY_FILE, 'utf8'));
    const yesterdayData = JSON.parse(fs.readFileSync(YESTERDAY_FILE, 'utf8'));
    const allMatches = [
      ...(todayData.games || []),
      ...yesterdayData
    ];
    res.json(allMatches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read match files" });
  }
});

// ------------------ START SERVER ------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
>>>>>>> 3c693e3 (Initial commit)
