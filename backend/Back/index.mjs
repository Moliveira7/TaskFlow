import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './data.mjs'; // Importando o banco de dados

const app = express();
const port = 3002;

// Array para armazenar as tarefas na memória (como uma simulação de banco de dados)
let tasks = [];

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rota principal
app.get('/', (req, res) => {
    res.send('THE API Rodando!');
});

// Endpoint de cadastro de usuário
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Verificar se email e password estão presentes
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios!' });
    }

    // Verificar se o usuário já existe
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (row) {
            return res.status(400).json({ message: 'Usuário já existe!' });
        }

        // Criptografar a senha
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Inserir novo usuário
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Erro ao cadastrar usuário!' });
            }

            const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
            res.status(201).json({ token });
        });
    });
});

// Endpoint para cadastro de múltiplos usuários
app.post('/register-multiple', (req, res) => {
    const usersArray = req.body.users;

    if (!Array.isArray(usersArray) || usersArray.length === 0) {
        return res.status(400).json({ message: 'A lista de usuários é inválida ou vazia!' });
    }

    const errors = [];

    usersArray.forEach(user => {
        const { email, password } = user;

        if (!email || !password) {
            errors.push(`E-mail e senha são obrigatórios para o usuário: ${email}`);
            return;
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (row) {
                errors.push(`Usuário já existe: ${email}`);
            } else {
                const hashedPassword = bcrypt.hashSync(password, 8);
                db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
                    if (err) {
                        errors.push(`Erro ao cadastrar o usuário: ${email}`);
                    }
                });
            }
        });
    });

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Erros durante o cadastro de múltiplos usuários', errors });
    }

    res.status(201).json({ message: 'Usuários cadastrados com sucesso!' });
});

// Endpoint de login de usuário
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado!' });
        }

        // Verificar a senha
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ accessToken: null, message: 'Senha inválida!' });
        }

        // Criar um token JWT
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
        res.status(200).json({ accessToken: token });
    });
});

// Endpoint para listar todos os usuários
app.get('/users', (req, res) => {
    db.all('SELECT email FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao listar usuários!' });
        }
        res.json(rows);
    });
});

// Middleware para verificar o token JWT
function authenticateJWT(req, res, next) {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token.split(' ')[1], 'secret', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

// Endpoint para adicionar uma tarefa
app.post('/tasks', authenticateJWT, (req, res) => {
    const { title, description } = req.body;

    // Verificar se título e descrição estão presentes
    if (!title || !description) {
        return res.status(400).json({ message: 'Título e descrição são obrigatórios!' });
    }

    // Criar nova tarefa
    const newTask = { id: tasks.length + 1, title, description, completed: false, user: req.user.email };
    tasks.push(newTask);

    res.status(201).json(newTask);
});

// Endpoint para listar todas as tarefas do usuário
app.get('/tasks', authenticateJWT, (req, res) => {
    const userTasks = tasks.filter(task => task.user === req.user.email);
    res.json(userTasks);
});

// Endpoint para editar uma tarefa
app.put('/tasks/:id', authenticateJWT, (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description } = req.body;

    const task = tasks.find(t => t.id === taskId && t.user === req.user.email);
    if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada!' });
    }

    if (title) task.title = title;
    if (description) task.description = description;

    res.json(task);
});

// Endpoint para excluir uma tarefa
app.delete('/tasks/:id', authenticateJWT, (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== taskId || t.user !== req.user.email);

    res.status(204).send();
});

// Endpoint para deletar um usuário específico
app.delete('/users/:email', authenticateJWT, (req, res) => {
    const email = req.params.email;

    db.run('DELETE FROM users WHERE email = ?', [email], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao deletar o usuário!' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado!' });
        }
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});