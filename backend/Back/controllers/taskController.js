import { 
  createTask as createTaskModel, 
  getTasksByUser as getTasksByUserModel, 
  updateTask as updateTaskModel, 
  deleteTask as deleteTaskModel 
} from '../models/taskModel.js';

// Controlador para criar tarefa
export const createTaskController = async (req, res) => {
  const { title, description, user_email } = req.body;
  try {
    const task = await createTaskModel(title, description, user_email);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
};

// Controlador para buscar tarefas do usuário
export const getTasksByUserController = async (req, res) => {
  const { user_email } = req.params;
  try {
    const tasks = await getTasksByUserModel(user_email);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Nenhuma tarefa encontrada para este usuário.' });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
};

// Controlador para atualizar tarefa
export const updateTaskController = async (req, res) => {
  const { id } = req.params;
  const { title, description, user_email } = req.body;
  try {
    const task = await updateTaskModel(id, title, description, user_email);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
};

// Controlador para excluir tarefa
export const deleteTaskController = async (req, res) => {
  const { id } = req.params;
  const { user_email } = req.body;
  try {
    await deleteTaskModel(id, user_email);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
};
