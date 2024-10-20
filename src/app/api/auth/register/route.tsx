import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Log para verificar a entrada
    console.log('Recebendo dados para registro:', { name, email });

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário já existir, retornar imediatamente
    if (existingUser) {
      console.log('Usuário já existe:', email);
      return NextResponse.json({ message: 'Usuário já existe' }, { status: 400 });
    }

    // Hash da senha com menos rounds para acelerar o processo
    const hashedPassword = await bcrypt.hash(password, 8); // Reduzido para 8 para testes

    // Criar novo usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accessLevel: 'user', // Por padrão, novos usuários são 'user'
      },
    });

    console.log('Usuário criado com sucesso:', user);

    return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
