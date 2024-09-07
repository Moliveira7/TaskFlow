import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const port = 3002;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
