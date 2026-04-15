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
        </div>
      </header>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Planos que cabem no seu bolso</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comece grátis e escale conforme seu negócio cresce.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-100 rounded-3xl p-8 bg-white hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-2">Bronze</h3>
              <p className="text-gray-500 text-sm mb-6">Para quem está começando</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">Grátis</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Até 20 agendamentos/mês
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Link personalizado
                </li>
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl border-2 border-gray-100 font-bold hover:bg-gray-50 transition-colors">
                Começar Grátis
              </Link>
            </div>

            <div className="border-2 border-blue-600 rounded-3xl p-8 bg-white shadow-2xl relative scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                Mais Popular
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">Prata</h3>
              <p className="text-gray-500 text-sm mb-6">O essencial para autônomos</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">R$ 29,90</span>
                <span className="text-gray-400 text-sm font-medium">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-sm text-gray-600 font-bold">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Agendamentos Ilimitados
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  WhatsApp Automático
                </li>
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Escolher Prata
              </Link>
            </div>

            <div className="border border-gray-100 rounded-3xl p-8 bg-gray-50 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-2">Ouro</h3>
              <p className="text-gray-500 text-sm mb-6">Para faturamento garantido</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">R$ 59,90</span>
                <span className="text-gray-400 text-sm font-medium">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-sm text-gray-600 font-bold">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Cobrança de Sinal via Pix
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Dashboard de Receita IA
                </li>
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl border-2 border-gray-200 font-bold hover:bg-white transition-colors">
                Escolher Ouro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-8">Pronto para começar?</h2>
        <Link href="/register" className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all inline-block shadow-2xl">
          Criar Minha Agenda
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-blue-600" />
          <span className="text-xl font-bold">AgendaZap</span>
        </div>
        <p className="text-gray-400 text-sm">© 2024 AgendaZap. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
