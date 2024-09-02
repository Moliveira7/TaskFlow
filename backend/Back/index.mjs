import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './data.mjs'; // Importando o banco de dados

const app = express();
const port = 3002;

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

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios!' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (row) {
            return res.status(400).json({ message: 'Usuário já existe!' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

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

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado!' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ accessToken: null, message: 'Senha inválida!' });
        }

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

    if (!title || !description) {
        return res.status(400).json({ message: 'Título e descrição são obrigatórios!' });
    }

    db.run('INSERT INTO tasks (title, description, completed, user_email) VALUES (?, ?, ?, ?)', 
        [title, description, false, req.user.email], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Erro ao criar tarefa!' });
            }
            res.status(201).json({ id: this.lastID, title, description, completed: false });
        }
    );
});

// **Endpoint para listar todas as tarefas do usuário com paginação**
app.get('/tasks', authenticateJWT, (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    // Validar os parâmetros de paginação
    const validPage = parseInt(page);
    const validLimit = parseInt(limit);

    if (isNaN(validPage) || validPage < 1) {
        return res.status(400).json({ message: 'Parâmetro "page" inválido!' });
    }
    if (isNaN(validLimit) || validLimit < 1) {
        return res.status(400).json({ message: 'Parâmetro "limit" inválido!' });
    }

    const offset = (validPage - 1) * validLimit;

    db.all(
        'SELECT * FROM tasks WHERE user_email = ? LIMIT ? OFFSET ?',
        [req.user.email, validLimit, offset],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao listar tarefas!' });
            }

            db.get('SELECT COUNT(*) AS total FROM tasks WHERE user_email = ?', [req.user.email], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao contar tarefas!' });
                }

                const totalTasks = result.total;
                const totalPages = Math.ceil(totalTasks / validLimit);

                res.json({
                    totalTasks,
                    totalPages,
                    currentPage: validPage,
                    tasks: rows
                });
            });
        }
    );
});

// Endpoint para editar uma tarefa
app.put('/tasks/:id', authenticateJWT, (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description } = req.body;

    if (isNaN(taskId)) {
        return res.status(400).json({ message: 'ID inválido!' });
    }

    if ((title && typeof title !== 'string') || (description && typeof description !== 'string')) {
        return res.status(400).json({ message: 'Título e descrição devem ser strings!' });
    }

    if (!title && !description) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar!' });
    }

    db.get('SELECT * FROM tasks WHERE id = ? AND user_email = ?', [taskId, req.user.email], (err, task) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar tarefa!' });
        }

        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada!' });
        }

        db.run('UPDATE tasks SET title = ?, description = ? WHERE id = ?', 
            [title || task.title, description || task.description, taskId], function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao atualizar tarefa!' });
                }

                res.json({
                    message: "Tarefa atualizada com sucesso!",
                    task: { id: taskId, title: title || task.title, description: description || task.description }
                });
            }
        );
    });
});

// Endpoint para excluir uma tarefa
app.delete('/tasks/:id', authenticateJWT, (req, res) => {
    const taskId = parseInt(req.params.id);
    
    db.run('DELETE FROM tasks WHERE id = ? AND user_email = ?', [taskId, req.user.email], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Erro ao excluir tarefa!' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada!' });
        }
        res.status(200).json({ message: 'Tarefa excluída com sucesso!' });
    });
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
