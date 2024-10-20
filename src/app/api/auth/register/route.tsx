import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    console.time('Tempo total');

    // Registrar o início da leitura do corpo da requisição
    console.time('Leitura do corpo da requisição');
    const { name, email, password } = await req.json();
    console.timeEnd('Leitura do corpo da requisição');

    // Verificar se o usuário já existe
    console.time('Verificação de usuário existente');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    console.timeEnd('Verificação de usuário existente');

    if (existingUser) {
      console.log('Usuário já existe:', email);
      console.timeEnd('Tempo total');
      return NextResponse.json({ message: 'Usuário já existe' }, { status: 400 });
    }

    // Hash da senha
    console.time('Hash da senha');
    const hashedPassword = await bcrypt.hash(password, 8); // Menos rounds para teste
    console.timeEnd('Hash da senha');

    // Criar novo usuário
    console.time('Criação do usuário');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accessLevel: 'user',
      },
    });
    console.timeEnd('Criação do usuário');

    console.log('Usuário criado com sucesso:', user);
    console.timeEnd('Tempo total');

    return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    console.timeEnd('Tempo total');
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
