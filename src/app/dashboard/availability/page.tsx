"use client";
import React, { useState, useEffect } from 'react';
import { Save, Clock, Calendar } from 'lucide-react';
import { useSession } from "next-auth/react";

const DAYS_OF_WEEK = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado"
];

export default function AvailabilityPage() {
  const { data: session } = useSession();
  const [availability, setAvailability] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const companyId = (session?.user as any)?.companyId || 'default-company';

  useEffect(() => {
    fetch(`/api/availability?companyId=${companyId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailability(data);
        }
      });
  }, [companyId]);

  const handleToggleDay = (dayIndex: number) => {
    const existing = availability.find(a => a.dayOfWeek === dayIndex);
    if (existing) {
      setAvailability(availability.filter(a => a.dayOfWeek !== dayIndex));
    } else {
      setAvailability([...availability, { dayOfWeek: dayIndex, startTime: "09:00", endTime: "18:00" }]);
    }
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(availability.map(a => 
      a.dayOfWeek === dayIndex ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilities: availability, companyId })
      });
      if (response.ok) {
        alert("Configurações salvas!");
      }
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disponibilidade</h1>
          <p className="text-gray-600">Defina seus horários de trabalho regulares.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
        </button>
      </header>

      <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayAvailability = availability.find(a => a.dayOfWeek === index);
            return (
              <div key={day} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4 w-1/3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="font-bold text-gray-900">{day}</span>
                </div>
                
                <div className="flex items-center space-x-4 w-2/3 justify-end">
                  {dayAvailability ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="time" 
                          value={dayAvailability.startTime}
                          onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                          className="border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <span className="text-gray-400">até</span>
                        <input 
                          type="time" 
                          value={dayAvailability.endTime}
                          onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                          className="border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <button 
                        onClick={() => handleToggleDay(index)}
                        className="text-red-500 text-sm font-bold hover:underline"
                      >
                        Fechar
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleToggleDay(index)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      + Abrir Horário
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start space-x-4">
        <Clock className="h-6 w-6 text-blue-600 mt-1" />
        <div>
          <h4 className="font-bold text-blue-900">Dica de Produtividade</h4>
          <p className="text-blue-800 text-sm">
            Defina intervalos automáticos entre seus agendamentos para garantir que você tenha tempo para se preparar para o próximo cliente.
          </p>
        </div>
      </div>
    </div>
  );
}
