// utils/validation.js

// Validação de email
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// Validação de senha
export const validatePassword = (password) => {
    return password.length >= 6; // Exemplo: senha deve ter pelo menos 6 caracteres
};

// Validação de campos obrigatórios
export const validateRequiredFields = (fields) => {
    for (const field of fields) {
        if (!field) {
            return false; // Retorna falso se algum campo obrigatório estiver vazio
        }
    }
    return true; // Todos os campos são válidos
};
