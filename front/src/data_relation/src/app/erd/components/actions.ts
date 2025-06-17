'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Table } from '@/types/types';
import { fetchTableNamesFromMySQL, fetchTableFromMySQL, fetchTableNamesFromOracle, fetchTableFromOracle, fetchTableNamesFromPostgreSQL, fetchTableFromPostgreSQL } from '@/lib/dbSelect';

const addTableToProjectSchema = z.object({
    projectId: z.number(),
    tableId: z.number(),
});

export async function createTable(data: { name: string; projectId: number }) {
    const table = await prisma.table.create({
        data: {
            name: data.name,
            databaseId: 1, // 仮のDatabase ID
            projects: {
                create: [{ projectId: data.projectId }],
            },
        },
        include: {
            columns: true,
        },
    });
    revalidatePath('/erd');
    return table;
}

export async function addTableToProject(prevState: any, formData: FormData) {
    const parsed = addTableToProjectSchema.safeParse({
        projectId: parseInt(formData.get('projectId') as string),
        tableId: parseInt(formData.get('tableId') as string),
    });

    if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors };
    }

    const { projectId, tableId } = parsed.data;

    try {
        await prisma.projectTable.create({
            data: { projectId, tableId },
        });
        return { success: true };
    } catch (error) {
        console.error('テーブル追加に失敗しました:', error);
        return { errors: { _form: ['テーブルの追加に失敗しました'] } };
    }
}

export async function getDatabases() {
    const databases = await prisma.database.findMany({
        select: { id: true, name: true },
    });
    return databases;
}

export async function getTables(databaseId: number) {
    const tables = await prisma.table.findMany({
        where: { databaseId: databaseId },
        include: {
            columns: true,
        },
    });
    return tables;
}

export async function addExistingTable(data: { tableId: number; projectId: number }) {
    const existing = await prisma.projectTable.findUnique({
        where: {
            projectId_tableId: {
                projectId: data.projectId,
                tableId: data.tableId,
            },
        },
    });

    if (existing) {
        throw new Error('このテーブルは既にプロジェクトに追加されています。');
    }

    const table = await prisma.table.findUnique({
        where: { id: data.tableId },
        include: { columns: true },
    });

    if (!table) {
        throw new Error('テーブルが見つかりません。');
    }

    await prisma.projectTable.create({
        data: {
            projectId: data.projectId,
            tableId: data.tableId,
        },
    });

    revalidatePath('/erd');
    return table;
}

export async function updateTable(id: string, data: { name?: string }) {
    const table = await prisma.table.update({
        where: { id: parseInt(id) },
        data,
    });
    revalidatePath('/erd');
    return table;
}

export async function removeTableFromProject(formData: FormData) {
    const projectId = parseInt(formData.get('projectId') as string);
    const tableId = parseInt(formData.get('id') as string);

    if (isNaN(projectId) || isNaN(tableId)) {
        return { errors: { _form: ['無効なIDです'] } };
    }

    try {
        await prisma.projectTable.delete({
            where: {
                projectId_tableId: { projectId, tableId },
            },
        });
        return { success: true };
    } catch (error) {
        console.error('プロジェクトからテーブル削除に失敗しました:', error);
        return { errors: { _form: ['プロジェクトからのテーブル削除に失敗しました'] } };
    }
}

export async function updateNodePosition(tableId: string, position: { x: number; y: number }, projectId: number) {
  try {
    const updatedProjectTable = await prisma.projectTable.update({
      where: {
        projectId_tableId: {
          projectId: projectId,
          tableId: parseInt(tableId), // tableId は文字列として渡されるため、整数に変換
        },
      },
      data: {
        positionX: position.x,
        positionY: position.y,
      },
    });
    return { success: true, data: updatedProjectTable };
  } catch (error) {
    console.error('Failed to update node position:', error);
    return { success: false, error: 'ノードの座標更新に失敗しました' };
  }
}
export async function createColumn(data: { tableId: string; name: string; type: string; constraints?: string[] }) {
    const column = await prisma.column.create({
        data: {
            tableId: parseInt(data.tableId),
            name: data.name,
            type: data.type,
            constraints: data.constraints || [],
        },
    });
    revalidatePath('/erd');
    return column;
}


export async function updateColumn(id: string, data: { name?: string; type?: string; constraints?: string[]; comment?: string }) {
    const column = await prisma.column.update({
        where: { id: parseInt(id) },
        data,
    });
    revalidatePath('/erd');
    return column;
}

export async function deleteColumn(id: string) {
    await prisma.column.delete({
        where: { id: parseInt(id) },
    });
    revalidatePath('/erd');
}

