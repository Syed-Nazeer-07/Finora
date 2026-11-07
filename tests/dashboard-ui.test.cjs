/**
 * Dashboard empty-state regression checks.
 * No browser packages required: run with node --test tests/dashboard-ui.test.cjs.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../static/js/dashboard.js'), 'utf8');
const AppDashboard = new Function(source + '\nreturn AppDashboard;')();

const month = (offset = 0) => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return first.getFullYear() + '-' + String(first.getMonth() + 1).padStart(2, '0') + '-07';
};

function dashboard({ transactions = [], budgets = [], goals = [], insights = [] } = {}) {
    const app = {
        ...AppDashboard,
        state: {
            transactions, budgets, savings: goals,
            profile: { account_mode: 'cashflow', current_savings: 1100 },
            currentUser: { name: 'QA' },
            settings: { show_greeting: true },
            goalForecasts: {},
        },
        getCalculations() {
            return {
                availableBalance: 1100,
                current_savings: 1100,
                monthTxIncome: 0, monthTxExpenses: 0,
                cashFlowGrowth: 0, netWorthGrowth: 0, netWorth: 1100,
                healthScore: 43, budgetProgress: budgets,
            };
        },
        getMonthlyReport() {
            return { income: 0, expenses: 0, savings: 0, netChange: 0 };
        },
        getRecentActivity() {
            return { today: transactions, yesterday: [], earlier: [] };
        },
        getSmartInsights() { return insights; },
        getStreak() { return 0; },
        getCategoryColor() { return '#3366ff'; },
        getCategoryEmoji() { return '💳'; },
        getGoalForecast() { return null; },
        getCurrencySymbol() { return '₹'; },
        formatCurrency(value) { return '₹' + Number(value || 0).toFixed(2); },
        escapeHtml(value) { return String(value || '').replace(/[&<>"]/g, '_'); },
    };
    return app.getDashboardHTML();
}

test('new accounts show one starter prompt, not empty charts or a false risk score', () => {
    const html = dashboard();
    assert.match(html, /Your dashboard is ready/);
    assert.doesNotMatch(html, /id="expenseChart"/);
    assert.doesNotMatch(html, /id="netWorthChart"/);
    assert.doesNotMatch(html, /skeleton skeleton-chart/);
    assert.match(html, /id="financial-health-card" class="hidden /);
    assert.match(html, /Monthly Summary \+ Budget Snapshot -->\s*<div class="hidden /);
    assert.match(html, /Recent Activity \+ Goals \+ Insights -->\s*<div class="hidden /);
});

test('one month of spending shows only the useful spending chart', () => {
    const html = dashboard({ transactions: [
        { date: month(), type: 'expense', category: 'Food', description: 'Lunch', amount: 45 },
    ] });
    assert.match(html, /id="expenseChart"/);
    assert.doesNotMatch(html, /id="netWorthChart"/);
    assert.doesNotMatch(html, /Your dashboard is ready/);
    assert.match(html, /id="financial-health-card" class="hidden /);
});

test('real history shows both charts and restores populated dashboard cards', () => {
    const html = dashboard({
        transactions: [
            { date: month(), type: 'expense', category: 'Food', description: 'Lunch', amount: 45 },
            { date: month(-1), type: 'income', category: 'Salary', description: 'Salary', amount: 500 },
        ],
        budgets: [{ category: 'Food', limit: 100, spent: 45 }],
        goals: [{ id: 1, name: 'Vacation', current: 20, target: 100 }],
        insights: [{ type: 'info', icon: 'info', text: 'Useful financial insight' }],
    });
    assert.match(html, /id="expenseChart"/);
    assert.match(html, /id="netWorthChart"/);
    assert.match(html, /id="financial-health-card" class="flex /);
    assert.match(html, /Vacation/);
    assert.match(html, /Useful financial insight/);
});

test('older-only expenses do not show a current-month spending breakdown', () => {
    const html = dashboard({ transactions: [
        { date: month(-1), type: 'expense', category: 'Food', description: 'Dinner', amount: 60 },
        { date: month(-2), type: 'expense', category: 'Travel', description: 'Tickets', amount: 100 },
    ] });
    assert.match(html, /id="netWorthChart"/);
    assert.doesNotMatch(html, /id="expenseChart"/);
});
