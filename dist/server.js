"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3001;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// Configuração do banco de dados
const db = new sqlite3_1.default.Database(':memory:');
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
