"use client";
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function FinancialPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const companyId = (session?.user as any)?.companyId || 'default-company';

  useEffect(() => {
    fetch(`/api/dashboard?companyId=${companyId}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      });
  }, [companyId]);

  if (isLoading) return <div className="p-6 text-center">Carregando dados financeiros...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-600">Acompanhe seu faturamento e recebíveis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="text-green-600 h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Faturamento Mensal</p>
          <h3 className="text-3xl font-extrabold text-gray-900">R$ {data.stats.monthlyRevenue.toFixed(2)}</h3>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +12% em relação ao mês anterior
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="text-blue-600 h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Previsão Próximos 7 dias</p>
          <h3 className="text-3xl font-extrabold text-gray-900">R$ 1.450,00</h3>
          <p className="text-xs text-gray-500 font-medium mt-2">Baseado em agendamentos confirmados</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <CreditCard className="text-purple-600 h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Ticket Médio</p>
          <h3 className="text-3xl font-extrabold text-gray-900">R$ 55,00</h3>
          <p className="text-xs text-gray-500 font-medium mt-2">Por serviço realizado</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Desempenho Semanal</h2>
        {/* Simple CSS Bar Chart */}
        <div className="flex items-end space-x-4 h-48">
          {[
            { day: 'Seg', val: 40 },
            { day: 'Ter', val: 70 },
            { day: 'Qua', val: 45 },
            { day: 'Qui', val: 90 },
            { day: 'Sex', val: 100 },
            { day: 'Sáb', val: 80 },
            { day: 'Dom', val: 20 },
          ].map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center">
              <div 
                className="bg-blue-500 w-full rounded-t-lg transition-all hover:bg-blue-600"
                style={{ height: `${d.val}%` }}
              ></div>
              <span className="text-xs font-bold text-gray-400 mt-2">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
