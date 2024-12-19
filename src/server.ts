import express from 'express';
import type { Application, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'node:path';

const app: Application = express();
const port = 3001;

app.use(cors({
    origin: 'https://crisma-mpe.vercel.app',
}));

app.use(bodyParser.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'attendance.db'), (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Atualize a tabela para incluir a coluna catequista
db.serialize(() => {
    db.run('ALTER TABLE attendance ADD COLUMN catequista TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Erro ao adicionar coluna catequista:', err.message);
        }
    });
    db.run('CREATE TABLE IF NOT EXISTS attendance (turma TEXT, crismando TEXT, presenca TEXT, catequista TEXT)', (err) => {
        if (err) {
            console.error('Erro ao criar a tabela:', err.message);
        }
    });
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API está funcionando!' });
});

app.post('/register', (req: Request, res: Response) => {
    const { turma, crismando, presenca } = req.body;

    if (!turma || !crismando || !presenca) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const catequista = turma === 'R' ? 'Victor Manuel' : '';

    db.run(
        'INSERT INTO attendance (turma, crismando, presenca, catequista) VALUES (?, ?, ?, ?)',
        [turma, crismando, presenca, catequista],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Registro salvo!', turma, crismando, presenca, catequista });
        }
    );
});

app.get('/reports', (req: Request, res: Response) => {
    db.all('SELECT turma, crismando, presenca, catequista FROM attendance', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.delete('/delete-all', (req: Request, res: Response) => {
    db.run('DELETE FROM attendance', [], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Todos os registros foram excluídos!' });
    });
});

app.post('/computar', (req: Request, res: Response) => {
    res.json({ message: 'Computação realizada com sucesso' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});