<section>
    <p>Let's get your budget set up!</p>
    <form id="budget-setup-form">
        <label for="budget-amount">Budget Per Month:</label>
        <input type="number" id="budget-amount" placeholder="Budget Amount" min=0 required>
        <button id="budget-setup-submit">Create Budget</button>
    </form>

    <section id="budget-category-list">
        <label for="budget-category-select">Select a Category:</label>
        <select id="budget-category-select" name="categories" size="10">
        </select>
        <button id="edit-category">Edit Category</button>
        <button id="delete-category">Delete Category</button>
    </section>

    <section id="edit-category-popup" class="hidden">
        <p>Edit Category:</p>
        <input type="text" class="category-edit-name">
        <input type="number" class="category-edit-amount" min=0>
        <button id="save-category">Save Changes</button>
    </section>
</section>