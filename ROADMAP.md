# Roadmap AgendaZap - Fase 2: Escala e Inteligência

Este documento descreve os próximos passos para transformar o MVP em um produto comercial completo.

## 1. Infraestrutura e Deploy (Alta Prioridade)
- [ ] **Migração para PostgreSQL**: Alterar o provedor do Prisma de `sqlite` para `postgresql` no `schema.prisma`.
- [ ] **Configuração Supabase**: Configurar banco de dados gerenciado no Supabase.
- [ ] **Deploy Vercel**: Realizar o deploy do front e back-end no Vercel.
- [ ] **Webhooks de Produção**: Configurar o Asaas para enviar notificações de pagamento para a URL da Vercel.

## 2. Comunicação e Notificações Reais
- [ ] **Integração Z-API**: Substituir o mock em `src/lib/notifications.ts` pela API real do WhatsApp.
- [ ] **Sistema de Lembretes**: Criar um worker/cron job para enviar lembretes automáticos 24h e 2h antes de cada agendamento.

## 3. CRM e Retenção de Clientes
- [x] **Painel do Cliente**: Implementar visualização detalhada de histórico por cliente no dashboard.
- [ ] **Automação de Reativação**: Lógica para identificar clientes que não voltam há 30 dias e enviar convite automático.

## 4. Inteligência Artificial (Diferencial)
- [ ] **IA Copywriting**: Integrar OpenAI para personalizar o tom das mensagens de lembrete.
- [ ] **Análise de Previsão**: Dashboard com previsão de faturamento baseada na recorrência dos clientes.

## 5. Expansão de Produto
- [ ] **Multi-Usuários por Empresa**: Permitir que uma barbearia tenha vários barbeiros, cada um com sua agenda.
- [ ] **App Mobile (PWA)**: Facilitar o acesso do profissional pelo celular.
