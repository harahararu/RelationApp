'use server';

import { getBindVariablePlaceholder, getConnection, queryDatabase, sanitizeIdentifier } from '@/lib/db';
import prisma from '@/lib/prisma';
import { Pool } from 'pg';
import { z } from 'zod';

// 検索条件のスキーマ
const SearchDataSchema = z.object({
    tableId: z.number().positive(),
    conditions: z.array(
        z.object({
            column: z.string().min(1),
            operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'LIKE']),
            value: z.string(),
        })
    ),
});

const SearchRelationSchema = z.object({
    relationId: z.number().positive(),
});

// データ検索アクション
export async function searchTableData(formData: FormData) {
    try {
        const data = SearchDataSchema.parse({
            tableId: Number(formData.get('tableId')),
            conditions: JSON.parse(formData.get('conditions') as string),
        });

        // テーブルとデータベース接続情報を取得
        let table = await prisma.table.findUnique({
            where: { id: data.tableId },
            include: { database: true },
        });

        if (!table) {
            return { error: 'テーブルが見つかりませんでした', data: null };
        }

        table.database = { ...table.database, dbms: table.database.dbms }

        const connection = await getConnection(table.database);
        const sanitizedTableName = sanitizeIdentifier(table.name, table.database.dbms);
        let query = `SELECT * FROM ${sanitizedTableName}`;
        const values: string[] = [];
        if (data.conditions.length) {
            const whereClauses = data.conditions.map((c, i) => {
                values.push(c.value);
                const sanitizedColumn = sanitizeIdentifier(c.column, table.database.dbms);
                return `${sanitizedColumn} ${c.operator} ${getBindVariablePlaceholder(i + 1, table.database.dbms)}`;
            });
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        const { rows, columns } = await queryDatabase(connection, table.database.dbms, query, values);
        console.log('searchRelationData query:', query, 'values:', values, 'result:', { rows, columns });
        return { data: rows, columns, error: null };
    } catch (error) {
        console.error('Search error:', error);
        return { error: '検索に失敗しました', data: null };
    }
}

// リレーション検索アクション
export async function searchRelationData(formData: FormData, initialData: any[], tableId: number) {
    try {
        const data = z
            .object({
                relationId: z.string().transform((val) => parseInt(val)),
            })
            .parse({
                relationId: formData.get('relationId'),
            });

        const relation = await prisma.relation.findUnique({
            where: { id: data.relationId },
            include: {
                sourceTable: { include: { database: true } },
                targetTable: { include: { database: true } },
                sourceColumn: true,
                targetColumn: true,
            },
        });

        if (!relation) {
            return { data: [], columns: [], error: 'Relation not found' };
        }

        const isSourceTable = relation.sourceTable.id === tableId;
        const table = isSourceTable ? relation.targetTable : relation.sourceTable;
        const column = isSourceTable ? relation.targetColumn : relation.sourceColumn;
        const sourceColumnName = isSourceTable ? relation.sourceColumn.name : relation.targetColumn.name;

        const dbms = relation.targetTable.database.dbms;
        const sanitizedTableName = sanitizeIdentifier(table.name, dbms);
        const sanitizedColumnName = sanitizeIdentifier(column.name, dbms);

        // initialData から sourceColumnName の値を抽出
        const sourceValues = initialData
            .filter((row) => row[sourceColumnName] !== undefined && row[sourceColumnName] !== null)
            .map((row) => row[sourceColumnName]);

        if (!sourceValues.length) {
            return { data: [], columns: [], error: `No valid values for ${sourceColumnName} in initialData` };
        }

        // IN 句のプレースホルダを生成
        const placeholders = sourceValues.map((_, i) => getBindVariablePlaceholder(i + 1, dbms)).join(', ');
        const query = `
            SELECT * FROM ${sanitizedTableName}
            WHERE ${sanitizedColumnName} IN (${placeholders})
        `;
        const values = sourceValues;

        const connection = await getConnection(relation.targetTable.database);
        const { rows, columns } = await queryDatabase(connection, dbms, query, values);
        console.log('searchRelationData query:', query, 'values:', values, 'result:', { rows, columns });
        return { data: rows, columns, error: null };
    } catch (error: any) {
        console.error('searchRelationData error:', error);
        return { data: [], columns: [], error: error.message };
    }
}