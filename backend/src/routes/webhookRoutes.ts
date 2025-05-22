import { Router } from "express";
import * as webhookController from '../controllers/webhookController'

const router = Router();

// Rotas WebHooks
router.post('/cashin', webhookController.receiveCashInWebhook);
router.post('cashout', webhookController.receiveCashOutWebhook);

export default router;
