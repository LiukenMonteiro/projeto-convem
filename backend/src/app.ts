import express from 'express';
import cors from 'cors'
import routes from './routes'

const app = express();

//Middlewares
app.use(express.json());
app.use(cors()); // é um mecanismo de segurança implementado nos navegadores para controlar o acesso a recursos de diferentes origens

//rotas
app.use(routes);

export default app;