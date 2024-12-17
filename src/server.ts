import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'node:path';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// Configuração do banco de dados para usar um arquivo
const db = new sqlite3.Database(path.resolve(__dirname, 'attendance.db'));
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS attendance (turma TEXT, crismando TEXT, presenca TEXT)');
});

// Rota para registrar a presença
app.post('/register', (req: Request, res: Response) => {
    const { turma, crismando, presenca } = req.body;
    if (!turma || !crismando || !presenca) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    db.run('INSERT INTO attendance (turma, crismando, presenca) VALUES (?, ?, ?)', [turma, crismando, presenca], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registro salvo!' });
    });
});

// Rota para visualizar registros
app.get('/reports', (req: Request, res: Response) => {
    db.all('SELECT turma, crismando, presenca FROM attendance', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota temporária para atualizar registros existentes e remover valores null
app.get('/update-null-values', (req: Request, res: Response) => {
    db.run('UPDATE attendance SET turma = "Turma desconhecida" WHERE turma IS NULL');
    db.run('UPDATE attendance SET crismando = "Crismando desconhecido" WHERE crismando IS NULL');
    db.run('UPDATE attendance SET presenca = "Presenca desconhecida" WHERE presenca IS NULL', [], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Valores null atualizados!' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});