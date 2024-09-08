import db from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateEmail, validatePassword } from '../utils/validation.js';

const secretKey = process.env.JWT_SECRET || 'seu_segredo'; // Utilize variáveis de ambiente para a chave secreta

// Criar usuário (com hash da senha)
export const createUser = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validação de email
      if (!validateEmail(email)) {
        return reject(new Error('Email inválido'));
      }

      // Validação de senha
      if (!validatePassword(password)) {
        return reject(new Error('A senha deve ter pelo menos 6 caracteres'));
      }

      // Gerar hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, email });
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Buscar usuário por e-mail
export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

// Excluir usuário
export const deleteUser = (email) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE email = ?', [email], function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

// Atualizar usuário
export const updateUser = (email, newEmail, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validação de novo email
      if (newEmail && !validateEmail(newEmail)) {
        return reject(new Error('Email inválido'));
      }

      // Validação de nova senha
      if (newPassword && !validatePassword(newPassword)) {
        return reject(new Error('A senha deve ter pelo menos 6 caracteres'));
      }

      // Gerar hash da nova senha (se fornecida)
      const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : null;

      const query = 'UPDATE users SET email = ?, password = ? WHERE email = ?';
      db.run(query, [newEmail || email, hashedPassword || '', email], function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ email: newEmail || email });
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Autenticar usuário
export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    findUserByEmail(email)
      .then(async (user) => {
        if (!user) {
          return reject(new Error('Email ou senha inválidos'));
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return reject(new Error('Email ou senha inválidos'));
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
        resolve({ user, token });
      })
      .catch((err) => reject(err));
  });
};
