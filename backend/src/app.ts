import express from 'express';
import cors from 'cors'
import routes from './routes'

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

//rotas
app.use(routes);

export default app;