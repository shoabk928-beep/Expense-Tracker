```javascript
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const searchInput = document.getElementById("search");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");
const transactionCount = document.getElementById("transactionCount");
const currentDate = document.getElementById("currentDate");

let transactions = JSON.parse(localStorage.getItem("expenseTrackerTransactions")) || [];

function formatCurrency(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-PK")}`;
}

function setCurrentDate() {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    dateInput.value = today.toISOString().split("T")[0];
}

function saveTransactions() {
    localStorage.setItem(
        "expenseTrackerTransactions",
        JSON.stringify(transactions)
    );
}

function updateSummary() {
    const income = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const expenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const balance = income - expenses;

    totalIncome.textContent = formatCurrency(income);
    totalExpense.textContent = formatCurrency(expenses);
    totalBalance.textContent = formatCurrency(balance);

    transactionCount.textContent = transactions.length;
}

function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getIcon(category, type) {
    const icons = {
        Food: "🍔",
        Shopping: "🛍",
        Transport: "🚗",
        Bills: "📄",
        Education: "🎓",
        Salary: "💼",
        Freelance: "💻",
        Other: "•"
    };

    if (type === "income") {
        return "↑";
    }

    return icons[category] || "•";
}

function renderTransactions() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredTransactions = transactions.filter(transaction => {
        return (
            transaction.title.toLowerCase().includes(searchTerm) ||
            transaction.category.toLowerCase().includes(searchTerm) ||
            transaction.type.toLowerCase().includes(searchTerm)
        );
    });

    transactionList.innerHTML = "";

    if (filteredTransactions.length === 0) {
        emptyState.style.display = "block";

        if (transactions.length > 0 && searchTerm) {
            emptyState.querySelector("h3").textContent = "No results found";
            emptyState.querySelector("p").textContent =
                "Try searching with a different transaction or category.";
        } else {
            emptyState.querySelector("h3").textContent = "No transactions yet";
            emptyState.querySelector("p").textContent =
                "Add your first transaction to start tracking your finances.";
        }

        return;
    }

    emptyState.style.display = "none";

    filteredTransactions.forEach(transaction => {
        const item = document.createElement("div");

        item.className = "transaction";

        const sign = transaction.type === "income" ? "+" : "-";

        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    ${getIcon(transaction.category, transaction.type)}
                </div>

                <div class="transaction-details">
                    <h3>${escapeHTML(transaction.title)}</h3>
                    <p>${escapeHTML(transaction.category)} • ${formatDate(transaction.date)}</p>
                </div>
            </div>

            <div class="transaction-right">
                <span class="transaction-amount ${transaction.type}">
                    ${sign} ${formatCurrency(transaction.amount)}
                </span>

                <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">
                    ×
                </button>
            </div>
        `;

        transactionList.appendChild(item);
    });
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !amount || amount <= 0 || !date) {
        return;
    }

    const transaction = {
        id: Date.now().toString(),
        title,
        amount,
        type,
        category,
        date
    };

    transactions.unshift(transaction);

    saveTransactions();
    updateSummary();
    renderTransactions();

    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];
    typeInput.value = "expense";
});

function deleteTransaction(id) {
    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();
    updateSummary();
    renderTransactions();
}

searchInput.addEventListener("input", renderTransactions);

setCurrentDate();
updateSummary();
renderTransactions();
```
