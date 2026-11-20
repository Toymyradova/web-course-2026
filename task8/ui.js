export function renderCategories(categories, selectElement) {
    selectElement.innerHTML = '<option value="">Выберите категорию...</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        selectElement.appendChild(option);
    });
}

export function renderTransactions(transactions, listElement, onEdit, onDelete) {
    listElement.innerHTML = '';
    
    if (transactions.length === 0) {
        listElement.innerHTML = '<li class="empty">Нет операций. Добавьте первую!</li>';
        return;
    }

    transactions.forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        
        const sign = t.type === 'income' ? '+' : '-';
        const amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';

        li.innerHTML = `
            <div class="transaction-info">
                <span class="date">${t.date}</span>
                <span class="category">${t.category}</span>
                <span class="comment">${t.comment || 'Без комментария'}</span>
            </div>
            <div class="transaction-right">
                <span class="amount ${amountClass}">${sign}${t.amount} ₽</span>
                <div class="actions">
                    <button class="btn-edit" data-id="${t.id}">✏️</button>
                    <button class="btn-delete" data-id="${t.id}">🗑️</button>
                </div>
            </div>
        `;

        li.querySelector('.btn-edit').addEventListener('click', () => onEdit(t));
        li.querySelector('.btn-delete').addEventListener('click', () => onDelete(t.id));

        listElement.appendChild(li);
    });
}

export function renderBalance(transactions, incomeEl, expenseEl, balanceEl) {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        else expense += Number(t.amount);
    });

    const balance = income - expense;

    incomeEl.textContent = income;
    expenseEl.textContent = expense;
    balanceEl.textContent = balance;
    
    if (balance < 0) balanceEl.style.color = '#ef4444';
    else balanceEl.style.color = '#10b981';
}

export function showError(message, errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 4000);
}