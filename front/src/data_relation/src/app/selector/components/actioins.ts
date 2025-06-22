'use server';

import { getConnection, queryDatabase, sanitizeIdentifier } from '@/lib/db';
import prisma from '@/lib/prisma';
import { Pool } from 'pg';
import { z } from 'zod';

// 検索条件のスキーマ
const SearchDataSchema = z.object({
  tableId: z.number().positive(),
  conditions: z.array(
    z.object({
      column: z.string().min(1),
      operator: z.enum(['=', 'LIKE', '>', '<']),
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

    table.database = {...table.database, dbms:table.database.dbms.toLowerCase()}
    
    const connection = getConnection(table.database);
    const sanitizedTableName = sanitizeIdentifier(table.name, table.database.dbms);
    let query = `SELECT * FROM ${sanitizedTableName}`;
    const values: string[] = [];
    if (data.conditions.length) {
      const whereClauses = data.conditions.map((c, i) => {
        values.push(c.value);
        const sanitizedColumn = sanitizeIdentifier(c.column, table.database.dbms);
        return `${sanitizedColumn} ${c.operator} $${i + 1}`;
      });
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const result = await queryDatabase(connection, table.database.dbms, query, values);
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Search error:', error);
    return { error: '検索に失敗しました', data: null };
  }
}

// リレーション検索アクション
export async function searchRelationData(formData: FormData) {
  try {
    const data = SearchRelationSchema.parse({
      projectId: Number(formData.get('projectId')),
      relationId: Number(formData.get('relationId')),
    });

    const relation = await prisma.relation.findUnique({
      where: { id: data.relationId },
      include: {
        sourceTable: { include: { columns: true } },
        targetTable: { include: { columns: true } },
        sourceColumn: true,
        targetColumn: true,
      },
    });

    if (!relation) {
      return { error: 'リレーションが見つかりませんでした', data: null };
    }

    const table = await prisma.table.findUnique({
      where: { id: relation.sourceTableId },
      include: { database: true },
    });

    if (!table) {
      return { error: 'テーブルが見つかりませんでした', data: null };
    }

    table.database = {...table.database, dbms:table.database.dbms.toLowerCase()}

    const connection = getConnection(table.database);
    const dbms = table.database.dbms;
    const sanitizedSourceTable = sanitizeIdentifier(relation.sourceTable.name, dbms);
    const sanitizedTargetTable = sanitizeIdentifier(relation.targetTable.name, dbms);
    const sanitizedSourceColumn = sanitizeIdentifier(relation.sourceColumn.name, dbms);
    const sanitizedTargetColumn = sanitizeIdentifier(relation.targetColumn.name, dbms);
    const query = `
      SELECT s.*, t.*
      FROM ${sanitizedSourceTable} s
      JOIN ${sanitizedTargetTable} t
      ON s.${sanitizedSourceColumn} = t.${sanitizedTargetColumn}
    `;

    const result = await queryDatabase(connection, dbms, query);
    return { data: result, error: null };
  } catch (error) {
    console.error('Relation search error:', error);
    return { error: 'リレーション検索に失敗しました', data: null };
  }
}