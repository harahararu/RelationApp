'use server';

import { Client } from 'pg'; // PostgreSQL用
import mysql from 'mysql2/promise'; // MySQL用
import oracledb from 'oracledb'; // Oracle用
// SQLiteやOracle用のドライバも必要に応じてインポート

interface DatabaseFormData {
  name: string;
  dbms: string;
  host: string;
  port: number | null;
  databaseName: string;
  username: string;
  password: string;
}

export async function testDatabaseConnection(prevState: { success: false, message: '' }, formData: FormData) {
  try {
    if (!(formData instanceof FormData)) {
      throw new Error('Invalid formData: Expected FormData object');
    }

    const data: DatabaseFormData = {
      name: formData.get('name') as string,
      dbms: formData.get('dbms') as string,
      host: formData.get('host') as string,
      port: formData.get('port') ? Number(formData.get('port')) : null,
      databaseName: formData.get('databaseName') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    if (data.dbms === 'PostgreSQL') {
      const client = new Client({
        host: data.host,
        port: data.port ?? 5432,
        database: data.databaseName,
        user: data.username,
        password: data.password,
      });
      await client.connect();
      await client.end();
      return { success: true, message: '接続に成功しました。' };
    } else if (data.dbms === 'MySQL') {
      const connection = await mysql.createConnection({
        host: data.host,
        port: data.port ?? 3306,
        database: data.databaseName,
        user: data.username,
        password: data.password,
      });
      await connection.end();
      return { success: true, message: '接続に成功しました。' };
    } else if (data.dbms === 'SQLite') {
      // SQLiteの実装（必要に応じて）
      return { success: false, message: 'SQLiteは未実装です。' };
    } else if (data.dbms === 'Oracle') {
      const connection = await oracledb.getConnection({
        user: data.username,
        password: data.password,
        connectString: `${data.host}:${data.port ?? 1521}/${data.databaseName}`,
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
