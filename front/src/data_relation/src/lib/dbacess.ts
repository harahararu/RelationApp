'use server';

import { Database } from '@/types/types'
import { Client } from 'pg'; // PostgreSQL用
import mysql from 'mysql2/promise'; // MySQL用
import oracledb from 'oracledb'; // Oracle用

export async function testDatabaseConnection(database: Database) {
  try {

    if (database.dbms === 'PostgreSQL') {
      const client = new Client({
        host: database.host,
        port: database.port ?? 5432,
        database: database.databaseName,
        user: database.username,
        password: database.password,
      });
      await client.connect();
      await client.end();
      return { success: true, message: '接続に成功しました。' };
    } else if (database.dbms === 'MySQL') {
      const connection = await mysql.createConnection({
        host: database.host,
        port: database.port ?? 3306,
        database: database.databaseName,
        user: database.username,
        password: database.password,
      });
      await connection.end();
      return { success: true, message: '接続に成功しました。' };
    } else if (database.dbms === 'SQLite') {
      // SQLiteの実装（必要に応じて）
      return { success: false, message: 'SQLiteは未実装です。' };
    } else if (database.dbms === 'Oracle') {
      const connection = await oracledb.getConnection({
        user: database.username,
        password: database.password,
        connectString: `${database.host}:${database.port ?? 1521}/${database.databaseName}`,
      });
      await connection.close();
      return { success: true, message: '接続に成功しました。' };
    } else {
      return { success: false, message: 'サポートされていないDBMSです。' };
    }
  } catch (error) {
    return { success: false, message: `接続に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` };
  }
}
