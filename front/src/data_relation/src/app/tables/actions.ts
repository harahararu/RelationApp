'use server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const tableSchema = z.object({
  name: z
    .string()
    .min(1, 'テーブル名は必須です')
    .max(50, 'テーブル名は50文字以内で入力してください'),
  databaseId: z.string().optional(),
});

const validConstraints = ['PRIMARY_KEY', 'NOT_NULL', 'UNIQUE', 'FOREIGN_KEY'] as const;

const columnSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'カラム名は必須です'),
  type: z.string().min(1, '型は必須です'),
  constraints: z.array(z.enum(validConstraints)).optional(),
  comment: z.string().optional().nullable(),
});

const updateTableSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'テーブル名は必須です'),
  databaseId: z.union([z.number(), z.literal('')]).transform((val) => (val === '' ? null : val)),
  columns: z.array(columnSchema).optional(),
});

export async function createTable(
  prevState: { errors?: { name?: string[]; databaseId?: string[]; _form?: string[] } },
  formData: FormData
) {
  const validated = tableSchema.safeParse({
    name: formData.get('name'),
    databaseId: formData.get('databaseId'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, databaseId } = validated.data;

  try {
    const table = await prisma.table.create({
      data: {
        name,
        databaseId: databaseId ? parseInt(databaseId) : null,
      },
    });
    return { success: true, tableId: table.id };
  } catch (error) {
    console.error('テーブル作成に失敗しました:', error);
    return { errors: { _form: ['テーブルの作成に失敗しました'] } };
  }
}

export async function updateTable(prevState: any, formData: FormData) {
  const rawColumns = formData.getAll('columns').map((col) => JSON.parse(col as string));
  const parsed = updateTableSchema.safeParse({
    id: parseInt(formData.get('id') as string),
    name: formData.get('name'),
    databaseId: formData.get('databaseId') ? parseInt(formData.get('databaseId') as string) : '',
    columns: rawColumns,
  });
  
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { id, name, databaseId, columns } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // テーブル更新
      await tx.table.update({
        where: { id },
        data: { name, databaseId },
      });

      // カラム更新
      if (columns) {
        // 既存カラム取得
        const existingColumns = await tx.column.findMany({ where: { tableId: id } });
        const existingIds = existingColumns.map((col) => col.id);
        const newIds = columns.map((col) => col.id).filter((id): id is number => id !== undefined);

        // 削除されたカラムを特定
        const columnsToDelete = existingIds.filter((id) => !newIds.includes(id));
        if (columnsToDelete.length > 0) {
          await tx.column.deleteMany({
            where: { id: { in: columnsToDelete } },
          });
        }

        // カラムの作成または更新
        for (const col of columns) {
          if (col.id) {
            // 更新
            await tx.column.update({
              where: { id: col.id },
              data: {
                name: col.name,
                type: col.type,
                constraints: col.constraints || [],
                comment: col.comment,
              },
            });
          } else {
            // 作成
            await tx.column.create({
              data: {
                name: col.name,
                type: col.type,
                constraints: col.constraints || [],
                comment: col.comment,
                tableId: id,
              },
            });
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('テーブル更新に失敗しました:', error);
    return { errors: { _form: ['テーブルの更新に失敗しました'] } };
  }
}

export async function deleteTable(formData: FormData) {
  const tableId = parseInt(formData.get('id') as string);

  if (isNaN(tableId)) {
    return { errors: { _form: ['無効なテーブルIDです'] } };
  }

  try {
    await prisma.table.delete({
      where: { id: tableId },
    });
    return { success: true };
  } catch (error) {
    console.error('テーブル削除に失敗しました:', error);
    return { errors: { _form: ['テーブルの削除に失敗しました'] } };
  }
}