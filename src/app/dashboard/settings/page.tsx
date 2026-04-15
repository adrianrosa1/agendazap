"use client";
import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, CreditCard, Bell, Save } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Configurações salvas com sucesso!");
    }, 1000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as preferências do seu negócio.</p>
      </header>

      <div className="max-w-4xl space-y-6">
        {/* Company Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="text-blue-600 h-6 w-6" />
            <h2 className="text-xl font-bold">Perfil do Negócio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Empresa</label>
              <input 
                type="text" 
                defaultValue={(session?.user as any)?.name || "Minha Barbearia"} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Slug da URL (Link Público)</label>
              <div className="flex items-center bg-gray-100 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-400 text-sm mr-1">agendazap.app/</span>
                <input 
                  type="text" 
                  defaultValue={(session?.user as any)?.companySlug || "meu-negocio"} 
                  className="bg-transparent outline-none text-sm font-bold flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Integration */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CreditCard className="text-green-600 h-6 w-6" />
              <h2 className="text-xl font-bold">Integração Asaas</h2>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Conectado</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Suas cobranças Pix são geradas automaticamente através desta chave.</p>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">API Key de Produção</label>
            <input 
              type="password" 
              value="********************************************************" 
              disabled
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400"
            />
            <p className="text-xs text-blue-600 mt-2 cursor-pointer font-bold">Alterar chave API</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="text-orange-500 h-6 w-6" />
            <h2 className="text-xl font-bold">Notificações</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Lembrete WhatsApp (24h antes)</p>
                <p className="text-sm text-gray-500">Enviar lembrete automático um dia antes do agendamento.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 rounded-md text-blue-600" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div>
                <p className="font-bold">Confirmação de Pagamento</p>
                <p className="text-sm text-gray-500">Notificar o cliente assim que o Pix for compensado.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 rounded-md text-blue-600" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-blue-100"
        >
          <Save className="h-5 w-5" />
          <span>{isSaving ? "Salvando..." : "Salvar Todas as Alterações"}</span>
        </button>
      </div>
    </div>
  );
}
