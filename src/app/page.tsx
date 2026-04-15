"use client";
import React from 'react';
import Link from 'next/link';
import { Calendar, Zap, Shield, Phone, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">AgendaZap</span>
        </div>
        <div className="hidden md:flex space-x-8 font-medium text-gray-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Preços</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">Sobre</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-600 font-bold hover:text-gray-900 transition-colors">Entrar</Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-shadow hover:shadow-lg shadow-blue-200">
            Começar Agora
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center md:text-left grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Zap className="h-4 w-4" />
            <span>O Agendamento nº 1 para Autônomos no Brasil</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Reduza faltas em até <span className="text-blue-600">80%</span> com WhatsApp e Pix
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-lg">
            A agenda inteligente que cobra sinal automático e lembra seus clientes via WhatsApp. Menos tempo no celular, mais dinheiro no bolso.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-blue-100">
              <span>Criar Minha Agenda Grátis</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/booking/default-company" className="border-2 border-gray-100 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all text-center">
              Ver Demo ao Vivo
            </Link>
          </div>
          <div className="mt-8 flex items-center space-x-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Sem cartão de crédito</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Setup em 2 minutos</span>
          </div>
        </div>
        <div className="relative animate-in zoom-in-95 duration-700">
          <div className="bg-blue-600/5 absolute -inset-4 rounded-3xl -rotate-2 -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
            alt="Barbearia Moderna" 
            className="rounded-2xl shadow-2xl border border-gray-100"
          />
          {/* Floating Card */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl border border-gray-50 max-w-xs animate-bounce-slow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-bold text-sm">Pagamento Confirmado!</span>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              "João acabou de pagar o sinal via Pix. Agendamento garantido para amanhã às 14h."
            </p>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Tudo o que você precisa para crescer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Criado especificamente para o comportamento do cliente brasileiro.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "WhatsApp Automático", 
                desc: "Lembretes de 24h e 2h antes do horário para que ninguém esqueça.",
                icon: Phone,
                color: "bg-green-50 text-green-600"
              },
              { 
                title: "Cobrança de Sinal via Pix", 
                desc: "Receba uma parte do valor no ato do agendamento e elimine os 'furos'.",
                icon: Zap,
                color: "bg-blue-50 text-blue-600"
              },
              { 
                title: "Gestão Completa de Clientes", 
                desc: "Histórico de visitas, faturamento por cliente e lembretes de retorno.",
                icon: Calendar,
                color: "bg-purple-50 text-purple-600"
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                <div className={`${f.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-extrabold text-blue-600 mb-1">10k+</p>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Agendamentos</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-600 mb-1">R$ 500k+</p>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Processados</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-600 mb-1">80%</p>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Menos Faltas</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-600 mb-1">15 min</p>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Salvos por dia</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
            Pronto para colocar seu negócio no piloto automático?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Junte-se a centenas de barbeiros, manicures e profissionais que já estão faturando mais com o AgendaZap.
          </p>
          <Link href="/register" className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all inline-block shadow-2xl">
            Começar Grátis Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-xl font-bold">AgendaZap</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 AgendaZap. Todos os direitos reservados. Feito com ❤️ no Brasil.</p>
          <div className="flex space-x-6 text-gray-400 font-medium text-sm">
            <a href="#" className="hover:text-gray-900 transition-colors">Termos</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contato</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
