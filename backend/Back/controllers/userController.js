import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const registerUser = (req, res) => {
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
};

export const loginUser = (req, res) => {
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
};

export const deleteUser = (req, res) => {
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
};
