"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Users
} from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug;

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Mock available times for demo
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:00"];

  useEffect(() => {
    // In a real app, fetch company and its data by slug
    const companyId = 'default-company';
    Promise.all([
      fetch(`/api/services?companyId=${companyId}`).then(res => res.json()),
      fetch(`/api/professionals?companyId=${companyId}`).then(res => res.json())
    ]).then(([sData, pData]) => {
      setServices(sData);
      setProfessionals(pData);
    });
  }, [slug]);

  const handleNextStep = () => setStep(step + 1);
  const handleBackStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          serviceId: selectedService.id,
          professionalId: selectedProfessional.id,
          date: selectedDate.toISOString(),
          startTime: selectedTime,
          companyId: 'default-company'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setBookingResult(data);
        setStep(5);
      } else {
        alert(data.error || "Erro ao realizar agendamento");
      }
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col font-sans">
      {/* Mobile-First Container */}
      <div className="flex-1 w-full max-w-lg mx-auto bg-white md:my-8 md:rounded-2xl md:shadow-xl md:overflow-hidden flex flex-col">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center">
          {step > 1 && step < 5 && (
            <button onClick={handleBackStep} className="mr-4 text-gray-400 hover:text-gray-600">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agendar Horário</h1>
            <p className="text-sm text-gray-500">Pronto em menos de 1 minuto</p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Escolha um serviço</h2>
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    handleNextStep();
                  }}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700">{service.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">R$ {service.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Professional */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Com quem?</h2>
              {professionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setSelectedProfessional(prof);
                    handleNextStep();
                  }}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-4 group"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700">{prof.name}</h3>
                    <p className="text-sm text-gray-500">Disponível hoje</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedProfessional({ id: null, name: "Qualquer um" });
                  handleNextStep();
                }}
                className="w-full text-center p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
              >
                Tanto faz, quero o primeiro horário
              </button>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Para quando?</h2>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const date = addDays(new Date(), offset);
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    return (
                      <button
                        key={offset}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-600' 
                            : 'border-gray-100 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xs uppercase font-medium">{format(date, 'EEE', { locale: ptBR })}</span>
                        <span className="text-lg font-bold">{format(date, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Que horas?</h2>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                        selectedTime === time 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-gray-100 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!selectedTime}
                onClick={handleNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2"
              >
                <span>Continuar</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Step 4: Client Info */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Seus dados</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none"
                />
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Seu WhatsApp (00) 00000-0000"
                  className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none"
                />
                
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-widest">Resumo do Agendamento</h4>
                  <p className="text-sm font-bold">{selectedService.name}</p>
                  <p className="text-sm text-blue-700">Com {selectedProfessional.name}</p>
                  <p className="text-sm text-blue-700">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
                  <p className="text-lg font-bold text-blue-900 mt-2">R$ {selectedService.price.toFixed(2)}</p>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  {isSubmitting ? "Processando..." : "Confirmar e Pagar Sinal"}
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && bookingResult && (
            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Realizado!</h2>
              <p className="text-gray-600 mb-8">Pague o Pix abaixo para garantir seu horário.</p>

              <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                <p className="text-sm text-gray-500 mb-2 font-medium uppercase">Total a pagar</p>
                <p className="text-3xl font-bold text-gray-900">R$ {selectedService.price.toFixed(2)}</p>
              </div>

              {bookingResult.invoiceUrl && (
                <a href={bookingResult.invoiceUrl} target="_blank" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl block shadow-lg">
                  Pagar agora com Pix
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
