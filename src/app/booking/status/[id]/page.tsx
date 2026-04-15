"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, Copy, ExternalLink, Zap } from 'lucide-react';

export default function BookingStatus() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/appointments/status/${id}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-sans">Carregando...</div>;
  if (!data || !data.appointment) return <div className="min-h-screen flex items-center justify-center font-sans">Agendamento não encontrado.</div>;

  const { appointment, pixData } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans p-4">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden mt-8">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Reserva Quase Pronta!</h1>
          <p className="text-blue-100">Pague o sinal para confirmar seu horário.</p>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium">Serviço</span>
              <span className="font-bold text-gray-900">{appointment.service.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium">Data e Hora</span>
              <span className="font-bold text-gray-900">{new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.startTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Valor do Sinal</span>
              <span className="text-xl font-extrabold text-blue-600 text-green-600">R$ 10,00</span>
            </div>
          </div>

          {appointment.paymentStatus === 'PAID' ? (
            <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-green-800">Pagamento Confirmado!</h3>
              <p className="text-sm text-green-600">Seu horário está garantido. Te esperamos lá!</p>
            </div>
          ) : pixData ? (
            <div className="space-y-6 text-center">
              <div className="bg-gray-100 p-4 rounded-2xl inline-block">
                <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="QR Code Pix" className="w-48 h-48 mx-auto" />
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pixData.payload);
                  alert("Código Pix copiado!");
                }}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2"
              >
                <Copy className="h-5 w-5" />
                <span>Copiar Código Pix</span>
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">Aguardando geração do Pix...</p>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-1">Local do Atendimento</p>
            <h4 className="font-bold text-gray-700">{appointment.company.name}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
