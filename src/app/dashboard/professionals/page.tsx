"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Plus, Trash2 } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function ProfessionalsPage() {
  const { data: session } = useSession();
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProf, setNewProf] = useState({ name: "", email: "" });

  const companyId = (session?.user as any)?.companyId || 'default-company';

  useEffect(() => {
    fetch(`/api/professionals?companyId=${companyId}`)
      .then(res => res.json())
      .then(data => {
        setProfessionals(data);
        setIsLoading(false);
      });
  }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProf, companyId })
    });
    if (res.ok) {
      const added = await res.json();
      setProfessionals([...professionals, added] as any);
      setIsAdding(false);
      setNewProf({ name: "", email: "" });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600">Gerencie os membros da sua equipe.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Profissional</span>
        </button>
      </header>

      {isAdding && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h3 className="font-bold mb-4">Adicionar Profissional</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Nome" 
              required
              className="border p-2 rounded-lg"
              value={newProf.name}
              onChange={(e) => setNewProf({...newProf, name: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="E-mail" 
              required
              className="border p-2 rounded-lg"
              value={newProf.email}
              onChange={(e) => setNewProf({...newProf, email: e.target.value})}
            />
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-green-500 text-white font-bold rounded-lg px-4">Salvar</button>
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-lg px-4">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Carregando...</p>
        ) : professionals.map((prof: any) => (
          <div key={prof.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{prof.name}</h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Mail className="h-3 w-3 mr-1" /> {prof.email}
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
