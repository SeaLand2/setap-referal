const pages = [
  {
    screen: 'home',
    title: 'Login',
  },
  {
    screen: 'create-account',
    title: 'Sign Up',
  },
  {
    screen: 'budget-setup',
    title: 'Budget Setup',
  },
  {
    screen: 'transactions',
    title: 'Transactions',
  },
  {
    screen: 'error',
    title: 'Error',
  }
];

const ui = {};
const templates = {};

/// UI functions ///

// store references to the DOM elements for the main areas of the page
function getHandles() {
  ui.mainnav = document.querySelector('header > nav');
  ui.main = document.querySelector('main');
  ui.footer = document.querySelector('footer');
  // Cceate a reference to each screen element
  ui.screens = {};
  // create an array for each screen element
  ui.getScreens = () => Object.values(ui.screens);
  // create an array for each button element
  ui.getButtons = () => Object.values(ui.buttons);
  // create objects for each template element
  templates.screen = document.querySelector('#temp-screen');
  templates.budgetCategory = document.querySelector('#temp-budget-category');
}


// create each screen using the temp-screen template
function buildScreens() {
  const template = templates.screen;
  for (const page of pages) {
    // first elemment is always the section
    const section = template.content.cloneNode(true).firstElementChild;
    const title = section.querySelector('.title');
    title.textContent = page.title;

    section.dataset.id = `section-${page.screen}`;
    section.dataset.name = page.screen;

    ui.main.append(section);
    // store a reference to the screen element to later use
    ui.screens[page.screen] = section;
  }
}


// build the navbar by creating buttons for each page
function buildNav() {
  ui.buttons = {};
  for (const page of pages) {
    if (page.screen === 'error') { continue; }
    const button = document.createElement('button');
    button.textContent = page.title;
    button.dataset.screen = page.screen;
    button.addEventListener('click', show);
    button.addEventListener('click', storeState);
    ui.mainnav.append(button);
    ui.buttons[page.screen] = button;
  }
}


// fetch the HTML for a specific screen
async function fetchScreenContent(screen) {
  const url = `/screens/${screen}.inc`;
  const response = await fetch(url);
  if (response.ok) {
    return await response.text();
  } else {
    return `A ${response.status} error occurred while retreiving section data for <code>${url}</code>`;
  }
}


// get the content for each screen
async function getContent() {
  for (const page of pages) {
    const content = await fetchScreenContent(page.screen);
    const article = document.createElement('article');
    article.innerHTML = content;
    ui.screens[page.screen].append(article);
  }
}


// hide all screens
function hideAllScreens() {
  for (const screen of ui.getScreens()) {
    hideElement(screen);
  }
}


// enable nav buttons
function enableAllButtons() {
  for (const button of ui.getButtons()) {
    button.removeAttribute('disabled');
  }
}


/*
    show a screen when a button is clicked
    if no event is passed, show the home screen
*/
function show(event) {
  ui.previous = ui.current;
  const screen = event?.target?.dataset?.screen ?? 'home';
  showScreen(screen);
}


// show a specific screen
function showScreen(screen) {
  hideAllScreens();
  enableAllButtons();
  // if the screen is not found, show the error screen
  if (!ui.screens[screen]) {
    screen = 'error';
  }
  showElement(ui.screens[screen]);
  ui.current = screen;
  document.title = `Budget | ${ui.screens[screen].querySelector('.title').textContent}`;
  if (screen !== 'error') {
    ui.buttons[screen].disabled = 'disabled';
  }
}


// store the current screen in the history
function storeState() {
  history.pushState(ui.current, ui.current, `/app/${ui.current}`);
}


// read the URL path from the address bar
function readPath() {
  const path = window.location.pathname.slice(5);
  if (path) {
    return path;
  }
  return 'home';
}


/// Screen functions ///

