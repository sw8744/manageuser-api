const express = require('express');
const app = express();
const mysql = require('mysql2');
var session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
app.use(cors());

const connection = mysql.createConnection({
    host: '210.114.22.146',
    user: 'root',
    password: 'ishs123!',
    database: 'test',
    enableKeepAlive: true
});


var options = {
    host: '210.114.22.146',
    user: 'root',
    password: 'ishs123!',
    database: 'sessions'
};

var sessionStore = new MySQLStore(options);

connection.connect(function (err) {
    if (err) throw err;
    else {
        console.log('Successfully Connected');
    }
});


app.use(session({
    secret: 'WwAaSsDdQqEeFf!@#$',
    resave: false,
    saveUninitialized: true,
    HttpOnly: true,
    store: sessionStore
}));


app.get('/register', function (req, res) {
    const q = req.query;
    const gisu = q.gisu;
    const stunum = q.stunum;
    const id = q.id;
    const privilege = q.privilege;
    const password = q.password;
    var bool_error = true;
    if(gisu != undefined && stunum != undefined && id != undefined && privilege != undefined && password != undefined) {
            if(stunum != null && stunum.length == 4 && id != null && privilege != null && password != null && password != null) {
                connection.query('SELECT `key` FROM users WHERE `key`=' + gisu + stunum, function (err, result) {
                    if (err) throw err;
                    if(result.length > 0) {
                        bool_error = true;
                        res.json('Same_Key_Exists');
                    }
                });
                connection.query('SELECT name FROM users WHERE name=\'' + id + '\'', function(err, result) {
                    if (err) throw err;
                    if(bool_error == false && result.length > 0) { 
                        bool_error = true;
                        res.json('Same_ID_Exists');
                    }
                })
                if(!bool_error) {
                    connection.query('INSERT INTO users VALUES (' + gisu + stunum + ', \'' + id + '\', ' + privilege + ', ' + password + ');', function (err, result) {
                        if (err) throw err;
                        res.json('Successfully_Registered');
                    });
                }
            }
            else {
                res.json('Error');
            }
    }
    else {
        res.json('Error');
    }
    
});

app.get('/login', function(req, res) {
    const q = req.query;
    const id = q.id;
    const pw = q.password;
    if(id != undefined && pw != undefined) {
            connection.query('SELECT * FROM users WHERE name=\'' + id + '\'', function(err, result) {
            if (err) throw err;
            if(result.length != 0) {
                const pw_db = result[0].password;
                if(pw_db === pw) {
                    req.session.id = result[0].name;
                    req.session.stunum = result[0].key;
                    req.session.privilege = result[0].privilege;
                    req.session.isLogined = true;
                }
                else {
                    res.json('Incorrect_Password');
                }
            }
            else {
                res.json('ID_Not_Exists');
            }
        });
    }
    else {
        res.json('Error');
    }
});

app.listen(3000);