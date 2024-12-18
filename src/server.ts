import express from 'express';
import type { Application, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'node:path';

const app: Application = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database(path.resolve(__dirname, 'attendance.db'), (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

db.serialize(() => {
    db.run(
        'CREATE TABLE IF NOT EXISTS attendance (turma TEXT, crismando TEXT, presenca TEXT)',
        (err) => {
            if (err) {
                console.error('Erro ao criar a tabela:', err.message);
            }
        }
    );
});

app.post('/register', (req: Request, res: Response) => {
    const { turma, crismando, presenca } = req.body;

    if (!turma || !crismando || !presenca) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    db.run(
        'INSERT INTO attendance (turma, crismando, presenca) VALUES (?, ?, ?)',
        [turma, crismando, presenca],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Registro salvo!' });
        }
    );
});

app.get('/reports', (req: Request, res: Response) => {
    db.all('SELECT turma, crismando, presenca FROM attendance', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/update-null-values', (req: Request, res: Response) => {
    db.run('UPDATE attendance SET turma = "Turma desconhecida" WHERE turma IS NULL');
    db.run('UPDATE attendance SET crismando = "Crismando desconhecido" WHERE crismando IS NULL');
    db.run(
        'UPDATE attendance SET presenca = "Presenca desconhecida" WHERE presenca IS NULL',
        [],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Valores null atualizados!' });
        }
    );
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});