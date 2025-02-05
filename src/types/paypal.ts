export interface PayPalActions {
  order: {
    create: (data: PayPalOrderConfig) => Promise<string>;
    capture: () => Promise<PayPalCaptureResponse>;
  };
}

export interface PayPalOrderConfig {
  intent: string;
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
      breakdown: {
        item_total: {
          currency_code: string;
          value: string;
        };
        tax_total: {
          currency_code: string;
          value: string;
        };
      };
    };
    items: {
      name: string;
      quantity: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
    }[];
  }[];
}

export interface PayPalCaptureResponse {
  payer: Record<string, unknown>;
  status: string;
} 