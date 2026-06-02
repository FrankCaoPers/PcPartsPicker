# PC Builder CS 461 Project

A web application that allows users to select custom parts with automatic compatability checking, built using React, Node.js, and PostgreSQl.

## Prerequisites

* **Node.js**
* **npm**
* **PostgreSQL**

---

## 1. Database Setup

This project is not hosted online, requiring each user to setup a local PostgreSQL database named 'pcbuilder' to store profiles and retrive data. 
1. Open terminal
2. Navigate to directory where the SQL files 'info.sql' and 'pcpartspicker.sql' are located
3. Run the following commands to construct and populate the database

# 1. Create db, schema, and junction tables
`psql -U postgres -f pcpartspicker.sql`

# 2. Populate the database with component data
`psql -U postgres -f info.sql`

Note that you may need to add 
"C:\Program Files\PostgreSQL\{version num}\bun\psql.exe" as a path enviornment variable.

---

## 2. Backend Setup

# 1. Navigate to server directory in a terminal

# 2. Create env variable file
`cp .env.example .env`

# 3. Open .env file and replace your username and password in the file

# 4. Start the server
`npm start`

Note that this should start running the backend at http://localhost:5001

## 3. Frontend Setup

# 1. Open client directory

# 2. Create env variable file
`cp .env.example .env`

# 3. Make sure .env points to backend 
`Vite_API_URL=http://localhost:5001`

# 4. Start the development server
`npm run dev`

This should open the webpage at http://localhost:5173