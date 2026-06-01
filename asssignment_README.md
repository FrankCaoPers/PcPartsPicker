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

```
# 1. Create db, schema, and junction tables
psql -U postgres -f pcpartspicker.sql

#2. Populate the database with component data
psql -U postgres -f info.sql

Note that you may need to add 
"C:\Program Files\PostgreSQL\{version num}\bun\psql.exe" as a path enviornment variable.

---

## 2. Backend Setup
