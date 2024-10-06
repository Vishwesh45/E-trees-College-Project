/*const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'VishweshK',
    database: 'treeinfo'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Serve the landing page
app.get('/', (req, res) => {
    res.render('landing');
});

// Handle admin login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.redirect('/index'); // Redirect to admin dashboard
    } else {
        res.redirect('/'); // Redirect back to landing page on failure
    }
});

// Handle user login
app.post('/user/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.redirect('/'); // Redirect back to landing page on failure
        } else if (results.length > 0) {
            res.redirect('/user/home'); // Redirect to user home page
        } else {
            res.redirect('/'); // Redirect back to landing page on failure
        }
    });
});

// Handle user registration
app.post('/user/register', (req, res) => {
    const { email, password, name } = req.body;
    db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, password, name], (err) => {
        if (err) {
            console.error('Error inserting user into database:', err);
            res.redirect('/'); // Redirect back to landing page on failure
        } else {
            res.redirect('/'); // Redirect to landing page or login page
        }
    });
});

// Serve the admin dashboard
app.get('/index', (req, res) => {
    db.query('SELECT * FROM trees', (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('index', { trees: results });
        }
    });
});

// Serve the user home page
app.get('/user/home', (req, res) => {
    res.render('userHome');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
*/
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const qrcode = require('qrcode');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'VishweshK',
    database: 'treeinfo'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Serve the landing page
app.get('/', (req, res) => {
    res.render('landing');
});

// Handle admin login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.redirect('/index'); // Redirect to admin dashboard
    } else {
        res.redirect('/'); // Redirect back to landing page on failure
    }
});

// Serve the admin dashboard
app.get('/index', (req, res) => {
    // Fetch tree data
    const sql = 'SELECT * FROM trees';
    db.query(sql, (err, trees) => {
        if (err) {
            console.error('Error fetching trees from database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('index', { trees });
    });
});

app.post('/register', (req, res) => {
    const { full_name, email, password } = req.body;

    // Check if the email already exists
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.redirect('/?alert=Internal%20Server%20Error.%20Please%20try%20again%20later.');
        }

        if (results.length > 0) {
            // Email already exists
            return res.redirect('/?alert=Email%20already%20in%20use.%20Please%20use%20a%20different%20email.');
        }

        // Email does not exist, proceed with registration
        const insertUserSql = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
        db.query(insertUserSql, [full_name, email, password], (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.redirect('/?alert=Internal%20Server%20Error.%20Please%20try%20again%20later.');
            }

            // Registration successful
            res.redirect('/?alert=Registration%20successful!%20Please%20log%20in.');
        });
    });
});




// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.redirect('/user'); // Redirect to user page
        } else {
            res.send('Invalid email or password');
        }
    });
});

// User Page Route
app.get('/user', (req, res) => {
    // Fetch tree data
    const sql = 'SELECT * FROM trees';
    db.query(sql, (err, trees) => {
        if (err) {
            console.error('Error fetching trees from database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('user', { trees });
    });
});

// Route to fetch tree details
app.get('/tree-details/:id', (req, res) => {
    const treeId = req.params.id;
    const sql = 'SELECT * FROM trees WHERE id = ?';
    db.query(sql, [treeId], (err, results) => {
        if (err) {
            console.error('Error fetching tree details:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('Tree not found');
        }
    });
});

// Serve the tree-info page
app.get('/tree-info/:name', (req, res) => {
    const treeName = decodeURIComponent(req.params.name);
    db.query('SELECT * FROM trees WHERE name = ?', [treeName], (err, results) => {
        if (err) {
            console.error('Error fetching tree info:', err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            res.render('tree-info', { tree: results[0] });
        } else {
            res.status(404).send('Tree not found');
        }
    });
});

// Serve the add-tree form
app.get('/add-tree', (req, res) => {
    res.render('add-tree');
});

// Handle add-tree form submission
app.post('/add-tree', (req, res) => {
    const { name, scientific_name, family, species, description } = req.body;
    const qrCodeData = `
        Name: ${name}
        Scientific Name: ${scientific_name}
        Family: ${family}
        Species: ${species}
        Description: ${description}
    `;

    qrcode.toDataURL(qrCodeData, (err, url) => {
        if (err) {
            console.error('Error generating QR code:', err);
            return res.status(500).send('Server error');
        }

        const sql = 'INSERT INTO trees (name, scientific_name, family, species, description, qr_code) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [name, scientific_name, family, species, description, url], (err, result) => {
            if (err) {
                console.error('Error inserting tree into database:', err);
                return res.status(500).send('Server error');
            }
            res.redirect('/index');
        });
    });
});

// Serve the edit-tree form
app.get('/edit-tree/:id', (req, res) => {
    const treeId = req.params.id;
    db.query('SELECT * FROM trees WHERE id = ?', [treeId], (err, results) => {
        if (err) {
            console.error('Error fetching tree for edit:', err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            res.render('edit-tree', { tree: results[0] });
        } else {
            res.status(404).send('Tree not found');
        }
    });
});

// Handle edit-tree form submission
app.post('/edit-tree/:id', (req, res) => {
    const treeId = req.params.id;
    const { name, scientific_name, family, species, description } = req.body;
    const qrCodeData = `
        Name: ${name}
        Scientific Name: ${scientific_name}
        Family: ${family}
        Species: ${species}
        Description: ${description}
    `;

    qrcode.toDataURL(qrCodeData, (err, url) => {
        if (err) {
            console.error('Error generating QR code:', err);
            return res.status(500).send('Server error');
        }

        db.query('UPDATE trees SET name = ?, scientific_name = ?, family = ?, species = ?, description = ?, qr_code = ? WHERE id = ?', 
        [name, scientific_name, family, species, description, url, treeId], (err, result) => {
            if (err) {
                console.error('Error updating tree:', err);
                return res.status(500).send('Server error');
            }
            res.redirect('/index');
        });
    });
});

// Handle delete-tree request
app.post('/delete-tree/:id', (req, res) => {
    const treeId = req.params.id;
    db.query('DELETE FROM trees WHERE id = ?', [treeId], (err, result) => {
        if (err) {
            console.error('Error deleting tree:', err);
            return res.status(500).send('Server error');
        }
        res.redirect('/index');
    });
});

// Serve the user home page
app.get('/user/home', (req, res) => {
    res.render('userHome');
});



app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});