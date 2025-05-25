import { Router } from 'express';
import pixRoutes from './pixRoutes';
import webhookRoutes from './webhookRoutes'
import * as pixController from '../controllers/pixController'

const router = Router();

// rota principal
router.get('/', (req, res) => {
    res.json({
        message: 'API Pix Convem',
        version: '1.0.0'
    });
});

//rotas para pix
router.use('/pix', pixRoutes);
//rotas para os webhooks
router.use('/webhook', webhookRoutes);
//rotas de todas as transações
router.get('/transactions', pixController.listTransactions);
//rota de teste pro Asaas
router.get('/test/asaas', pixController.testAsaas);

export default router;