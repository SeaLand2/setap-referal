<section>
    <p>Add a new transaction:</p>
    <form id="transaction-form">
        <label for="transaction-amount">Transaction Amount:</label>
        <input type="number" id="transaction-amount" placeholder="Transaction Amount" required>
        <label for="transaction-category">Category - Budget:</label>
        <select id="transaction-category" name="categories" size="10">
        </select>
        <label for="transaction-date">Transaction Date:</label>
        <input type="date" id="transaction-date" required>
        <label for="transaction-description">Description:</label>
        <input type="text" id="transaction-description" placeholder="Brief Description">
        <button id="transaction-submit">Create Transaction</button>
    </form>

    <section id="transaction-deletion">
        <label for="transaction-select">Select a Transaction:</label>
        <select id="transaction-select" name="transactions" size="10">
        </select>
        <button id="delete-transaction">Delete Transaction</button>
    <section>
</section>