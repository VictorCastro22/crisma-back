import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// Configuração do banco de dados
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run('CREATE TABLE attendance (className TEXT, studentName TEXT, attendance TEXT)');
});

// Rota para registrar a presença
app.post('/register', (req, res) => {
    const { className, studentName, attendance } = req.body;
    db.run('INSERT INTO attendance (className, studentName, attendance) VALUES (?, ?, ?)', [className, studentName, attendance], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registro salvo!' });
    });
});

// Rota para visualizar registros
app.get('/reports', (req, res) => {
    db.all('SELECT className AS turma, studentName AS crismando, attendance AS presenca FROM attendance', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});