export async function createEdge(data: {
    projectId: number;
    sourceTableId: string;
    sourceColumnId: string;
    targetTableId: string;
    targetColumnId: string;
    type: string;
}) {
    const edge = await prisma.relation.create({
        data: {
            projectId: data.projectId,
            sourceTableId: parseInt(data.sourceTableId),
            sourceColumnId: parseInt(data.sourceColumnId),
            targetTableId: parseInt(data.targetTableId),
            targetColumnId: parseInt(data.targetColumnId),
            type: data.type,
        },
    });
    revalidatePath('/erd');
    return edge;
}

export async function updateEdge(id: string, data: { type?: string }) {
    const edge = await prisma.relation.update({
        where: { id: parseInt(id) },
        data,
    });
    revalidatePath('/erd');
    return edge;
}

export async function deleteEdge(id: string) {
    await prisma.relation.delete({
        where: { id: parseInt(id) },
    });
    revalidatePath('/erd');
}

export async function getAvailableTables() {
    return await prisma.table.findMany({
        select: { id: true, name: true, columns: { select: { id: true, name: true, type: true, constraints: true, comment: true } } },
    });
}

export async function fetchTableNamesFromDatabase(databaseId: number): Promise<string[]> {
    try {
        const db = await prisma.database.findUnique({
            where: { id: databaseId },
            select: {
                host: true,
                port: true,
                databaseName: true,
                username: true,
                password: true,
                dbms: true,
            },
        });

        if (!db) {
            throw new Error('データベースが見つかりません');
        }

        const dbms = db.dbms.toLowerCase();
        let tableList: string[] = [];

        if (dbms === 'mysql') {
            tableList = await fetchTableNamesFromMySQL(db);
        } else if (dbms === 'postgresql') {
            tableList = await fetchTableNamesFromPostgreSQL(db);
        } else if (dbms === 'oracle') {
            tableList = await fetchTableNamesFromOracle(db);
        } else {
            throw new Error(`未対応のDBMS: ${dbms}`);
        }

        return tableList;
    } catch (error) {
        console.error('Error fetching tables from database:', error);
        return [];
    }
}
export async function fetchTableFromDatabase(databaseId: number, tableName: string): Promise<Table | null> {
    try {
        const db = await prisma.database.findUnique({
            where: { id: databaseId },
            select: {
                host: true,
                port: true,
                databaseName: true,
                username: true,
                password: true,
                dbms: true,
            },
        });

        if (!db) {
            throw new Error('データベースが見つかりません');
        }

        const dbms = db.dbms.toLowerCase();
        let table:Table;

        if (dbms === 'mysql') {
            table = await fetchTableFromMySQL(db, tableName);
        } else if (dbms === 'postgresql') {
            table = await fetchTableFromPostgreSQL(db, tableName);
        } else if (dbms === 'oracle') {
            table = await fetchTableFromOracle(db, tableName);
        } else {
            throw new Error(`未対応のDBMS: ${dbms}`);
        }

        return table;
    } catch (error) {
        console.error('Error fetching tables from database:', error);
        return null;
    }
}

export async function registerTablesToProject(
    databaseId: number,
    projectId: number,
    table: Table
): Promise<{ success: boolean; message: string, post:Table | null }> {
    try {
        // テーブルが既に登録済みかチェック
        const existingTable = await prisma.table.findFirst({
            where: { databaseId, name: table.name },
        });

        let tableId: number;
        if (!existingTable) {
            // テーブルを登録
            const newTable = await prisma.table.create({
                data: {
                    databaseId,
                    name: table.name,
                    columns: {
                        create: table.columns.map(col => ({
                            name: col.name,
                            type: col.type,
                            constraints: col.constraints,
                            comment: col.comment,
                        })),
                    },
                },
            });
            tableId = newTable.id;
        } else {
            tableId = existingTable.id;
        }

        // プロジェクトにテーブルを関連付け
        const existingProjectTable = await prisma.projectTable.findUnique({
            where: {
                projectId_tableId: {
                    projectId,
                    tableId,
                },
            },
        });

        if (!existingProjectTable) {
            await prisma.projectTable.create({
                data: {
                    projectId,
                    tableId,
                    positionX: 0,
                    positionY: 0,
                },
            });
        } else {
            return { success: false, message: 'すでに登録済みのテーブルです。', post:null };
        }

        const postTable = await prisma.table.findUnique({
			select: {
				id: true,
				name: true,
				columns: {
					select: { id: true, name: true, type: true, constraints: true, comment: true },
				},
			},
            where: {
                id: tableId
            }
		})
        return { success: true, message: 'テーブルを登録しました', post:postTable };
    } catch (error) {
        console.error('Error registering tables:', error);
        return { success: false, message: 'テーブルの登録に失敗しました', post:null };
    }
}
