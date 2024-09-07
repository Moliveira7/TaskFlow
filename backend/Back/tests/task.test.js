import db from '../config/database.js';
import { createTask, getTasksByUser, updateTask, deleteTask } from '../models/taskModel.js';

// Limpar a tabela de tarefas antes de cada teste
beforeEach(async () => {
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks', (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
});

// Teste para criação de tarefa
test('Criação de tarefa', async () => {
  const task = await createTask('Test title', 'Test description', 'test@example.com');
  expect(task).toHaveProperty('id');
  expect(task.title).toBe('Test title');
});

// Teste para listagem de tarefas
test('Listagem de tarefas', async () => {
  const tasks = await getTasksByUser('test@example.com');
  expect(Array.isArray(tasks)).toBe(true);
});

// Teste para exclusão de tarefa
test('Exclusão de tarefa', async () => {
  // Criação de uma tarefa para exclusão
  const task = await createTask('Task to delete', 'Description', 'test@example.com');

  // Exclusão da tarefa
  await deleteTask(task.id, 'test@example.com');

  // Verificar que a tarefa foi excluída
  const tasks = await getTasksByUser('test@example.com');
  expect(tasks).not.toContainEqual(expect.objectContaining({ id: task.id }));
});