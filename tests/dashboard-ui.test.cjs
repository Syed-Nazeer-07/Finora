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

function assertCompleteDashboard(html) {
    for (const section of [
        'Financial Health', 'This Month', 'Budgets',
        'Recent Activity', 'Active Goals', 'Smart Insights',
        'Balance Trend', 'Spending Breakdown',
    ]) assert.ok(html.includes(section), 'Missing dashboard section: ' + section);
    assert.match(html, /id="financial-health-card" class="bg-white/);
    assert.match(html, /id="netWorthChart"/);
}

test('new accounts retain all original dashboard sections with useful empty states', () => {
    const html = dashboard();
    assertCompleteDashboard(html);
    assert.match(html, /No budgets set/);
    assert.match(html, /No Goals Yet/);
    assert.match(html, /No recent transactions/);
    assert.match(html, /No spending data yet/);
    assert.doesNotMatch(html, /id="expenseSkeleton"/);
    assert.doesNotMatch(html, /id="expenseChart"/);
    assert.doesNotMatch(html, /Your dashboard is ready/);
});

test('a month with spending shows a functional spending chart, not an empty state', () => {
    const html = dashboard({ transactions: [
        { date: month(), type: 'expense', category: 'Food', description: 'Lunch', amount: 45 },
    ] });
    assertCompleteDashboard(html);
    assert.match(html, /id="expenseChart"/);
    assert.doesNotMatch(html, /No spending data yet/);
    assert.doesNotMatch(html, /id="expenseSkeleton"/);
});

test('populated budgets, goals, insights and charts all remain visible', () => {
    const html = dashboard({
        transactions: [
            { date: month(), type: 'expense', category: 'Food', description: 'Lunch', amount: 45 },
            { date: month(-1), type: 'income', category: 'Salary', description: 'Salary', amount: 500 },
        ],
        budgets: [{ category: 'Food', limit: 100, spent: 45 }],
        goals: [{ id: 1, name: 'Vacation', current: 20, target: 100 }],
        insights: [{ type: 'info', icon: 'info', text: 'Useful financial insight' }],
    });
    assertCompleteDashboard(html);
    assert.match(html, /id="expenseChart"/);
    assert.match(html, /Vacation/);
    assert.match(html, /Useful financial insight/);
});

test('older expenses retain their card with a clear current-month empty message', () => {
    const html = dashboard({ transactions: [
        { date: month(-1), type: 'expense', category: 'Food', description: 'Dinner', amount: 60 },
        { date: month(-2), type: 'expense', category: 'Travel', description: 'Tickets', amount: 100 },
    ] });
    assertCompleteDashboard(html);
    assert.doesNotMatch(html, /id="expenseChart"/);
    assert.match(html, /No spending data yet/);
});
