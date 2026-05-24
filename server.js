require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// Konfigurimi i Supabase (Databaza Online Falas)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));

// API per te marre pacientet nga databaza online
app.get('/api/data', async (req, res) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*');
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// API per te ruajtur/update-uar pacientet
app.post('/api/save', async (req, res) => {
    const appointments = req.body;
    
    // Per kete version, po bejme fshirjen dhe rishkrimin (simulim i database.json)
    // Ne nje version me te avancuar, do te perdornim UPSERT
    const { error: deleteError } = await supabase.from('appointments').delete().neq('id', 0);
    if (deleteError) return res.status(500).json({ error: deleteError.message });

    const { error: insertError } = await supabase.from('appointments').insert(appointments);
    if (insertError) return res.status(500).json({ error: insertError.message });

    res.json({ message: 'Te dhenat u ruajten ne Supabase!' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveri po punon online ne portin ${PORT}`);
});
