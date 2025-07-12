import dotenv from 'dotenv';

dotenv.config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';
// 'https://www.asaas.com/api/v3';

export {
    ASAAS_API_KEY,
    ASAAS_BASE_URL
}