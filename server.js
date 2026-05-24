const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 80;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));

// API per te marre pacientet
app.get('/api/data', (req, res) => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, '[]');
        return res.json([]);
    }
    const data = fs.readFileSync(DB_FILE);
    try {
        res.json(JSON.parse(data));
    } catch (e) {
        res.json([]);
    }
});

// API per te ruajtur dhe bere Push ne GitHub
app.post('/api/save', (req, res) => {
    const data = req.body;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

    // Automatikisht sinkronizo me GitHub nese jemi ne server (Render)
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        const repo = "github.com/Check-this-out-for-me/OrdinancaPro.git";
        const remote = `https://x-access-token:${token}@${repo}`;
        
        exec(`git add database.json && git commit -m "Auto-update database" && git push ${remote} main`, (err) => {
            if (err) console.error("GitHub Sync Error:", err);
            else console.log("Database synced to GitHub!");
        });
    }
    
    res.json({ message: 'Saved' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
