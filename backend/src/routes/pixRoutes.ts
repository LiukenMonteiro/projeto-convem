import { Router } from "express";
import * as pixController from "../controllers/pixController";

const router = Router();

// as rotas de deposito (Cash In)
router.post('/qrcode', pixController.generatePixQRCode);
router.get('/qrcodes/', pixController.listPixQRCodes);

// as rotas de saque (Cash Out)
router.post('/cashout', pixController.requestCashOut);
router.get('/cashouts', pixController.listPixCashOuts);

export default router;