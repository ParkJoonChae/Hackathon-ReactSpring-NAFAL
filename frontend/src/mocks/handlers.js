import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/payments/approve', async () => {
    return HttpResponse.json({
      success: true,
      transactionId: 'mock_tx_123',
      amount: 10000,
      message: '결제 승인(Mock)'
    }, { status: 200 });
  }),
  http.post('/api/payments/fail', async () => {
    return HttpResponse.json({ success: false, message: '실패(Mock)' }, { status: 400 });
  }),
];


