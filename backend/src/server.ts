import app from './app';
import dotenv from 'dotenv'; //pra carregar as variaveis com segurança

dotenv.config();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
})