import e from 'express';
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

/// User-related database functions ///

export async function createUser(email, password) {
  const db = await dbConn;
  const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
  const result = await db.run(sql, [email, password]);
  return result;
}


export async function getUserByEmail(email) {
  const db = await dbConn;
  const sql = 'SELECT * FROM users WHERE email = ?';
  const user = await db.get(sql, email);
  return user;
}


export async function updateUserPassword(email, newPassword) {
  const db = await dbConn;
  const sql = 'UPDATE users SET password = ? WHERE email = ?';
  const result = await db.run(sql, [newPassword, email]);
  return result.changes > 0; // returns true if a row was updated
}


export async function deleteUser(email) {
  const db = await dbConn;
  const sql = 'DELETE FROM users WHERE email = ?';
  const result = await db.run(sql, email);
  return result.changes > 0; // returns true if a row was deleted
}


/// Budget-related database functions ///


export async function createUserBudget(userId, budget) {
  const db = await dbConn;
  const sql = 'INSERT INTO budget (user_id, budget) VALUES (?, ?)';
  const result = await db.run(sql, [userId, budget]);
  return result;
}


export async function getUserBudget(userId) {
  const db = await dbConn;
  const sql = 'SELECT * FROM budget WHERE user_id = ?';
  const budget = await db.get(sql, userId);
  return budget;
}


export async function updateUserBudget(userId, newBudget) {
  const db = await dbConn;
  const sql = 'UPDATE budget SET budget = ? WHERE user_id = ?';
  const result = await db.run(sql, [newBudget, userId]);
  return result.changes > 0; // returns true if a row was updated
}


export async function deleteUserBudget(userId) {
  const db = await dbConn;
  const sql = 'DELETE FROM budget WHERE user_id = ?';
  const result = await db.run(sql, userId);
  return result.changes > 0; // returns true if a row was deleted
}


/// Category-related database functions ///


export async function createCategory(budgetId, categoryName, budgetedAmount) {
  const db = await dbConn;
  const sql = 'INSERT INTO budget_category (budget_id, name, budgeted_amount) VALUES (?, ?, ?)';
  const result = await db.run(sql, [budgetId, categoryName, budgetedAmount]);
  return result.lastID;
}


export async function getCategoriesByBudgetId(budgetId) {
  const db = await dbConn;
  const sql = 'SELECT * FROM budget_category WHERE budget_id = ?';
  const categories = await db.all(sql, budgetId);
  return categories;
}


export async function updateCategory(categoryId, newName, newBudgetedAmount) {
  const db = await dbConn;
  const sql = 'UPDATE budget_category SET name = ?, budgeted_amount = ? WHERE category_id = ?';
  const result = await db.run(sql, [newName, newBudgetedAmount, categoryId]);
  return result.changes > 0; // returns true if a row was updated
}


export async function deleteCategory(categoryId) {
  const db = await dbConn;
  const sql = 'DELETE FROM budget_category WHERE category_id = ?';
  const result = await db.run(sql, categoryId);
  return result.changes > 0; // returns true if a row was deleted
}


/// Transaction-related database functions ///

export async function createTransaction(budgetId, amount, categoryId, date, description = '') {
  const db = await dbConn;
  const sql = 'INSERT INTO transactions (budget_id, amount, category_id, transaction_date, description) VALUES (?, ?, ?, ?, ?)';
  const result = await db.run(sql, [budgetId, amount, categoryId, date, description]);
  return result.lastID;
}


export async function getTransactionsByBudgetId(budgetId) {
  const db = await dbConn;
  const sql = 'SELECT * FROM transactions WHERE budget_id = ? ORDER BY transaction_date DESC';
  const transactions = await db.all(sql, budgetId);
  return transactions;
}


export async function updateTransaction(transactionId, newAmount, newCategory, newDate, newDescription) {
  const db = await dbConn;
  const sql = 'UPDATE transactions SET amount = ?, category = ?, transaction_date = ?, description = ? WHERE id = ?';
  const result = await db.run(sql, [newAmount, newCategory, newDate, newDescription, transactionId]);
  return result.changes > 0; // returns true if a row was updated
}


export async function deleteTransaction(transactionId) {
  const db = await dbConn;
  const sql = 'DELETE FROM transactions WHERE transaction_id = ?';
  const result = await db.run(sql, transactionId);
  return result.changes > 0; // returns true if a row was deleted
}


/// Utility database functions ///


export async function getRemainingBudget(budget_id) {
  const db = await dbConn;
  const sql = `
    SELECT budget - COALESCE(SUM(budgeted_amount), 0) AS remaining_budget
    FROM budget
    JOIN budget_category ON budget.budget_id = budget_category.budget_id
    WHERE budget.budget_id = ?
  `;
  const result = await db.get(sql, budget_id);
  return result.remaining_budget;
}


export async function getTotalSpent(budget_id) {
  const db = await dbConn;
  const sql = `
    SELECT COALESCE(SUM(amount), 0) AS total_spent
    FROM transactions
    WHERE budget_id = ?
  `;
  const result = await db.get(sql, budget_id);
  return result.total_spent;
}


export async function getTotalBudgeted(budget_id) {
  const db = await dbConn;
  const sql = `
    SELECT COALESCE(SUM(budgeted_amount), 0) AS total_budgeted
    FROM budget_category
    WHERE budget_id = ?
  `;
  const result = await db.get(sql, budget_id);
  return result.total_budgeted;
}


export async function getCategoryRemainingBudget(category_id) {
  const db = await dbConn;
  const sql = `
    SELECT budgeted_amount - COALESCE(SUM(amount), 0) AS remaining_budget
    FROM budget_category
    JOIN transactions ON budget_category.category_id = transactions.category_id
    WHERE budget_category.id = ?
  `;
  const result = await db.get(sql, category_id);
  return result.remaining_budget;
}


export async function getCategoryTotalSpent(category_id) {
  const db = await dbConn;
  const sql = `
    SELECT COALESCE(SUM(amount), 0) AS total_spent
    FROM transactions
    WHERE category_id = ?
  `;
  const result = await db.get(sql, category_id);
  console.log('result:', result);
  return result.total_spent;
}