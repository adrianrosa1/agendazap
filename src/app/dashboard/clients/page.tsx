"use client";
import React, { useState, useEffect } from 'react';
import { User, Phone, MessageSquare, Search, Zap } from 'lucide-react';
import { useSession } from "next-auth/react";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [inactiveClients, setInactiveClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("all"); // "all" or "inactive"

  const companyId = (session?.user as any)?.companyId || 'default-company';

  useEffect(() => {
    const fetchData = async () => {
      const [allRes, inactiveRes] = await Promise.all([
        fetch(`/api/clients?companyId=${companyId}`),
        fetch(`/api/clients/reactivation?companyId=${companyId}`)
      ]);
      
      const allData = await allRes.json();
      const inactiveData = await inactiveRes.json();
      
      setClients(allData);
      setInactiveClients(inactiveData);
      setIsLoading(false);
    };

    fetchData();
  }, [companyId]);

  const activeList = view === "all" ? clients : inactiveClients;

  const filteredClients = activeList.filter((client: any) => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const generateAIReactivation = async (client: any) => {
    const res = await fetch('/api/ai-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reactivation',
        clientName: client.name,
        companyName: session?.user?.name || 'nossa barbearia',
        serviceName: client.appointments[0]?.service?.name || 'serviço'
      })
    });
    const data = await res.json();
    const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(data.message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600">Histórico e gestão da sua base de clientes.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setView("all")}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            view === "all" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Todos ({clients.length})
        </button>
        <button 
          onClick={() => setView("inactive")}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
            view === "inactive" ? "bg-orange-500 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Para Reativar ({inactiveClients.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-bold text-gray-600">Nome</th>
              <th className="p-4 text-sm font-bold text-gray-600">Contato</th>
              <th className="p-4 text-sm font-bold text-gray-600">Status</th>
              <th className="p-4 text-sm font-bold text-gray-600">Última Visita</th>
              <th className="p-4 text-sm font-bold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando...</td></tr>
            ) : filteredClients.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum cliente encontrado nesta lista.</td></tr>
            ) : (
              filteredClients.map((client: any) => {
                const lastVisitDate = client.appointments[0]?.date;
                const daysSinceLastVisit = lastVisitDate ? differenceInDays(new Date(), new Date(lastVisitDate)) : Infinity;
                
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span>{client.phone}</span>
                    </td>
                    <td className="p-4 text-sm">
                      {daysSinceLastVisit > 30 ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Sumido ({daysSinceLastVisit} dias)</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Ativo</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {lastVisitDate ? (
                        format(new Date(lastVisitDate), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Nunca"
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => generateAIReactivation(client)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center space-x-1 ml-auto"
                        title="Gerar convite personalizado com IA"
                      >
                        <Zap className="h-4 w-4" />
                        <span className="text-xs font-bold px-1">IA Reativar</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
