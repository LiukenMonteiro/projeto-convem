import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
})