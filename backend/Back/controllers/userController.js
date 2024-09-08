import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/userModel.js'; // Importando do userModel
import db from '../config/database.js';

const secretKey = process.env.JWT_SECRET || 'default_secret_key';

// Função para gerar um token JWT
const generateToken = (email) => {
    return jwt.sign({ email }, secretKey, { expiresIn: '1h' });
};

// Registrar usuário
export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    // Verificação básica de campos obrigatórios
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios!' });
    }

    try {
        // Verificar se o usuário já existe
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe!' });
        }

        // Criptografar senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir novo usuário no banco de dados
        await createUser(email, hashedPassword);

        // Gerar token JWT
        const token = generateToken(email);
        res.status(201).json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar usuário!', error: error.message });
    }
};

// Função para atualizar usuário
export const updateUser = async (req, res) => {
    const { email } = req.params;
    const { newEmail, newPassword } = req.body;

    try {
        // Lógica para atualizar o usuário
        const updatedUser = await updateUserModel(email, newEmail, newPassword);
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o usuário!', error: error.message });
    }
};

// Login de usuário
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar se o usuário existe
        const user = await findUserByEmail(email);
        console.log('User from DB:', user); // Adicione este log para depuração

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado!' });
        }

        // Verificar se a senha está correta
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(hashedPassword, user.password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ accessToken: null, message: 'Senha inválida!' });
        }

        // Gerar token JWT
        const token = generateToken(email);
        res.status(200).json({ accessToken: token });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login!', error: error.message });
    }
};

// Deletar usuário
export const deleteUser = async (req, res) => {
    const { email } = req.params;

    try {
        // Excluir usuário do banco de dados
        const result = await new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE email = ?', [email], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });

        if (result === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado!' });
        }

        res.status(200).json({ message: 'Usuário deletado com sucesso!' });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar o usuário!', error: error.message });
    }
};
