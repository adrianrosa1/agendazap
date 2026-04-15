"use client";
import React, { useState, useEffect, use } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Phone
} from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    // Fetch company and services
    fetch(`/api/services?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        setServices(data.services || []);
        setCompany(data.company);
      });

    // Mock professionals for now
    setProfessionals([
      { id: '1', name: 'Ricardo Santos' },
      { id: '2', name: 'Bruno Oliveira' }
    ]);
  }, [slug]);

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:00", "17:00"];

  const handleNextStep = () => setStep(step + 1);
  const handleBackStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientPhone: formData.phone,
          clientEmail: formData.email || 'cliente@agendazap.com',
          serviceId: selectedService.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          companyId: company.id,
          professionalId: selectedProfessional?.id
        })
      });

      const result = await res.json();
      if (result.success) {
        setBookingResult(result);
        if (result.paymentRequired) {
          window.location.href = `/booking/status/${result.appointment.id}`;
        } else {
          setStep(5);
        }
      } else {
        alert(result.error || "Erro ao agendar");
      }
    } catch (err) {
      alert("Falha na conexão");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return <div className="p-12 text-center font-bold">Carregando Agenda...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-1 w-full max-w-lg mx-auto bg-white md:my-8 md:rounded-2xl md:shadow-xl md:overflow-hidden flex flex-col">
        <div className="h-1.5 w-full bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        <div className="p-6 border-b border-gray-100 flex items-center">
          {step > 1 && step < 5 && (
            <button onClick={handleBackStep} className="mr-4 text-gray-400 hover:text-gray-600"><ChevronLeft className="h-6 w-6" /></button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-sm text-gray-500">Agendamento Online</p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4 text-center underline decoration-blue-500 underline-offset-4">O que vamos fazer hoje?</h2>
              {services.map((service) => (
                <button key={service.id} onClick={() => { setSelectedService(service); handleNextStep(); }}
                  className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group">
                  <div>
                    <h3 className="font-extrabold text-gray-900 group-hover:text-blue-700">{service.name}</h3>
                    <div className="flex items-center text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-gray-900">R$ {service.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Escolha a data</h2>
              <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((offset) => {
                  const date = addDays(new Date(), offset);
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button key={offset} onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-16 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200' : 'border-gray-100 text-gray-500 bg-gray-50 hover:border-gray-300'}`}>
                      <span className="text-[10px] uppercase font-black mb-1">{`${format(date, 'EEE', { locale: ptBR })}`}</span>
                      <span className="text-xl font-black">{`${format(date, 'd')}`}</span>
                    </button>
                  );
                })}
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-4">Horários disponíveis</h2>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => (
                  <button key={time} onClick={() => setSelectedTime(time)}
                    className={`py-4 rounded-xl border-2 font-black text-sm transition-all ${selectedTime === time ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-gray-100 text-gray-600 bg-gray-50 hover:border-gray-300'}`}>
                    {time}
                  </button>
                ))}
              </div>

              <button disabled={!selectedTime} onClick={handleNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest text-xs">
                <span>Continuar</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Confirme seus dados</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo" className="w-full p-5 bg-gray-100 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" />
                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Seu WhatsApp (00) 00000-0000" className="w-full p-5 bg-gray-100 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" />
                
                <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-24 w-24" /></div>
                  <h4 className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-[0.2em]">Resumo do Agendamento</h4>
                  <div className="space-y-1 relative z-10">
                    <p className="text-xl font-black">{selectedService.name}</p>
                    <p className="text-blue-200 text-sm font-bold flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
                    <p className="text-blue-200 text-sm font-bold flex items-center"><Clock className="h-4 w-4 mr-2" /> {selectedTime}</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end relative z-10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-blue-400">R$ {selectedService.price.toFixed(2)}</span>
                  </div>
                </div>

                <button disabled={isSubmitting} type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-6 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-xl shadow-green-100 active:scale-95 uppercase tracking-widest">
                  <span>{isSubmitting ? "AGENDANDO..." : "CONFIRMAR AGENDAMENTO"}</span>
                  <CheckCircle2 className="h-6 w-6" />
                </button>
              </form>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">Tudo Certo!</h2>
              <p className="text-gray-600 font-bold mb-8">Seu horário foi reservado com sucesso. Você receberá um lembrete no WhatsApp.</p>
              <button onClick={() => window.location.reload()} className="text-blue-600 font-black uppercase tracking-widest text-xs hover:underline">Fazer novo agendamento</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
