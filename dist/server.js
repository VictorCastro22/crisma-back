"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const db = new sqlite3_1.default.Database(path_1.default.resolve(__dirname, 'attendance.db'), (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    }
    else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS attendance (turma TEXT, crismando TEXT, presenca TEXT)', (err) => {
        if (err) {
            console.error('Erro ao criar a tabela:', err.message);
        }
    });
});
app.post('/register', (req, res) => {
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
app.get('/reports', (req, res) => {
    db.all('SELECT turma, crismando, presenca FROM attendance', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
app.get('/update-null-values', (req, res) => {
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
