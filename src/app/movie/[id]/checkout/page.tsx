"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function Checkout() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const seats = searchParams.get('seats'); // Get the 'seats' query parameter
  const [timeLeft, setTimeLeft] = useState(600); // 10 minute countdown

  useEffect(() => {
    if (timeLeft === 0) {
      // Redirect or handle timeout
      alert("Zeit abgelaufen! Bitte erneut versuchen.");
      router.push(`/movie/${params.id}`);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router, params.id]);

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-neutral-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Ihre ausgewählten Sitzplätze
          </h2>
          <p className="text-white">Movie: {params.id}</p>
          <p className="text-white">Sitzplätze: {seats}</p>
          <p className="text-white">Zeit zum Bezahlen: {timeLeft} Sekunden</p>
        </div>
        {/* Add payment form or button here */}
      </div>
    </div>
  );
}