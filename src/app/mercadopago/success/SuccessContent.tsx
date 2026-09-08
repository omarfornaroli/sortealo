"use client";

import { apiFetch } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface PaymentData {
  external_reference: string;
  raffle_id: string;
  raffle_name: string;
  user_name: string;
  user_email: string;
  user_dni: string;
  user_phone: string;
  quantity: number;
  tickets: string[];
  total_price: number;
  payment_id?: string;
  collection_status?: string;
  merchant_order_id?: string;
  _id?: string;
}

export function SuccessContent() {
  const params = useSearchParams();
  
  // Datos recibidos de Mercado Pago
  const externalReference = params.get("external_reference");
  const paymentId = params.get("payment_id");
  const collectionId = params.get("collection_id");
  const collectionStatus = params.get("collection_status");
  const status = params.get("status");
  const preferenceId = params.get("preference_id");
  const merchantOrderId = params.get("merchant_order_id");

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // 1. Obtener datos de la transacción
        if (!externalReference) {
          setError("No se encontró el ID de la transacción");
          setLoading(false);
          return;
        }

        const res = await apiFetch(`/api/mercadopago/payment/${externalReference}`);
        if (!res.ok) {
          throw new Error("No se pudo cargar los datos de la transacción");
        }

        const data = await res.json();
        setPaymentData(data);

        // Verificar si el participante fue registrado
        if (data.participant_added) {
          setSuccess(true);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [externalReference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition"
          >
            Volver a inicio
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-700">No se encontraron datos de la transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">¡Pago exitoso!</h1>
          <p className="text-gray-600 mt-2">
            {success ? 'Participante registrado correctamente' : 'Tu compra ha sido procesada'}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del pago</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Sorteo</p>
              <p className="text-lg font-semibold text-gray-800">{paymentData.raffle_name}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Participante</p>
              <p className="text-lg font-semibold text-gray-800">{paymentData.user_name}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">DNI</p>
              <p className="text-lg font-mono text-gray-800">{paymentData.user_dni}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-mono text-gray-800">{paymentData.user_email}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="text-lg font-semibold text-gray-800">{paymentData.user_phone}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">ID de pago</p>
              <p className="text-lg font-mono text-gray-800 truncate">{paymentData.payment_id || 'Pendiente'}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Monto total</p>
              <p className="text-2xl font-bold text-green-600">${paymentData.total_price.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {paymentData.tickets && paymentData.tickets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Números comprados ({paymentData.tickets.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {paymentData.tickets.map((num: string, idx: number) => (
                  <div key={idx} className="bg-emerald-100 border-2 border-emerald-300 rounded-lg p-2 text-center">
                    <p className="text-xl font-bold text-emerald-700">{num}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded mb-6">
            <p className="text-sm text-gray-600 mb-2">Detalles completos de la transacción</p>
            <pre className="text-xs text-gray-700 overflow-auto max-h-48 bg-white p-3 rounded border border-gray-200">
              {JSON.stringify({
                external_reference: paymentData.external_reference,
                payment_id: paymentId,
                collection_status: collectionStatus,
                status: status,
                merchant_order_id: merchantOrderId,
                quantity: paymentData.quantity,
              }, null, 2)}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = `/raffles/${paymentData.raffle_id}`}
              className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition"
            >
              Ver sorteo
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Volver a inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
