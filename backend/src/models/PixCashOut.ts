export interface PixCashOut {
    id: string;
    value : number;
    pixKey: string;
    pixKeyType: | 'CPF' | 'EMAIL' | 'PHONE' | 'EVP';
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
    asaasId: string;
    description: string;
    createdAt: string;
    processedAt?: string;
}