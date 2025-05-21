import axios from 'axios';
import { ASAAS_API_KEY, ASAAS_BASE_URL } from '../config/database';

export class AsaasService {
    private baseUrl: string;
    private headers: any;

    constructor() {
        this.baseUrl = ASAAS_BASE_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY,
        };
    }

    // Gerando o QR code, o bichão.
    async generatePixQRCode(value: number, description: string): Promise<any> {
       try {
         const response = await axios.post(
            `${this.baseUrl}/pix/qrCodes`,
            { value, description },
            { headers: this.headers }
       );
       return response.data;
       } catch (error: any) { 
            console.error('Erro ao gerar QR Code Pix:', error.response?.data || error.message);
            throw error;
        }
       }

       // Solicitando saque
       async requestCashOut(value: number, pixKey: string, pixKeyType: string, description: string): Promise<any> {
        try {
            const response = await axios.post(
              `${ this.baseUrl }/pix/transfers`,
              { value, pixKey, pixKeyType, description },
              { headers: this.headers }
            );

            return response.data;
          } catch (error: any) {
            console.error('Erro ao solicitar saque Pix:', error.response?.data || error.message);
            throw error;
         }
       }

    }