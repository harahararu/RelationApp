'use server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const databaseSchema = z.object({
  name: z
    .string()
    .min(1, 'データベース名は必須です')
    .max(50, 'データベース名は50文字以内で入力してください'),
  dbms: z
    .string()
    .min(1, 'DBMSは必須です')
    .max(50, 'DBMSは50文字以内で入力してください'),
  host: z
    .string()
    .min(1, 'ホストは必須です')
    .max(100, 'ホストは100文字以内で入力してください'),
  port: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  databaseName: z
    .string()
    .min(1, 'データベース名は必須です')
    .max(50, 'データベース名は50文字以内で入力してください'),
  username: z
    .string()
    .min(1, 'ユーザー名は必須です')
    .max(50, 'ユーザー名は50文字以内で入力してください'),
  password: z
    .string()
    .min(1, 'パスワードは必須です')
    .max(100, 'パスワードは100文字以内で入力してください'),
});

export async function createDatabase(
  prevState: { errors?: { name?: string[]; dbms?: string[]; host?: string[]; port?: string[]; databaseName?: string[]; username?: string[]; password?: string[]; _form?: string[] } },
  formData: FormData
) {
  const validated = databaseSchema.safeParse({
    name: formData.get('name'),
    dbms: formData.get('dbms'),
    host: formData.get('host'),
    port: formData.get('port'),
    databaseName: formData.get('databaseName'),
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { errors: {validate:validated.error.flatten().fieldErrors} };
  }

  const { name, dbms, host, port, databaseName, username, password } = validated.data;

  try {
    const database = await prisma.database.create({
      data: { name, dbms, host, port, databaseName, username, password },
    });
    return { success: true, databaseId: database.id };
  } catch (error) {
    console.error('データベース作成に失敗しました:', error);
    return { errors: { _form: ['データベースの作成に失敗しました'] } };
  }
}

export async function updateDatabase(
  prevState: { errors?: { name?: string[]; dbms?: string[]; host?: string[]; port?: string[]; databaseName?: string[]; username?: string[]; password?: string[]; _form?: string[] } },
  formData: FormData
) {
  const databaseId = parseInt(formData.get('id') as string);

  if (isNaN(databaseId)) {
    return { errors: { _form: ['無効なデータベースIDです'] } };
  }

  const validated = databaseSchema.safeParse({
    name: formData.get('name'),
    dbms: formData.get('dbms'),
    host: formData.get('host'),
    port: formData.get('port'),
    databaseName: formData.get('databaseName'),
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { errors: {validate:validated.error.flatten().fieldErrors} };
  }

  const { name, dbms, host, port, databaseName, username, password } = validated.data;

  try {
    await prisma.database.update({
      where: { id: databaseId },
      data: { name, dbms, host, port, databaseName, username, password },
    });
    return { success: true };
  } catch (error) {
    console.error('データベース更新に失敗しました:', error);
    return { errors: { _form: ['データベースの更新に失敗しました'] } };
  }
}

export async function deleteDatabase(formData: FormData) {
  const databaseId = parseInt(formData.get('id') as string);

  if (isNaN(databaseId)) {
    return { errors: { _form: ['無効なデータベースIDです'] } };
  }

  try {
    await prisma.database.delete({
      where: { id: databaseId },
    });
    return { success: true };
  } catch (error) {
    console.error('データベース削除に失敗しました:', error);
    return { errors: { _form: ['データベースの削除に失敗しました'] } };
  }
}