"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Clock, DollarSign } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function ServicesPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simplified company ID for the prototype
  const companyId = (session?.user as any)?.companyId || 'default-company';

  useEffect(() => {
    fetch(`/api/services?companyId=${companyId}`)
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setIsLoading(false);
      });
  }, [companyId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços que você oferece aos seus clientes.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Novo Serviço</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Carregando...</p>
        ) : services.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 mb-4">Você ainda não tem serviços cadastrados.</p>
            <button className="text-blue-600 font-bold">Adicionar meu primeiro serviço</button>
          </div>
        ) : (
          services.map((service: any) => (
            <div key={service.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{service.duration} min</span>
                </div>
                <div className="flex items-center text-green-600 font-bold">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
