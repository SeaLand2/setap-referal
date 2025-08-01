import express from 'express';
import * as db from './db_handler.js';
import * as url from 'url';

const app = express();
const PORT = 8080;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/// Middleware to parse JSON bodies ///


async function getUserByEmail(req, res) {
  try {
    const user = await db.getUserByEmail(req.params.email);
    if (user) {
      res.json(user.user_id);
    }
    else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving user');
  }
}


async function createUser(req, res) {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).send('Bad request: email and password are required');
  }
  try {
    const result = await db.createUser(req.body.email, req.body.password);
    res.status(201).json({ userId: result.lastID });
  } catch (error) {
    res.status(500).send('Error creating user');
  }
}


async function updateUserPassword(req, res) {
  try {
    const updated = await db.updateUserPassword(req.params.email, req.params.password);
    if (updated) {
      res.send('Password updated successfully');
    }
    else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error updating password');
  }
}


async function deleteUser(req, res) {
  try {
    const deleted = await db.deleteUser(req.params.email);
    if (deleted) {
      res.send('User deleted successfully');
    }
    else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error deleting user');
  }
}


async function getUserBudget(req, res) {
  try {
    const amount = await db.getUserBudget(req.params.userId);
    if (amount) {
      res.json(amount);
    } else {
      res.status(404).send('Budget not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving budget');
  }
}


async function createUserBudget(req, res) {
  if (!req.body || !req.body.userId || !req.body.budget) {
    return res.status(400).send('Bad request: userId and budget are required');
  }
  try {
    const result = await db.createUserBudget(req.body.userId, req.body.budget);
    res.status(201).json({ budgetId: result.lastID });
  } catch (error) {
    res.status(500).send('Error creating budget');
  }
}


async function updateUserBudget(req, res) {
  try {
    const updated = await db.updateUserBudget(req.params.userId, req.params.newBudget);
    if (updated) {
      res.send('Budget updated successfully');
    } else {
      res.status(404).send('Budget not found');
    }
  } catch (error) {
    res.status(500).send('Error updating budget');
  }
}


async function deleteUserBudget(req, res) {
  try {
    const deleted = await db.deleteUserBudget(req.params.userId);
    if (deleted) {
      res.send('Budget deleted successfully');
    } else {
      res.status(404).send('Budget not found');
    }
  } catch (error) {
    res.status(500).send('Error deleting budget');
  }
}


async function getCategoriesByBudgetId(req, res) {
  const budgetId = req.params.budgetId;
  try {
    const categories = await db.getCategoriesByBudgetId(budgetId);
    if (categories.length > 0) {
      res.json(categories);
    } else {
      res.status(404).send('No categories found for this budget');
    }
  } catch (error) {
    res.status(500).send('Error retrieving categories');
  }
}

async function createCategory(req, res) {
  if (!req.body || !req.body.budgetId || !req.body.name) {
    return res.status(400).send('Bad request: budgetId, name, and budgetedAmount are required');
  }
  try {
    const categoryId = await db.createCategory(req.body.budgetId, req.body.name, req.body.budgetedAmount);
    res.status(201).json({ categoryId });
  } catch (error) {
    res.status(500).send('Error creating category');
  }
}


async function updateCategory(req, res) {
  if (!req.body || !req.body.categoryId || !req.body.newName || !req.body.newBudgetedAmount) {
    return res.status(400).send('Bad request: categoryId, newName, and newBudgetedAmount are required');
  }
  try {
    const updated = await db.updateCategory(req.body.categoryId, req.body.newName, req.body.newBudgetedAmount);
    if (updated) {
      res.send('Category updated successfully');
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    res.status(500).send('Error updating category');
  }
}


async function deleteCategory(req, res) {
  try {
    const deleted = await db.deleteCategory(req.body.categoryId);
    if (deleted) {
      res.send('Category deleted successfully');
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    res.status(500).send('Error deleting category');
  }
}


async function getTransactionsByBudgetId(req, res) {
  try {
    const transactions = await db.getTransactionsByBudgetId(req.params.budgetId);
    if (transactions.length > 0) {
      res.json(transactions);
    } else {
      res.status(404).send('No transactions found for this budget');
    }
  } catch (error) {
    res.status(500).send('Error retrieving transactions');
  }
}


async function createTransaction(req, res) {
  if (!req.body || !req.body.budgetId || !req.body.amount || !req.body.categoryId || !req.body.date || !req.body.description) {
    return res.status(400).send('Bad request: budgetId, amount, categoryId, date, and description are required');
  }
  try {
    const transactionId = await db.createTransaction(req.body.budgetId, req.body.amount, req.body.categoryId, req.body.date, req.body.description);
    res.status(201).json({ transactionId });
  } catch (error) {
    res.status(500).send('Error creating transaction');
  }
}


async function updateTransaction(req, res) {
  try {
    const updated = await db.updateTransaction(req.params.transactionId, req.params.newAmount, req.params.newCategory, req.params.newDate, req.params.newDescription);
    if (updated) {
      res.send('Transaction updated successfully');
    } else {
      res.status(404).send('Transaction not found');
    }
  } catch (error) {
    res.status(500).send('Error updating transaction');
  }
}


async function deleteTransaction(req, res) {
  if (!req.body || !req.body.transactionId) {
    return res.status(400).send('Bad request: transactionId is required');
  }
  try {
    const deleted = await db.deleteTransaction(req.body.transactionId);
    if (deleted) {
      res.send('Transaction deleted successfully');
    } else {
      res.status(404).send('Transaction not found');
    }
  } catch (error) {
    res.status(500).send('Error deleting transaction');
  }
}


async function getRemainingBudget(req, res) {
  try {
    const remainingBudget = await db.getRemainingBudget(req.params.budgetId);
    if (remainingBudget !== null) {
      res.json({ remainingBudget });
    } else {
      res.status(404).send('Budget not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving remaining budget');
  }
}


// handle /app calls since they are handled by index.html
function handleAppUrls(req, res) {
  res.sendFile(`${__dirname}/client/index.html`);
}


function notFound(req, res) {
  res.status(404).sendFile(`${__dirname}/client/server-error-pages/404.html`);
}


// Middleware to serve static files
app.use(express.static('client'));


/// Middleware to handle JSON requests ///

app.get('/api/users/:email', getUserByEmail);
app.put('/api/users/create', express.json(), createUser);
app.patch('/api/users/update/:email-:password', updateUserPassword);
app.delete('/api/users/delete/:email', deleteUser);

app.get('/api/budget/:userId', getUserBudget);
app.put('/api/budget/create', express.json(), createUserBudget);
app.patch('/api/budget/update/:userId-:newBudget', updateUserBudget);
app.delete('/api/budget/delete/:userId', deleteUserBudget);

app.get('/api/categories/:budgetId', getCategoriesByBudgetId);
app.put('/api/categories/create', express.json(), createCategory);
app.patch('/api/categories/update', express.json(), updateCategory);
app.delete('/api/categories/delete', express.json(), deleteCategory);

app.get('/api/transactions/:budgetId', getTransactionsByBudgetId);
app.put('/api/transactions/create', express.json(), createTransaction);
app.patch('/api/transactions/update/:transactionId-:newAmount-:newCategory', updateTransaction);
app.delete('/api/transactions/delete', express.json(), deleteTransaction);

app.get('/api/budget-remaining/:budgetId', getRemainingBudget)

app.get('/app/*subpage/', handleAppUrls); // Handle all app URLs
app.all('*all', notFound);


// Make the server listen on the specified port and log a message saying where to access it
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


async function test() {
  try {
    console.log('creating user');
    await db.createUser('test@example.com', 'password');
    console.log(await db.getUserByEmail('test@example.com'));

    console.log('creating user budget');
    await db.createUserBudget(1, 1000);
    console.log(await db.getUserBudget(1));

    console.log('creating category');
    await db.createCategory(1, 'Food', 200);
    console.log(await db.getCategoriesByBudgetId(1));

    console.log('creating transaction 1');
    await db.createTransaction(1, 50, 1, '2023-10-01', 'Groceries');
    console.log(await db.getTransactionsByBudgetId(1));

    console.log('creating transaction 2');
    await db.createTransaction(1, 100, 1, '2023-10-02', 'Groceries again');
    console.log(await db.getTransactionsByBudgetId(1));
  
    console.log('getting remaining budget : expect 800');
    console.log(await db.getRemainingBudget(1));

    console.log('getting total budgeted amount for category : expect 200');
    console.log(await db.getTotalBudgeted(1));

    console.log('getting total spent for category 1 : expect 150');
    console.log(await db.getCategoryTotalSpent(1));
  } catch (error) {
    console.error(error);
  }
}

// test().catch(console.error);