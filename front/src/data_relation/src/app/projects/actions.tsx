'use server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'プロジェクト名は必須です')
    .max(50, 'プロジェクト名は50文字以内で入力してください'),
});

export async function createProject(
  prevState: { errors?: { name?: string[]; _form?: string[] } },
  formData: FormData
) {
  const validated = projectSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name } = validated.data;

  try {
    const project = await prisma.project.create({ data: { name } });
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('プロジェクト作成に失敗しました:', error);
    return { errors: { _form: ['プロジェクトの作成に失敗しました'] } };
  }
}

export async function updateProject(
  projectId: number,
  prevState: { errors?: { name?: string[]; _form?: string[] } },
  formData: FormData
) {
  const validated = projectSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name } = validated.data;

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { name },
    });
    return { success: true };
  } catch (error) {
    console.error('プロジェクト更新に失敗しました:', error);
    return { errors: { _form: ['プロジェクトの更新に失敗しました'] } };
  }
}

export async function deleteProject(formData: FormData) {
  const projectId = parseInt(formData.get('id') as string);

  if (isNaN(projectId)) {
    return { errors: { _form: ['無効なプロジェクトIDです'] } };
  }

  try {
    await prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  } catch (error) {
    console.error('プロジェクト削除に失敗しました:', error);
    return { errors: { _form: ['プロジェクトの削除に失敗しました'] } };
  }
}