CREATE DATABASE TreeInfo;

USE TreeInfo;

CREATE TABLE trees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    family VARCHAR(255),
    species VARCHAR(255),
    description TEXT NOT NULL,
    qr_code TEXT
);

select * from trees;
ALTER TABLE trees ADD COLUMN scan_count INT DEFAULT 0;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
select * from users;