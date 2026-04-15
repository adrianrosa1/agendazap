"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const companyId = (session?.user as any)?.companyId || 'default-company';

  const loadData = () => {
    fetch(`/api/dashboard?companyId=${companyId}`)
      .then(res => res.json())
      .then(resData => {
        console.log("Plan:", resData.company?.plan);
        setData(resData);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/appointments/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    loadData();
  };

  if (isLoading) return <div className="p-6">Carregando dashboard...</div>;

  const stats = [
    { name: 'Agendamentos Hoje', value: data.stats.appointmentsToday, icon: Calendar, color: 'text-blue-600' },
    { name: 'Faturamento Mensal', value: `R$ ${data.stats.monthlyRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { name: 'Novos Clientes', value: data.stats.newClients, icon: Users, color: 'text-purple-600' },
    { name: 'Taxa de Faltas', value: data.stats.noShowRate, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo de volta! Aqui está o resumo do seu negócio.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Agendamentos Recentes</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Ver todos</button>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentAppointments.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Nenhum agendamento encontrado.</p>
            ) : data.recentAppointments.map((app: any) => (
              <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{app.clientName}</h4>
                    <p className="text-sm text-gray-500">
                      {app.service.name} • {format(new Date(app.date), "dd/MM")} às {app.startTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {app.status === 'CONFIRMED' && (
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => updateStatus(app.id, 'COMPLETED')}
                        className="p-1 hover:bg-green-50 text-green-600 rounded" title="Concluído"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'CANCELLED')}
                        className="p-1 hover:bg-red-50 text-red-600 rounded" title="Faltou"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                    app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status === 'CONFIRMED' ? 'Confirmado' : 
                     app.status === 'COMPLETED' ? 'Concluído' :
                     app.status === 'CANCELLED' ? 'Cancelado/Falta' :
                     'Pendente'}
                  </span>
                  {app.paymentStatus === 'PAID' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Novo Agendamento</span>
            </button>
            <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Ver Financeiro</span>
            </button>
            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">Seu Link Público</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 flex items-center justify-between overflow-hidden">
                <code className="text-xs text-blue-600 font-mono truncate">
                  {`/booking/${(session?.user as any)?.companySlug || 'default'}`}
                </code>
                <button className="text-xs font-bold text-gray-600 hover:text-gray-900 ml-2">Copiar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
