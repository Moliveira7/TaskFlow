import TaskModel from '../models/taskModel.js';

// Criar nova tarefa
export const createTask = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Título e descrição são obrigatórios!' });
  }

  try {
    const task = await TaskModel.createTask(title, description, req.user.email);
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar tarefa!' });
  }
};

// Listar tarefas
export const listTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.getTasksByUser(req.user.email);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar tarefas!' });
  }
};

// Atualizar tarefa
export const updateTask = async (req, res) => {
  const { title, description } = req.body;
  const taskId = parseInt(req.params.id);

  if (!title && !description) {
    return res.status(400).json({ message: 'Nenhum campo para atualizar!' });
  }

  try {
    const updatedTask = await TaskModel.updateTask(taskId, title, description, req.user.email);
    res.json({ task: updatedTask });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa!' });
  }
};

// Excluir tarefa
export const deleteTask = async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    await TaskModel.deleteTask(taskId, req.user.email);
    res.status(200).json({ message: 'Tarefa excluída com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir tarefa!' });
  }
};
