import { open } from 'sqlite';
import sqlite3 from 'sqlite3';


// initialize the SQLite database
async function init() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
    verbose: true,
  });
  await db.migrate({ migrationsPath: './migrations-sqlite' });
  return db;
}

const dbConn = init();


export async function test() {
  const db = await dbConn;
  const sql = 'SELECT ? AS value';
  const result = await db.get(sql, 1);
  return result;
}