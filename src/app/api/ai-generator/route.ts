import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, clientName, companyName, serviceName, time } = body;

    // Simulated AI response for reminders/reactivations
    // In production, you would call OpenAI here
    let message = "";

    if (type === "reactivation") {
      message = `Olá ${clientName}! Já faz mais de um mês que não te vemos na ${companyName}. O seu último serviço foi ${serviceName} e você ficou incrível! Que tal reservar um horário para esta semana? Temos algumas vagas amanhã. Reserve aqui: [LINK]`;
    } else if (type === "reminder") {
      message = `Tudo bem, ${clientName}? Passando para te lembrar do seu horário de ${serviceName} na ${companyName} hoje às ${time}. Se precisar desmarcar, avise com antecedência. Até logo!`;
    }

    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
