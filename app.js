const express = require('express');
const mysql = require('mysql2');
const app = express();

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c237_studentlistapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

// Enable form processing
app.use(express.urlencoded({
    extended: false
}));

// Display all students
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM student';

    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving students');
        }

        // Format Date of Birth as DD-MM-YYYY
        results.forEach(student => {
            const date = new Date(student.dob);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            student.dob = `${day}-${month}-${year}`;
        });

        res.render('index', { students: results });
    });
});

// Display one student
app.get('/student/:id', (req, res) => {
    const studentid = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentid = ?';

    connection.query(sql, [studentid], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving student by ID');
        }

        if (results.length > 0) {

            const date = new Date(results[0].dob);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            results[0].dob = `${day}-${month}-${year}`;

            res.render('student', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// Add Student page
app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

// Add Student
app.post('/addStudent', (req, res) => {
    const { name, dob, contact, image } = req.body;

    const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';

    connection.query(sql, [name, dob, contact, image], (error, results) => {
        if (error) {
            console.error('Error adding student:', error);
            return res.send('Error adding student');
        }

        res.redirect('/');
    });
});
app.get('/editStudent/:id', (req, res) => {
    const studentid = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentid = ?';

    connection.query(sql, [studentid], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }

        if (results.length > 0) {
            res.render('editStudent', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});
app.post('/editStudent/:id', (req, res) => {
    const studentid = req.params.id;
    const { name, dob, contact, image } = req.body;

    const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentid = ?';

    connection.query(sql, [name, dob, contact, image, studentid], (error, results) => {
        if (error) {
            console.error("Error updating student:", error);
            res.send('Error updating student');
        } else {
            res.redirect('/');
        }
    });
});
app.get('/deleteStudent/:id', (req, res) => {
    const studentid = req.params.id;
    const sql = 'DELETE FROM student WHERE studentid = ?';

    connection.query(sql, [studentid], (error, results) => {
        if (error) {
            console.error("Error deleting student:", error);
            res.send('Error deleting student');
        } else {
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(`Server running on port http://localhost:${PORT}`)
);