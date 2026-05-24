const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5001;
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
    
    // GitHub Sync (Like OrdinancaPro)
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        const repo = "github.com/Check-this-out-for-me/OrdinancaPro.git";
        const remote = `https://x-access-token:${token}@${repo}`;
        exec(`git add database.json && git commit -m "Update MesoShqip database" && git push ${remote} main`, (err) => {
            if (err) console.error("GitHub Sync Error:", err);
            else console.log("Database synced to GitHub!");
        });
    }
}

// Mailer Setup
let transporter;
async function getTransporter() {
    if (transporter) return transporter;
    
    // Create a test account for demo purposes (Ethereal Email)
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    console.log(`\n[EMAIL SERVICE] Test SMTP created. User: ${testAccount.user}`);
    return transporter;
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

// Step 1: Request Premium (Send real test email)
app.post('/api/premium/request', async (req, res) => {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: "UserId and Email required" });

    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (!db.verifications) db.verifications = [];
    db.verifications = db.verifications.filter(v => v.userId !== userId);
    db.verifications.push({
        userId,
        email,
        code,
        expires: Date.now() + 10 * 60 * 1000
    });
    
    writeDB(db);

    try {
        const mailer = await getTransporter();
        const info = await mailer.sendMail({
            from: '"MësoShqip AI" <noreply@mesoshqip.ai>',
            to: email,
            subject: "Kodi i Verifikimit për Premium ⭐",
            text: `Kodi juaj është: ${code}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1;">Mëso Shqip Premium</h2>
                    <p>Përshëndetje <b>${user.name}</b>,</p>
                    <p>Kodi juaj për të aktivizuar paketën Premium është:</p>
                    <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
                        ${code}
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">Ky kod skadon pas 10 minutave.</p>
                </div>
            `,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`\n[EMAIL SENT] To: ${email} | Code: ${code} | Preview: ${previewUrl}`);

        res.json({ 
            message: "Verification code sent!", 
            previewUrl: previewUrl // We send this so the user can actually "open" the email in the demo
        });
    } catch (err) {
        console.error("Email Error:", err);
        res.status(500).json({ error: "Dështoi dërgimi i email-it" });
    }
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
