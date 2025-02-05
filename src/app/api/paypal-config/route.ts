import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    "clientId": process.env.PAYPAL_CLIENT_ID,
    currency: "EUR",
    intent: "capture",
    "merchant-id": process.env.PAYPAL_MERCHANT_ID,
  })
}