import db from '../config/database.js'; 
import { createUser, updateUser, deleteUser, findUserByEmail } from '../models/userModel.js';

// Limpar a tabela de usuários antes de cada teste
beforeEach(async () => {
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM users', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Criação de usuário', () => {
    it('deve criar um novo usuário com email único', async () => {
        const email = 'teste@example.com';
        const password = 'senha123';

        const user = await createUser(email, password);
        expect(user).toBeTruthy(); 
    });
});

describe('Atualização de usuário', () => {
    it('deve atualizar o email e a senha de um usuário existente', async () => {
        // Cria um usuário
        await createUser('test@example.com', 'senha123');

        // Atualiza o usuário
        const updatedUser = await updateUser('test@example.com', 'newemail@example.com', 'novaSenha123');

        // Verifica se os dados foram atualizados corretamente
        const user = await findUserByEmail(updatedUser.email);
        expect(user.email).toBe('newemail@example.com');
    });

    it('deve retornar erro para email inválido', async () => {
        // Cria um usuário
        await createUser('test@example.com', 'senha123');

        // Tenta atualizar com um email inválido
        await expect(updateUser('test@example.com', 'invalidEmail', 'novaSenha123')).rejects.toThrow('Email inválido');
    });

    it('deve retornar erro para senha inválida', async () => {
        // Cria um usuário
        await createUser('test@example.com', 'senha123');

        // Tenta atualizar com uma senha inválida
        await expect(updateUser('test@example.com', 'newemail@example.com', '123')).rejects.toThrow('A senha deve ter pelo menos 6 caracteres');
    });

    it('deve manter o email se o novo email não for fornecido', async () => {
        // Cria um usuário
        await createUser('test@example.com', 'senha123');

        // Atualiza o usuário apenas com nova senha
        const updatedUser = await updateUser('test@example.com', undefined, 'novaSenha123');

        // Verifica se o email não foi alterado
        const user = await findUserByEmail('test@example.com');
        expect(user.email).toBe('test@example.com');
    });
});