'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function CheckoutPage() {
  const amount = 19.99;
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const merchantId = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID;

  const onScriptLoad = () => {
    console.log('PayPal SDK geladen');
    // @ts-ignore
    if (window.paypal) {
      // @ts-ignore
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [{
              amount: {
                currency_code: "EUR",
                value: amount.toString()
              },
              payee: {
                merchant_id: merchantId,
                email_address: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            console.log('Transaktion erfolgreich', details);
            alert('Zahlung erfolgreich! Transaktions-ID: ' + details.id);
          });
        }
      }).render('#paypal-button-container');
    } else {
      console.error('PayPal SDK nicht gefunden');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <Script 
        src={`https://www.sandbox.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&merchant-id=${merchantId}`}
        onLoad={onScriptLoad}
        onError={(e) => console.error('Script Ladefehler:', e)}
      />
      
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="mb-6">
        <div className="text-lg font-semibold">Gesamtbetrag:</div>
        <div className="text-3xl font-bold text-green-600">{amount.toFixed(2)} €</div>
      </div>

      <div id="paypal-button-container" className="min-h-[150px]" />
    </div>
  );
}
