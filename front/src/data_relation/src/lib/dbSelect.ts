'use server';

import { Client } from 'pg'; // PostgreSQL用
import mysql from 'mysql2/promise'; // MySQL用
import oracledb from 'oracledb'; // Oracle用

import { Table } from '@/types/types'

interface DatabaseInfo {
    dbms: string;
    host: string;
    port: number | null;
    databaseName: string;
    username: string;
    password: string;
}

export async function fetchTableNamesFromMySQL(db: DatabaseInfo): Promise<string[]> {
    const connection = await mysql.createConnection({
        host: db.host,
        port: db.port || 3306,
        user: db.username,
        password: db.password,
        database: db.databaseName,
    });

    try {
        const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.tables
      WHERE TABLE_SCHEMA = ?
    `, [db.databaseName]);

        const tableList: string[] = [];

        for (const table of tables as any[]) {
            tableList.push(table.TABLE_NAME)
        }

        return tableList;
    } finally {
        await connection.end();
    }
}

export async function fetchTableFromMySQL(db: DatabaseInfo, tableName: string): Promise<Table> {
    const connection = await mysql.createConnection({
        host: db.host,
        port: db.port || 3306,
        user: db.username,
        password: db.password,
        database: db.databaseName,
    });

    try {

        const [columns] = await connection.query(`
        SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          COLUMN_KEY, 
          IS_NULLABLE, 
          COLUMN_DEFAULT, 
          EXTRA
        FROM information_schema.columns
        WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?
        `, [tableName, db.databaseName]);

        return {
            id: 0,
            name: tableName,
            columns: (columns as any[]).map(col => ({
                id: 0,
                name: col.COLUMN_NAME,
                type: col.DATA_TYPE.toUpperCase(),
                constraints: [
                    col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : '',
                    col.IS_NULLABLE === 'NO' ? 'NOT NULL' : '',
                    col.EXTRA.includes('auto_increment') ? 'AUTO_INCREMENT' : '',
                    col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : '',
                ].filter(c => c),
                comment: undefined,
            })),
        };
    } finally {
        await connection.end();
    }
}

// PostgreSQL用のテーブル情報取得
export async function fetchTableNamesFromPostgreSQL(db: DatabaseInfo): Promise<string[]> {
    const client = new Client({
        host: db.host,
        port: db.port || 5432,
        user: db.username,
        password: db.password,
        database: db.databaseName,
    });

    await client.connect();

    try {
        const tablesRes = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        const tableList: string[] = [];

        for (const table of tablesRes.rows) {
            tableList.push(table.table_name);
        }

        return tableList;
    } finally {
        await client.end();
    }
}
// PostgreSQL用のテーブル情報取得
export async function fetchTableFromPostgreSQL(db: DatabaseInfo, tableName: string): Promise<Table> {
    const client = new Client({
        host: db.host,
        port: db.port || 5432,
        user: db.username,
        password: db.password,
        database: db.databaseName,
    });

    await client.connect();

    try {
        const columnsRes = await client.query(`
            SELECT 
                c.column_name, 
                c.data_type, 
                c.is_nullable, 
                c.column_default,
                (
                    SELECT array_agg(con.constraint_type)
                    FROM information_schema.table_constraints con
                    JOIN information_schema.constraint_column_usage ccu
                    ON con.constraint_name = ccu.constraint_name
                    WHERE con.table_name = c.table_name
                    AND ccu.column_name = c.column_name
                    AND con.table_schema = 'public'
                ) as constraints
            FROM information_schema.columns c
            WHERE c.table_name = $1 AND c.table_schema = 'public'
        `, [tableName]);

        return {
            id: 0,
            name: tableName,
            columns: columnsRes.rows.map(col => ({
                id: 0,
                name: col.column_name,
                type: col.data_type?.toUpperCase(),
                constraints: [
                    col.is_nullable === 'NO' ? 'NOT NULL' : '',
                    col.column_default ? `DEFAULT ${col.column_default}` : '',
                    ...(Array.isArray(col.constraints) ? col.constraints.filter((c: string) => c !== 'CHECK') : []),
                ].filter(c => c),
                comment: undefined,
            })),
        };
    } finally {
        await client.end();
    }
}

export async function fetchTableNamesFromOracle(db: DatabaseInfo): Promise<string[]> {
    let connection;
    try {
        // Oracle接続
        connection = await oracledb.getConnection({
            user: db.username,
            password: db.password,
            connectString: `${db.host}:${db.port || 1521}/${db.databaseName}`,
        });

        // ユーザーが所有するテーブルを取得
        const tablesResult = await connection.execute(`
            SELECT table_name
            FROM user_tables
        `);

        const tableList: string[] = [];

        for (const row of tablesResult.rows as any[]) {
            tableList.push(row[0]);

        }

        return tableList;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
export async function fetchTableFromOracle(db: DatabaseInfo, tableName: string): Promise<Table> {
    let connection;
    try {
        // Oracle接続
        connection = await oracledb.getConnection({
            user: db.username,
            password: db.password,
            connectString: `${db.host}:${db.port || 1521}/${db.databaseName}`,
        });

        // カラム情報を取得
        const columnsResult = await connection.execute(`
            SELECT 
                c.column_name,
                c.data_type,
                c.nullable,
                c.data_default,
                (
                SELECT LISTAGG(tc.constraint_type, ',')
                FROM user_constraints tc
                JOIN user_cons_columns cc
                ON tc.constraint_name = cc.constraint_name
                WHERE tc.table_name = c.table_name
                AND cc.column_name = c.column_name
                AND tc.constraint_type IN ('P', 'U', 'C')
                ) as constraints
            FROM user_tab_columns c
            WHERE c.table_name = :tableName
        `, { tableName });

        return {
            id: 0,
            name: tableName,
            columns: (columnsResult.rows as any[]).map(col => ({
                id: 0,
                name: col[0],
                type: col[1].toUpperCase(),
                constraints: [
                    col[2] === 'N' ? 'NOT NULL' : '',
                    col[3] ? `DEFAULT ${col[3]}` : '',
                    ...(col[4] ? col[4].split(',').map((c: string) => {
                        if (c === 'P') return 'PRIMARY KEY';
                        if (c === 'U') return 'UNIQUE';
                        if (c === 'C') return 'CHECK';
                        return c;
                    }) : []),
                ].filter(c => c && c !== 'CHECK'), // CHECK制約は除外（必要に応じて調整）
                comment: undefined,
            })),
        }

    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
