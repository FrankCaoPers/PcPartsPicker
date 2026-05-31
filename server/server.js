const express = require('express');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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
app.use(cookieParser());


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432, 
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
});


const cookieSettings = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
};


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
        let userId;
        let sessionToken;
        const {username, password} = req.body;
        const sqlQuery = `
            SELECT *
            FROM users
            WHERE username = $1 AND password = $2;
        `
        const result = await pool.query(sqlQuery, [username, password])

        if (result.rows.length > 0) {
            userId = result.rows[0].user_id;
            sessionToken = jwt.sign(
                {userId: userId},
                process.env.JWT_SECRET,
                {expiresIn: '1d'}
            );

            res.cookie('session_id', sessionToken, {...cookieSettings})
            res.json({ success: true, message: "Login successful!"});

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


app.get('/api/projects', async (req, res) => {
    try {
        const token = req.cookies.session_id

        if (!token) {
            return res.status(401).json({error: "Not logged in"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const sqlQuery = `
            SELECT *
            FROM project
            WHERE user_id = $1
        `;

        const result = await pool.query(sqlQuery, [userId]);
        res.json(result.rows);

    } catch (err) {
        console.log("GET PROJECTS ERROR", err.message)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
})


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Backend server running securely on port ${PORT}`);
}).on('error', (err) => {
    console.error('Express boot error:', err.message);
});
