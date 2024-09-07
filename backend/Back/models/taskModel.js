import db from '../config/database.js';

// Criar tarefa
export const createTask = (title, description, user_email) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO tasks (title, description, completed, user_email) VALUES (?, ?, ?, ?)',
      [title, description, false, user_email],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, title, description, completed: false });
      }
    );
  });
};

// Buscar tarefas do usuário
export const getTasksByUser = (user_email) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tasks WHERE user_email = ?', [user_email], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

// Atualizar tarefa
export const updateTask = (id, title, description, user_email) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_email = ?',
      [title, description, id, user_email],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id, title, description });
      }
    );
  });
};

// Excluir tarefa
export const deleteTask = (id, user_email) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ? AND user_email = ?', [id, user_email], function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};
