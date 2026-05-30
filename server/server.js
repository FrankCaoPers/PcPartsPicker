const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432, 
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
});


app.get('/api/cpus', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cpu ORDER BY price ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const {username, password} = req.body
        const sqlQuery = `
            SELECT username, password
            FROM users
            WHERE username = $1 AND password = $2;
        `
        const result = await pool.query(sqlQuery, [username, password])
        if (result.rows.length > 0) {
            res.json({ success: true, message: "Login successful!", user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        const userCheckQuery = `
            SELECT username 
            FROM users 
            WHERE username = $1;
        `;
        const userCheckResult = await pool.query(userCheckQuery, [username]);
        
        if (userCheckResult.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Username already exists. Please try another one." 
            });
        }

        const sqlQuery = `
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING user_id, username; 
        `;
        const result = await pool.query(sqlQuery, [username, password]);
        
        const newUser = result.rows[0];

        return res.status(201).json({
            success: true,
            message: "User account created successfully!",
            user: newUser
        });

    } catch (err) {
        console.error("REGISTRATION ERROR:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Backend server running securely on port ${PORT}`);
}).on('error', (err) => {
    console.error('Express boot error:', err.message);
});