async function buildHomeLogin() {
  const form = document.querySelector('#login-form');
  form.querySelector('#login-submit').addEventListener('click', async (event) => {
    event.preventDefault();
    const email = form.email.value;
    try {
      const response = await fetch(`/api/users/${email}`);
      if (response.ok) {
        const userId = await response.json();
        console.log('User logged in:', userId);
        localStorage.setItem('userID', userId);
        try {
          const budgetId = await getUserBudgetId();
          if (budgetId) {
            localStorage.setItem('budgetId', budgetId);
            console.log('Budget ID:', budgetId);
          } else {
            console.log('No budget found for user');
            showScreen('budget-setup');
            storeState();
            location.reload();
            return;
          }
        } catch (error) {
          console.error('Error retrieving budget ID:', error);
        }
        showScreen('home'); //change to transaction home
        storeState();
        location.reload();
      } else {
        const errorElement = form.querySelector('.error');
        errorElement.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error during login:', error);
      showScreen('error');
    }
  });
}


async function getUserBudgetId() {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const response = await fetch(`/api/budget/${userId}`);
  if (response.ok) {
    const budget = await response.json();
    return budget.id;
  }
  return null;
}


async function buildCreateAccount() {
  const form = document.querySelector('#signup-form');
  form.querySelector('#signup-submit').addEventListener('click', async (event) => {
    console.log('Creating account...');
    event.preventDefault();
    const email = form.querySelector('#new-email').value;
    const password = form.querySelector('#new-password').value;
    if (password !== form.querySelector('#confirm-password').value) {
      const errorElement = form.querySelector('.error');
      errorElement.textContent = 'Passwords do not match';
      errorElement.classList.remove('hidden');
      return;
    }
    try {
      const payload = { email, password };
      const response = await fetch(`/api/users/create`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const userId = (await response.json()).userId;
        console.log('User created:', userId);
        localStorage.setItem('userId', userId);
        showScreen('budget-setup');
        storeState();
        location.reload();
      } else {
        const errorElement = form.querySelector('.error');
        errorElement.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error during account creation:', error);
      showScreen('error');
    }
  });
}


async function buildBudgetSetup() {
  const form = document.querySelector('#budget-setup-form');
  try {
    const budgetAmount = localStorage.getItem('budgetAmount');
    if (budgetAmount) {
      form.querySelector('#budget-amount').value = budgetAmount;
    }
  } catch (error) {
    console.error('Error building budget setup:', error);
  }

  form.querySelector('#budget-setup-submit').addEventListener('click', async (event) => {
    console.log('Setting up budget...');
    event.preventDefault();
    const userId = localStorage.getItem('userId');
    const budget = form.querySelector('#budget-amount').value;
    try {
      const payload = { userId, budget };
      const response = await fetch(`/api/budget/create`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const budgetId = (await response.json()).budgetId;
        localStorage.setItem('budgetId', budgetId);
        localStorage.setItem('budgetAmount', budget);
        console.log('Budget created:', budgetId);
        await createDefaultCategories(budgetId);
        storeState();
        location.reload();
      } else {
        const errorElement = form.querySelector('.error');
        errorElement.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error during budget setup:', error);
      showScreen('error');
    }
  });
}


async function createDefaultCategories(budgetId) {
  const categories = [
    { name: 'Rent', budgetedAmount: 0 },
    { name: 'Food', budgetedAmount: 0 },
    { name: 'Utilities', budgetedAmount: 0 },
    { name: 'Other', budgetedAmount: 0 },
  ];

  for (const category of categories) {
    await createBudgetCategory(budgetId, category);
  }
}

async function buildBudgetCategories() {
  const budgetId = localStorage.getItem('budgetId');
  if (!budgetId) return;

  const categories = await getBudgetCategories(budgetId);
  const categoryList = ui.screens['budget-setup'].querySelector('#budget-category-select');
  const categoryIdDict = {};
  if (categories.length === 0) {
    categoryList.innerHTML = '<p>No categories found. Please add some.</p>';
    return;
  } else {
    for (let i = 0; i < categories.length; i++) {
      categoryIdDict[categories[i].category_id] = i;
      const row = templates.budgetCategory.content.cloneNode(true).firstElementChild;
      row.value = categories[i].category_id;
      row.querySelector('.category-name').value = categories[i].name;
      row.querySelector('.category-amount').value = categories[i].budgeted_amount;
      row.classList.remove('hidden');
      categoryList.appendChild(row);
    }
  }

  ui.screens['budget-setup'].querySelector('#edit-category').addEventListener('click', () => {
    const categoryId = categoryList.value;
    const category = categories[categoryIdDict[categoryId]];
    console.log(category.name);
    console.log(category.budgeted_amount);
    try {
      const popup = ui.screens['budget-setup'].querySelector('#edit-category-popup');
      popup.querySelector('.category-edit-name').value = category.name;
      popup.querySelector('.category-edit-amount').value = category.budgeted_amount;
      popup.classList.remove('hidden');
    } catch (error) {
      console.log(error);
    }
  })

  ui.screens['budget-setup'].querySelector('#save-category').addEventListener('click', () => {
    const categoryId = categoryList.value;
    try {
      editCategory(categoryId);
    } catch (error) {
      console.log(error);
    }
  })

  ui.screens['budget-setup'].querySelector('#delete-category').addEventListener('click', () => {
    const categoryId = categoryList.value;
    try {
      deleteCategory(categoryId);
    } catch (error) {
      console.log(error);
    }
  })
}


async function editCategory(categoryId) {
  const newName = ui.screens['budget-setup'].querySelector('.category-edit-name').value;
  const newBudgetedAmount = ui.screens['budget-setup'].querySelector('.category-edit-amount').value;

  try {
    const payload = { categoryId, newName, newBudgetedAmount };
    const response = await fetch(`/api/categories/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      console.log('Category updated:', await response.json());
      location.reload();
    } else {
      console.error('Error updating category:', response.statusText);
      location.reload();
    }
  } catch (error) {
    console.error('Error during category update:', error);
    location.reload();
  }
}


async function deleteCategory(categoryId) {
  try {
    const payload = { categoryId };
    const response = await fetch(`/api/categories/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      console.log('Category deleted:', await response.json());
      storeState();
      location.reload();
    } else {
      console.error('Error deleting category:', response.statusText);
      location.reload();
    }
  } catch (error) {
    console.error('Error during category deletion:', error);
  }
}


async function createBudgetCategory(budgetId, category) {
  const payload = {
    budgetId,
    name: category.name,
    budgetedAmount: category.budgetedAmount,
  };
  const response = await fetch(`/api/categories/create`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    console.log('Category created:', await response.json());
  } else {
    console.error('Error creating category:', response.statusText);
  }
}


async function getBudgetCategories(budgetId) {
  const response = await fetch(`/api/categories/${budgetId}`);
  if (response.ok) {
    return await response.json();
  } else {
    console.error('Error fetching budget categories:', response.statusText);
    return [];
  }
}


async function buildTransactions() {
  const transactionForm = ui.screens['transactions'].querySelector('#transaction-form');
  const transactionList = ui.screens['transactions'].querySelector('#transaction-select');
  const budgetId = localStorage.getItem('budgetId');
  if (!budgetId) return;
  const transactions = await getTransactionsByBudgetId(budgetId);
  const categories = await getBudgetCategories(budgetId);

  const categorySelect = transactionForm.querySelector('#transaction-category');
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category.category_id;
    option.textContent = `${category.name} - $${category.budgeted_amount}`;
    categorySelect.appendChild(option);
  }

  transactionForm.querySelector('#transaction-submit').addEventListener('click', async (event) => {
    event.preventDefault();
    const amount = transactionForm.querySelector('#transaction-amount').value;
    const categoryId = transactionForm.querySelector('#transaction-category').value;
    const date = transactionForm.querySelector('#transaction-date').value;
    const description = transactionForm.querySelector('#transaction-description').value;
    try {
      const payload = { budgetId, amount, categoryId, date, description };
      const response = await fetch(`/api/transactions/create`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log('Transaction created:', await response.json());
        storeState();
        location.reload();
      } else {
        console.error('Error creating transaction:', response.statusText);
      }
    } catch (error) {
      console.error('Error during transaction creation:', error);
    }
  });

  if (transactions.length === 0) {
    transactionList.innerHTML = '<p>No transactions found. Please add some.</p>';
    return;
  } else {
    for (const transaction of transactions) {
      const option = document.createElement('option');
      option.value = transaction.transaction_id;
      option.textContent = `${transaction.transaction_date} - ${transaction.description} - $${transaction.amount}`;
      transactionList.appendChild(option);
    }
  }

  ui.screens['transactions'].querySelector('#delete-transaction').addEventListener('click', () => {
    console.log('Deleting transaction...');
    const transactionId = transactionList.value;
    deleteTransaction(transactionId);
  });
}


async function getTransactionsByBudgetId(budgetId) {
  const response = await fetch(`/api/transactions/${budgetId}`);
  if (response.ok) {
    return await response.json();
  } else {
    console.error('Error fetching transactions:', response.statusText);
    return [];
  }
}

async function deleteTransaction(transactionId) {
  try {
    const payload = { transactionId };
    const response = await fetch(`/api/transactions/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      console.log('Transaction deleted:', await response.json());
      storeState();
      location.reload();
    } else {
      console.error('Error deleting transaction:', response.statusText);
      location.reload();
    }
  } catch (error) {
    console.error('Error during transaction deletion:', error);
  }
}

/// Utility functions ///
function showElement(element) {
  element.classList.remove('hidden');
}


function hideElement(element) {
  element.classList.add('hidden');
}


function loadInitialScreen() {
  ui.current = readPath();
  showScreen(ui.current);
}


async function main() {
  getHandles();
  buildScreens();
  buildNav();
  await getContent();
  buildHomeLogin()
  buildCreateAccount();
  buildBudgetSetup();
  buildBudgetCategories();
  buildTransactions();
  window.addEventListener('popstate', loadInitialScreen);
  loadInitialScreen();
}

main();