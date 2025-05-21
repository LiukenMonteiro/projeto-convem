export interface PixQRCode {
    id: string;
    value: number;
    qrCodeImage: string;
    qrCodeText: string;
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
    asaasId: string;
    description: string;
    createdAt: string;
    processedAt?: string;
}