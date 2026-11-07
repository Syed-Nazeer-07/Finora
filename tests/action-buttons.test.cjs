const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const code = fs.readFileSync(path.resolve(__dirname, '../static/js/transactions.js'), 'utf8');
const AppViews = new Function(code + '\nreturn AppViews;')();

function views(search = '') {
    return {
        ...AppViews,
        state: {
            transactions: [],
            savings: [],
            txSearchQuery: search,
            txFilterCategory: 'All',
        },
        getCalculations() { return { budgetProgress: [] }; },
        getCategoryNames() { return []; },
        getCurrencySymbol() { return '₹'; },
        escapeHtml(value) { return String(value || ''); },
        formatCurrency(amount) { return '₹' + Number(amount).toFixed(2); },
    };
}
function actionCount(html, action) {
    return (html.match(new RegExp('App\\.openModal\\(\\x27' + action + '\\x27\\)', 'g')) || []).length;
}

test('transactions empty state has only one Add action, in the header', () => {
    const html = views().getTransactionsHTML();
    assert.equal(actionCount(html, 'transaction'), 1);
    assert.match(html, /No Transactions Yet/);
    assert.match(html, /Add Record/);
});

test('search empty state retains Clear Search and does not duplicate Add', () => {
    const html = views('unknown').getTransactionsHTML();
    assert.equal(actionCount(html, 'transaction'), 1);
    assert.match(html, /Clear Search/);
});

test('budget empty state has only one Create Budget action', () => {
    const html = views().getBudgetsHTML();
    assert.equal(actionCount(html, 'budget'), 1);
    assert.match(html, /No Budgets Yet/);
    assert.match(html, /Create Budget/);
});

test('goal empty state has only one Add Goal action', () => {
    const html = views().getSavingsHTML();
    assert.equal(actionCount(html, 'saving'), 1);
    assert.match(html, /No goals yet/);
    assert.match(html, /Add Goal/);
});
