"use client";
import React, { useEffect, useState, use } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, Copy, ExternalLink, Zap } from 'lucide-react';

export default function BookingStatus({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-sans text-gray-500 font-bold">Carregando...</div>;
  if (!data || !data.appointment) return <div className="min-h-screen flex items-center justify-center font-sans text-red-500 font-bold">Agendamento não encontrado.</div>;

  const { appointment, pixData } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans p-4">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden mt-8">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Reserva Quase Pronta!</h1>
          <p className="text-blue-100 font-medium">Pague o sinal para confirmar seu horário.</p>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Serviço</span>
              <span className="font-extrabold text-gray-900">{appointment.service.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Data e Hora</span>
              <span className="font-extrabold text-gray-900">{new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.startTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Valor do Sinal</span>
              <span className="text-2xl font-black text-green-600 tracking-tighter">R$ 10,00</span>
            </div>
          </div>

          {appointment.paymentStatus === 'PAID' ? (
            <div className="bg-green-50 p-6 rounded-2xl text-center border-2 border-green-100 animate-in fade-in zoom-in">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-green-800 text-lg">PAGAMENTO CONFIRMADO!</h3>
              <p className="text-sm text-green-600 font-medium">Seu horário está garantido. Te esperamos lá!</p>
            </div>
          ) : pixData ? (
            <div className="space-y-6 text-center">
              <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 inline-block shadow-sm">
                <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="QR Code Pix" className="w-56 h-56 mx-auto" />
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pixData.payload);
                  alert("Código Pix copiado!");
                }}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-transform shadow-xl"
              >
                <Copy className="h-5 w-5" />
                <span>COPIAR CÓDIGO PIX</span>
              </button>
              <p className="text-xs text-gray-400 font-medium">Após o pagamento, esta página atualizará automaticamente.</p>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin-slow" />
               <p className="text-sm text-gray-500 font-bold">Gerando seu Pix...</p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Local do Atendimento</p>
            <h4 className="font-extrabold text-gray-700 text-lg">{appointment.company.name}</h4>
          </div>
        </div>
      </div>
      <footer className="mt-auto py-8 text-center text-gray-400 text-xs font-bold">
        Powered by AgendaZap
      </footer>
    </div>
  );
}
