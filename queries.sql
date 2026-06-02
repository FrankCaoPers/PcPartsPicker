SELECT * FROM cpu ORDER BY price ASC
SELECT * FROM motherboard ORDER BY price ASC
SELECT * FROM cpu WHERE cpu_id = $1
SELECT * FROM motherboard WHERE motherboard_id = $1
SELECT motherboard_id FROM project WHERE project_id = $1
SELECT * FROM cpu ORDER BY price ASC
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
SELECT cpu_id FROM project WHERE project_id = $1
SELECT * FROM motherboard ORDER BY price ASC
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
SELECT * FROM ${comp.table} ORDER BY price ASC
SELECT * FROM ${comp.table} WHERE ${comp.idField} = $1
SELECT * FROM project WHERE project_id = $1
--this part is the compatability checker, so the different joins are added to the first select below
SELECT * FROM ${comp.table}
JOIN Motherboard_Memory_Compatibility mmc ON mmc.memory_id = ${comp.table}.memory_id
JOIN Chassis_Video_Card_Fitting cvcf ON cvcf.gpu_id = ${comp.table}.gpu_id
JOIN Chassis_Power_Supply_Fitting cpsf ON cpsf.psu_id = ${comp.table}.psu_id
JOIN Chassis_Cooler_Fitting ccf ON ccf.cooler_id = ${comp.table}.cooler_id
JOIN Chassis_Motherboard_Fitting cmf ON cmf.chassis_id = ${comp.table}.chassis_id
JOIN Motherboard_Storage_Compatibility msc ON msc.storage_id = ${comp.table}.storage_id
JOIN Chassis_Storage_Fitting csf ON csf.storage_id = ${comp.table}.storage_id
-- query += ` WHERE ` + whereClauses.join(' AND ');
-- query += ` ORDER BY price ASC`;
SELECT *
            FROM users
            WHERE username = $1 AND password = $2;
SELECT username 
            FROM users 
            WHERE username = $1;
INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING user_id, username;
INSERT INTO project (name, total_price, total_power, user_id)
            VALUES ($1, 0, 0, $2)
            RETURNING project_id;
SELECT *
            FROM project
            WHERE user_id = $1
SELECT *
            FROM project
            WHERE project_id = $1 AND user_id = $2
UPDATE project
            SET ${updates.join(', ')}
            WHERE project_id = $${paramCount++} AND user_id = $${paramCount++}
            RETURNING *;
DELETE FROM project
            WHERE project_id = $1 AND user_id = $2
            RETURNING *;

