const express = require('express');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const authenticateToken = require('./helper')
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
    password: process.env.DB_PASSWORD,
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

app.get('/api/motherboards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM motherboard ORDER BY price ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/cpus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM cpu WHERE cpu_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'CPU not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/motherboards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM motherboard WHERE motherboard_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Motherboard not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/compatible/cpus/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectResult = await pool.query('SELECT motherboard_id FROM project WHERE project_id = $1', [projectId]);

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const { motherboard_id } = projectResult.rows[0];

        if (!motherboard_id) {
            const allCpus = await pool.query('SELECT * FROM cpu ORDER BY price ASC');
            return res.json(allCpus.rows);
        }

        const compatibleResult = await pool.query(`
            SELECT c.*
            FROM cpu c
            WHERE c.socket = (
                SELECT m.socket
                FROM project p
                JOIN motherboard m ON p.motherboard_id = m.motherboard_id
                WHERE p.project_id = $1
            )
            AND c.chipset = (
                SELECT m.chipset
                FROM project p
                JOIN motherboard m ON p.motherboard_id = m.motherboard_id
                WHERE p.project_id = $1
            )
            ORDER BY c.price ASC
        `, [projectId]);

        res.json(compatibleResult.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/compatible/motherboards/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectResult = await pool.query('SELECT cpu_id FROM project WHERE project_id = $1', [projectId]);

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const { cpu_id } = projectResult.rows[0];

        if (!cpu_id) {
            const allMotherboards = await pool.query('SELECT * FROM motherboard ORDER BY price ASC');
            return res.json(allMotherboards.rows);
        }

        const compatibleResult = await pool.query(`
            SELECT m.*
            FROM motherboard m
            WHERE m.socket = (
                SELECT c.socket
                FROM project p
                JOIN cpu c ON p.cpu_id = c.cpu_id
                WHERE p.project_id = $1
            )
            AND m.chipset = (
                SELECT c.chipset
                FROM project p
                JOIN cpu c ON p.cpu_id = c.cpu_id
                WHERE p.project_id = $1
            )
            ORDER BY m.price ASC
        `, [projectId]);

        res.json(compatibleResult.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// dynamic code for selecting
const newComponents = [
    { route: 'memory', table: 'memory', idField: 'memory_id' },
    { route: 'gpus', table: 'videocard', idField: 'gpu_id' },
    { route: 'psus', table: 'powersupply', idField: 'psu_id' },
    { route: 'coolers', table: 'cpucooler', idField: 'cooler_id' },
    { route: 'storage', table: 'storage', idField: 'storage_id' },
    { route: 'chassis', table: 'chassis', idField: 'chassis_id' }
];

newComponents.forEach(comp => {
    // 1. Get all Parts
    app.get(`/api/${comp.route}`, async (req, res) => {
        try {
            const result = await pool.query(`SELECT * FROM ${comp.table} ORDER BY price ASC`);
            res.json(result.rows);
        } catch (err) {
            console.error(`Error fetching ${comp.route}:`, err.message);
            res.status(500).send('Server Error');
        }
    });

    // 2. Get Part by ID
    app.get(`/api/${comp.route}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(`SELECT * FROM ${comp.table} WHERE ${comp.idField} = $1`, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Part not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(`Error fetching ${comp.route} by ID:`, err.message);
            res.status(500).send('Server Error');
        }
    });

    // 3. Get Compatible Parts 
    app.get(`/api/compatible/${comp.route}/:projectId`, async (req, res) => {
        try {
            const { projectId } = req.params;
            
            const projectResult = await pool.query('SELECT * FROM project WHERE project_id = $1', [projectId]);
            if (projectResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            const project = projectResult.rows[0];

            let query = `SELECT * FROM ${comp.table}`;
            let params = [];
            let whereClauses = [];
            let paramCount = 1;

            if (comp.route === 'memory') {
                if (project.motherboard_id) {
                    query += ` JOIN Motherboard_Memory_Compatibility mmc ON mmc.memory_id = ${comp.table}.memory_id`;
                    whereClauses.push(`mmc.motherboard_id = $${paramCount++}`);
                    params.push(project.motherboard_id);
                }
            } else if (comp.route === 'gpus') {
                if (project.chassis_id) {
                    query += ` JOIN Chassis_Video_Card_Fitting cvcf ON cvcf.gpu_id = ${comp.table}.gpu_id`;
                    whereClauses.push(`cvcf.chassis_id = $${paramCount++}`);
                    params.push(project.chassis_id);
                }
            } else if (comp.route === 'psus') {
                if (project.chassis_id) {
                    query += ` JOIN Chassis_Power_Supply_Fitting cpsf ON cpsf.psu_id = ${comp.table}.psu_id`;
                    whereClauses.push(`cpsf.chassis_id = $${paramCount++}`);
                    params.push(project.chassis_id);
                }
            } else if (comp.route === 'coolers') {
                if (project.chassis_id) {
                    query += ` JOIN Chassis_Cooler_Fitting ccf ON ccf.cooler_id = ${comp.table}.cooler_id`;
                    whereClauses.push(`ccf.chassis_id = $${paramCount++}`);
                    params.push(project.chassis_id);
                }
            } else if (comp.route === 'chassis') {
                if (project.motherboard_id) {
                    query += ` JOIN Chassis_Motherboard_Fitting cmf ON cmf.chassis_id = ${comp.table}.chassis_id`;
                    whereClauses.push(`cmf.motherboard_id = $${paramCount++}`);
                    params.push(project.motherboard_id);
                }
            } else if (comp.route === 'storage') {
                if (project.motherboard_id) {
                    query += ` JOIN Motherboard_Storage_Compatibility msc ON msc.storage_id = ${comp.table}.storage_id`;
                    whereClauses.push(`msc.motherboard_id = $${paramCount++}`);
                    params.push(project.motherboard_id);
                }
                if (project.chassis_id) {
                    query += ` JOIN Chassis_Storage_Fitting csf ON csf.storage_id = ${comp.table}.storage_id`;
                    whereClauses.push(`csf.chassis_id = $${paramCount++}`);
                    params.push(project.chassis_id);
                }
            }

            if (whereClauses.length > 0) {
                query += ` WHERE ` + whereClauses.join(' AND ');
            }
            query += ` ORDER BY price ASC`;

            const result = await pool.query(query, params);
            res.json(result.rows);

        } catch (err) {
            console.error(`Error fetching compatible ${comp.route}:`, err.message);
            res.status(500).send('Server Error');
        }
    });
});

//POST
app.post('/api/POST/login', async (req, res) => {
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


app.post('/api/POST/signup', async (req, res) => {
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
            message: "User account created successfully",
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

app.post('/api/POST/projects', authenticateToken, async (req, res) => {
    try {
        const {name} = req.body;
        const userId = req.userId;

        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "Project name is required" });
        }

        const sqlQuery = `
            INSERT INTO project (name, total_price, total_power, user_id)
            VALUES ($1, 0, 0, $2)
            RETURNING project_id;
        `

        const result = await pool.query(sqlQuery, [name.trim(), userId]);

        return res.status(201).json({
            success:true,
            message: "Project created successfully",
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})


//GET
app.get('/api/GET/projects', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;

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

//GET
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const sqlQuery = `
            SELECT *
            FROM project
            WHERE project_id = $1 AND user_id = $2
        `;

        const result = await pool.query(sqlQuery, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.log("GET PROJECT BY ID ERROR", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
})

//PUT
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, total_price, total_power, cpu_id, cooler_id, gpu_id, memory_id, motherboard_id, psu_id, storage_id, chassis_id } = req.body;
        const userId = req.userId;

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            if (!name || name.trim() === "") {
                return res.status(400).json({ success: false, message: "Project name is required" });
            }
            updates.push(`name = $${paramCount++}`);
            values.push(name.trim());
        }

        if (total_price !== undefined) {
            updates.push(`total_price = $${paramCount++}`);
            values.push(total_price);
        }

        if (total_power !== undefined) {
            updates.push(`total_power = $${paramCount++}`);
            values.push(total_power);
        }

        if (cpu_id !== undefined) {
            updates.push(`cpu_id = $${paramCount++}`);
            values.push(cpu_id);
        }

        if (cooler_id !== undefined) {
            updates.push(`cooler_id = $${paramCount++}`);
            values.push(cooler_id);
        }

        if (gpu_id !== undefined) {
            updates.push(`gpu_id = $${paramCount++}`);
            values.push(gpu_id);
        }

        if (memory_id !== undefined) {
            updates.push(`memory_id = $${paramCount++}`);
            values.push(memory_id);
        }

        if (motherboard_id !== undefined) {
            updates.push(`motherboard_id = $${paramCount++}`);
            values.push(motherboard_id);
        }

        if (psu_id !== undefined) {
            updates.push(`psu_id = $${paramCount++}`);
            values.push(psu_id);
        }

        if (storage_id !== undefined) {
            updates.push(`storage_id = $${paramCount++}`);
            values.push(storage_id);
        }

        if (chassis_id !== undefined) {
            updates.push(`chassis_id = $${paramCount++}`);
            values.push(chassis_id);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        values.push(id);
        values.push(userId);

        const sqlQuery = `
            UPDATE project
            SET ${updates.join(', ')}
            WHERE project_id = $${paramCount++} AND user_id = $${paramCount++}
            RETURNING *;
        `;

        const result = await pool.query(sqlQuery, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
        }

        res.json({ success: true, message: "Project updated successfully", project: result.rows[0] });
    } catch (err) {
        console.error("UPDATE PROJECT ERROR", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
})

//DELETE
app.delete('/api/DELETE/projects/:id', authenticateToken, async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.userId;

        const sqlQuery = `
            DELETE FROM project
            WHERE project_id = $1 AND user_id = $2
            RETURNING *;
        `;

        const result = await pool.query(sqlQuery, [id, userId]);

        if (result.rowCount === 0) {
            return res.status(444).json({ error: "Project not found or unauthorized" });
        }
        res.json({ success: true, message: "Project deleted successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({error: "Server Error"});
    }
})


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Backend server running securely on port ${PORT}`);
}).on('error', (err) => {
    console.error('Express boot error:', err.message);
});
