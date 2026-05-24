const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5001;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], verifications: [] }, null, 2));
}

function readDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { users: [], verifications: [] };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// User Registration
app.post('/api/register', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const db = readDB();
    const newUser = {
        id: Date.now().toString(),
        name,
        email: null,
        isPremium: false,
        registeredAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);

    res.json({ message: "Registered successfully", user: newUser });
});

// Step 1: Request Premium (Send "Email")
app.post('/api/premium/request', (req, res) => {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: "UserId and Email required" });

    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification request
    if (!db.verifications) db.verifications = [];
    db.verifications = db.verifications.filter(v => v.userId !== userId); // Remove old ones
    db.verifications.push({
        userId,
        email,
        code,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    
    writeDB(db);

    // In a real app, you'd use nodemailer here. 
    // Since we are doing it "GitHub style" and automated, 
    // we will log it to the console and simulate the email.
    console.log(`\n--- EMAIL SIMULATION ---`);
    console.log(`To: ${email}`);
    console.log(`Subject: MesoShqip Premium Verification Code`);
    console.log(`Code: ${code}`);
    console.log(`------------------------\n`);

    res.json({ message: "Verification code sent to email" });
});

// Step 2: Verify Code
app.post('/api/premium/verify', (req, res) => {
    const { userId, code } = req.body;
    const db = readDB();
    
    const verification = db.verifications?.find(v => v.userId === userId && v.code === code);
    
    if (!verification) return res.status(400).json({ error: "Invalid code" });
    if (verification.expires < Date.now()) return res.status(400).json({ error: "Code expired" });

    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    db.users[userIndex].isPremium = true;
    db.users[userIndex].email = verification.email;
    
    // Cleanup
    db.verifications = db.verifications.filter(v => v.userId !== userId);
    writeDB(db);

    res.json({ message: "Upgraded to Premium!", user: db.users[userIndex] });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'hyseniyll44@gmail.com' && password === 'Nora_bali1.') {
        res.json({ success: true, token: 'admin-token-12345' });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Get Users (Admin only)
app.get('/api/admin/users', (req, res) => {
    const token = req.headers.authorization;
    if (token !== 'admin-token-12345') {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const db = readDB();
    res.json(db.users);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveri i MësoShqip po punon në http://localhost:${PORT}`);
});
