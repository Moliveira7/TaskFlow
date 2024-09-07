import db from '../config/database.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

// Criar usuário
export const createUser = (email, hashedPassword) => {
  return new Promise((resolve, reject) => {
    // Validação de email
    if (!validateEmail(email)) {
      return reject(new Error('Email inválido'));
    }
    
    // Validação de senha
    if (!validatePassword(hashedPassword)) {
      return reject(new Error('A senha deve ter pelo menos 6 caracteres'));
    }

    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, email });
    });
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
  return new Promise((resolve, reject) => {
    // Validação de novo email
    if (newEmail && !validateEmail(newEmail)) {
      return reject(new Error('Email inválido'));
    }
    
    // Validação de nova senha
    if (newPassword && !validatePassword(newPassword)) {
      return reject(new Error('A senha deve ter pelo menos 6 caracteres'));
    }

    const query = 'UPDATE users SET email = ?, password = ? WHERE email = ?';
    db.run(query, [newEmail || email, newPassword || '', email], function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ email: newEmail || email });
    });
  });
};
