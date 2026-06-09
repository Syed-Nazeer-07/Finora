const CATEGORIES = ['Housing', 'Food & Dining', 'Entertainment', 'Transport', 'Shopping', 'Salary', 'Side Hustle', 'Investments', 'Other'];

const CATEGORY_EMOJIS = {
    'Housing': '🏠',
    'Food & Dining': '🍔',
    'Entertainment': '🍿',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Salary': '💰',
    'Side Hustle': '🚀',
    'Investments': '📈',
    'Other': '📦'
};

const App = {
    state: {
        activeTab: 'dashboard',
        isMobileMenuOpen: false,
        darkMode: true,
        modal: { isOpen: false, type: null, entityId: null },
        txFormType: 'expense',
        charts: {},

        txSearchQuery: '',
        txFilterCategory: '',
        simulatorParams: { salaryIncrease: 0, expenseReduction: 0 },
        affordabilityQuery: { price: 150000, name: 'MacBook Pro' },

        roadmap: [
            { id: 1, title: 'Emergency Fund', icon: 'shield-check', status: 'completed' },
            { id: 2, title: 'Buy MacBook', icon: 'laptop', status: 'active' },
            { id: 3, title: 'Study Abroad', icon: 'plane', status: 'pending' },
            { id: 4, title: 'Fin. Independence', icon: 'flag', status: 'pending' }
        ],

        transactions: [],
        txLoading: false,
        txError: null,
        budgets: [
            { id: 1, category: 'Food & Dining', limit: 15000 },
            { id: 2, category: 'Shopping', limit: 10000 },
            { id: 3, category: 'Entertainment', limit: 5000 }
        ],
        savings: [
            { id: 1, name: 'Emergency Fund', target: 500000, current: 250000, monthlyContribution: 25000, date: '2027-04-01' },
            { id: 2, name: 'Study Abroad', target: 2000000, current: 450000, monthlyContribution: 50000, date: '2028-12-15' }
        ],
        investments: [
            { id: 1, symbol: 'NIFTY 50 ETF', shares: 50, avgCost: 200.00, currentPrice: 225.50, type: 'ETF' },
            { id: 2, symbol: 'Reliance (RELIANCE)', shares: 25, avgCost: 2400.00, currentPrice: 2850.50, type: 'Stock' },
            { id: 3, symbol: 'Gold Sovereign Bonds', shares: 10, avgCost: 5000.00, currentPrice: 5400.00, type: 'Bonds' },
            { id: 4, symbol: 'Bitcoin (BTC)', shares: 0.05, avgCost: 3500000.00, currentPrice: 5200000.00, type: 'Crypto' }
        ],
        badges: [
            { id: 1, icon: 'shield-check', title: 'Emergency Funded', earned: true },
            { id: 2, icon: 'target', title: 'Budget Master', earned: true },
            { id: 3, icon: 'rocket', title: 'Net Worth +25%', earned: false }
        ],
        aiChats: [
            { role: 'ai', text: 'Hello Nazeer! I am your WealthSync Financial OS Coach. Based on my analysis, you spent 23% more on food delivery this month. How can I help you optimize your finances today?' }
        ]
    },

    // --- Initialization & Theme ---

    init() {
        if (this.state.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        this.updateThemeIcons();
        this.renderSidebarMenu();
        this.fetchTransactions();
    },

    async fetchTransactions() {
        this.state.txLoading = true;
        this.state.txError = null;
        this.render();
        try {
            const res = await fetch('/api/transactions');
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            this.state.transactions = await res.json();
        } catch (err) {
            this.state.txError = err.message;
        } finally {
            this.state.txLoading = false;
            this.render();
        }
    },

    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        document.documentElement.classList.toggle('dark');
        this.updateThemeIcons();
        this.render();
    },

    updateThemeIcons() {
        const iconStr = this.state.darkMode ? 'sun' : 'moon';
        const deskIcon = document.getElementById('theme-icon');
        const mobIcon = document.getElementById('theme-icon-mobile');
        if (deskIcon) deskIcon.setAttribute('data-lucide', iconStr);
        if (mobIcon) mobIcon.setAttribute('data-lucide', iconStr);
        lucide.createIcons();
    },

    // --- Formatting Utilities ---

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000))
            .toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    // --- Business Logic & Calculations ---

    getCalculations() {
        const totalIncome = this.state.transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpenses = this.state.transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const currentCash = totalIncome - totalExpenses;
        const totalSavings = this.state.savings.reduce((acc, curr) => acc + curr.current, 0);
        const totalInvestmentValue = this.state.investments.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0);
        const totalInvestmentCost = this.state.investments.reduce((acc, curr) => acc + (curr.shares * curr.avgCost), 0);
        const investmentProfit = totalInvestmentValue - totalInvestmentCost;
        const netWorth = currentCash + totalSavings + totalInvestmentValue;
        const previousNetWorth = netWorth * 0.877;
        const netWorthGrowth = ((netWorth - previousNetWorth) / previousNetWorth) * 100;

        const budgetProgress = this.state.budgets.map(budget => {
            const spent = this.state.transactions
                .filter(t => t.type === 'expense' && t.category === budget.category)
                .reduce((acc, curr) => acc + curr.amount, 0);
            return { ...budget, spent };
        });

        let savingsRateScore = (totalSavings / (totalIncome || 1)) > 0.2 ? 30 : 15;
        let emergencyFundScore = totalSavings > (totalExpenses * 6) ? 20 : 10;
        let budgetScore = budgetProgress.every(b => b.spent <= b.limit) ? 30 : 15;
        let investmentScore = totalInvestmentValue > totalSavings * 0.5 ? 20 : 10;
        let healthScore = Math.min(100, savingsRateScore + emergencyFundScore + budgetScore + investmentScore);

        return {
            totalIncome, totalExpenses, currentCash, totalSavings,
            totalInvestmentValue, totalInvestmentCost, investmentProfit,
            netWorth, netWorthGrowth, budgetProgress, healthScore,
            breakdown: { savingsRateScore, emergencyFundScore, budgetScore, investmentScore }
        };
    },

    getRuleBasedInsights() {
        const insights = [];
        const calc = this.getCalculations();

        if (calc.healthScore < 60) {
            insights.push({ type: 'danger', icon: 'alert-triangle', text: 'Financial health score is dropping. Priority: Reduce non-essential spending.' });
        }

        const overBudget = calc.budgetProgress.find(b => b.spent > b.limit);
        if (overBudget) {
            insights.push({ type: 'warning', icon: 'pie-chart', text: `You have exceeded your ${overBudget.category} budget by ${this.formatCurrency(overBudget.spent - overBudget.limit)}.` });
        }

        if (calc.totalSavings > 0 && calc.totalInvestmentValue === 0) {
            insights.push({ type: 'info', icon: 'trending-up', text: 'You have savings but no investments. Consider starting a systematic investment plan (SIP).' });
        }

        if (insights.length === 0) {
            insights.push({ type: 'success', icon: 'check-circle', text: 'Your finances are well optimized. Keep up the 12-day savings streak!' });
        }
        return insights;
    },

    // --- UI Interactions ---

    setActiveTab(tab) {
        this.state.activeTab = tab;
        if (window.innerWidth < 768) {
            this.state.isMobileMenuOpen = false;
            this.updateMobileSidebar();
        }
        this.render();
    },

    toggleMobileMenu() {
        this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
        this.updateMobileSidebar();
    },

    updateMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const icon = document.getElementById('mobile-menu-icon');
        if (this.state.isMobileMenuOpen) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            icon.setAttribute('data-lucide', 'x');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    },

    handleTxSearch(e) {
        this.state.txSearchQuery = e.target.value;
        this.render();
    },

    handleTxFilter(e) {
        this.state.txFilterCategory = e.target.value;
        this.render();
    },

    updateSimulator(field, value) {
        this.state.simulatorParams[field] = parseInt(value);
        document.getElementById(`val-${field}`).innerText = `+${value}%`;

        const calc = this.getCalculations();
        const simIncome = calc.totalIncome * (1 + (this.state.simulatorParams.salaryIncrease / 100));
        const simExpenses = calc.totalExpenses * (1 - (this.state.simulatorParams.expenseReduction / 100));
        const monthlySurplus = simIncome - simExpenses;
        const yearlyProjected = calc.netWorth + (monthlySurplus * 12) + (calc.totalInvestmentValue * 0.12);

        document.getElementById('sim-projected-nw').innerText = this.formatCurrency(yearlyProjected);
    },

    updateRoadmapStatus(id, status) {
        const step = this.state.roadmap.find(s => s.id === id);
        if (step) step.status = status;
        this.renderModal();
        this.render();
    },

    checkAffordability(e) {
        e.preventDefault();
        const price = parseFloat(e.target.price.value);
        const name = e.target.itemName.value;
        const calc = this.getCalculations();
        const monthlySurplus = calc.totalIncome - calc.totalExpenses;

        let resultHTML = '';
        if (calc.currentCash >= price) {
            resultHTML = `<div class="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium">Yes, you can afford ${name} immediately from cash reserves!</div>`;
        } else if (monthlySurplus > 0) {
            const months = Math.ceil((price - calc.currentCash) / monthlySurplus);
            resultHTML = `<div class="mt-4 p-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-xl text-brand-700 dark:text-brand-400 text-sm font-medium">You can afford ${name} in ${months} months if you save your surplus.</div>`;
        } else {
            resultHTML = `<div class="mt-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-medium">Currently unaffordable. You need to increase income or reduce expenses.</div>`;
        }

        document.getElementById('affordability-result').innerHTML = resultHTML;
    },

    // --- Rendering ---

    renderSidebarMenu() {
        const navItems = [
            { id: 'dashboard', label: 'Financial OS', icon: 'layout-dashboard' },
            { id: 'transactions', label: 'Transactions', icon: 'receipt' },
            { id: 'budgets', label: 'Budgets & Alerts', icon: 'pie-chart' },
            { id: 'savings', label: 'Goal Forecasting', icon: 'target' },
            { id: 'investments', label: 'Portfolio', icon: 'trending-up' },
        ];

        const navHtml = navItems.map(item => {
            const isActive = this.state.activeTab === item.id;
            const activeClasses = isActive
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white';
            const iconClass = isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500';

            return `
                <button onclick="App.setActiveTab('${item.id}')"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm group ${activeClasses}">
                    <i data-lucide="${item.icon}" class="w-5 h-5 transition-transform group-hover:scale-110 ${iconClass}"></i>
                    ${item.label}
                </button>
            `;
        }).join('');

        document.getElementById('nav-menu').innerHTML = navHtml;

        const aiBtn = document.getElementById('nav-ai-coach');
        if (this.state.activeTab === 'ai-coach') {
            aiBtn.classList.add('bg-purple-50', 'dark:bg-purple-500/10', 'text-purple-700', 'dark:text-purple-400', 'font-semibold');
            aiBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
        } else {
            aiBtn.classList.remove('bg-purple-50', 'dark:bg-purple-500/10', 'text-purple-700', 'dark:text-purple-400', 'font-semibold');
            aiBtn.classList.add('text-slate-600', 'dark:text-slate-400');
        }
    },

    render() {
        this.renderSidebarMenu();
        const content = document.getElementById('main-content');

        Object.values(this.state.charts).forEach(chart => chart.destroy());
        this.state.charts = {};

        if (this.state.txLoading) {
            content.innerHTML = `<div class="flex items-center justify-center h-full"><div class="text-slate-500 dark:text-slate-400 flex items-center gap-3"><i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Loading transactions…</div></div>`;
            lucide.createIcons();
            return;
        }

        if (this.state.txError) {
            content.innerHTML = `<div class="flex items-center justify-center h-full"><div class="text-rose-500 flex flex-col items-center gap-3 text-center"><i data-lucide="wifi-off" class="w-8 h-8"></i><p class="font-semibold">Failed to load transactions</p><p class="text-sm text-slate-500 dark:text-slate-400">${this.state.txError}</p><button onclick="App.fetchTransactions()" class="mt-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">Retry</button></div></div>`;
            lucide.createIcons();
            return;
        }

        let html = '';
        switch (this.state.activeTab) {
            case 'dashboard':    html = this.getDashboardHTML(); break;
            case 'transactions': html = this.getTransactionsHTML(); break;
            case 'budgets':      html = this.getBudgetsHTML(); break;
            case 'savings':      html = this.getSavingsHTML(); break;
            case 'investments':  html = this.getInvestmentsHTML(); break;
            case 'ai-coach':     html = this.getAiCoachHTML(); break;
        }

        content.innerHTML = html;
        lucide.createIcons();

        setTimeout(() => {
            if (this.state.activeTab === 'dashboard') this.initDashboardCharts();
            if (this.state.activeTab === 'investments') this.initInvestmentCharts();
        }, 50);
    },

    // --- AI Coach interactions ---

    sendAiMsg(text) {
        this.state.aiChats.push({ role: 'user', text });
        this.render();

        setTimeout(() => {
            let reply = "Based on your current data, you are doing well, but optimizing discretionary spending could accelerate your goals by 15%.";
            if (text.includes('overspending')) reply = "According to our Smart Predictor, you are currently overspending in 'Food & Dining'. You've used 85% of your ₹15,000 budget with 22 days left in the month.";
            if (text.includes('laptop')) reply = "Your monthly surplus is looking good. If you shift ₹5,000/mo from Entertainment, you can safely afford a MacBook by October 2026 instead of December.";

            this.state.aiChats.push({ role: 'ai', text: reply });
            this.render();
            const container = document.getElementById('chat-container');
            if (container) container.scrollTop = container.scrollHeight;
        }, 1000);
    },

    handleAiSubmit(e) {
        e.preventDefault();
        const input = e.target.elements.prompt;
        if (input.value.trim()) {
            this.sendAiMsg(input.value);
            input.value = '';
        }
    },

    // --- Modals ---

    openModal(type, id = null) {
        this.state.modal = { isOpen: true, type, entityId: id };
        if (type === 'transaction') {
            if (id) {
                const item = this.state.transactions.find(t => t.id === id);
                if (item) this.state.txFormType = item.type;
            } else {
                this.state.txFormType = 'expense';
            }
        }
        this.renderModal();
    },

    closeModal() {
        this.state.modal = { isOpen: false, type: null, entityId: null };
        this.renderModal();
    },

    setTxType(type) {
        this.state.txFormType = type;
        const expBtn = document.getElementById('btn-expense');
        const incBtn = document.getElementById('btn-income');
        if (type === 'expense') {
            expBtn.className = "py-2.5 rounded-xl text-sm font-bold border-2 transition-all border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400";
            incBtn.className = "py-2.5 rounded-xl text-sm font-bold border-2 transition-all border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400";
        } else {
            incBtn.className = "py-2.5 rounded-xl text-sm font-bold border-2 transition-all border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
            expBtn.className = "py-2.5 rounded-xl text-sm font-bold border-2 transition-all border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400";
        }
    },

    async handleFormSubmit(event) {
        event.preventDefault();
        const fd = new FormData(event.target);
        const { type, entityId } = this.state.modal;
        const id = entityId || Date.now();

        if (type === 'transaction') {
            const payload = {
                description: fd.get('description'),
                amount:      parseFloat(fd.get('amount')),
                date:        fd.get('date'),
                category:    fd.get('category'),
                type:        this.state.txFormType,
            };
            const submitBtn = event.target.querySelector('[type=submit]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving…';
            try {
                const url = entityId ? `/api/transactions/${entityId}` : '/api/transactions';
                const method = entityId ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Request failed');
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Record';
                const errEl = event.target.querySelector('#form-error');
                if (errEl) errEl.textContent = err.message;
                Toast.show(err.message, 'error');
                return;
            }
            this.closeModal();
            Toast.show(entityId ? 'Transaction updated successfully' : 'Transaction created successfully', 'success');
            await this.fetchTransactions();
            return;
        } else if (type === 'budget') {
            const budget = { id, category: fd.get('category'), limit: parseFloat(fd.get('limit')) };
            if (entityId) {
                const idx = this.state.budgets.findIndex(b => b.id === entityId);
                if (idx !== -1) this.state.budgets[idx] = budget;
            } else {
                this.state.budgets.push(budget);
            }
        } else if (type === 'saving') {
            const saving = { id, name: fd.get('name'), target: parseFloat(fd.get('target')), current: parseFloat(fd.get('current')), monthlyContribution: parseFloat(fd.get('monthlyContribution') || 0), date: fd.get('date') };
            if (entityId) {
                const idx = this.state.savings.findIndex(s => s.id === entityId);
                if (idx !== -1) this.state.savings[idx] = saving;
            } else {
                this.state.savings.push(saving);
            }
        } else if (type === 'investment') {
            const investment = {
                id, symbol: fd.get('symbol'), type: fd.get('invType'),
                shares: parseFloat(fd.get('shares')), avgCost: parseFloat(fd.get('avgCost')), currentPrice: parseFloat(fd.get('currentPrice'))
            };
            if (entityId) {
                const idx = this.state.investments.findIndex(i => i.id === entityId);
                if (idx !== -1) this.state.investments[idx] = investment;
            } else {
                this.state.investments.push(investment);
            }
        } else if (type === 'roadmap') {
            const step = { id, title: fd.get('title'), icon: fd.get('icon'), status: 'pending' };
            this.state.roadmap.push(step);
        }

        this.closeModal();
        this.render();
    },

    async deleteItem(type, id) {
        if (type === 'transaction') {
            ConfirmModal.show({
                title: 'Delete Transaction',
                message: 'Are you sure you want to delete this transaction?<br>This action cannot be undone.',
                confirmLabel: 'Delete',
                onConfirm: async () => {
                    try {
                        const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
                        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
                        Toast.show('Transaction deleted successfully', 'success');
                        await this.fetchTransactions();
                    } catch (err) {
                        Toast.show(`Failed to delete transaction: ${err.message}`, 'error');
                    }
                }
            });
            return;
        }
        if (type === 'budget') this.state.budgets = this.state.budgets.filter(t => t.id !== id);
        if (type === 'saving') this.state.savings = this.state.savings.filter(t => t.id !== id);
        if (type === 'investment') this.state.investments = this.state.investments.filter(t => t.id !== id);
        if (type === 'roadmap') {
            this.state.roadmap = this.state.roadmap.filter(t => t.id !== id);
            this.renderModal();
            this.render();
            return;
        }
        this.render();
    },

    renderModal() {
        const container = document.getElementById('modal-container');
        if (!this.state.modal.isOpen) {
            container.innerHTML = '';
            return;
        }

        const { type, entityId } = this.state.modal;
        let item = null;
        if (entityId) {
            if (type === 'transaction') item = this.state.transactions.find(t => t.id === entityId);
            if (type === 'budget') item = this.state.budgets.find(b => b.id === entityId);
            if (type === 'saving') item = this.state.savings.find(s => s.id === entityId);
            if (type === 'investment') item = this.state.investments.find(i => i.id === entityId);
        }

        const today = new Date().toISOString().split('T')[0];
        let modalTitle = entityId ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        if (type === 'roadmap') modalTitle = 'Customize Roadmap';

        let formHtml = '';

        if (type === 'transaction') {
            const catOptions = CATEGORIES.map(cat => `<option value="${cat}" ${item && item.category === cat ? 'selected' : ''}>${cat}</option>`).join('');
            formHtml = `
                <div class="grid grid-cols-2 gap-4">
                    <button type="button" id="btn-expense" onclick="App.setTxType('expense')" class="py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${this.state.txFormType === 'expense' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}">Expense</button>
                    <button type="button" id="btn-income" onclick="App.setTxType('income')" class="py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${this.state.txFormType === 'income' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}">Income</button>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <input type="text" name="description" value="${item ? item.description : ''}" required placeholder="e.g. Swiggy Order" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input type="number" name="amount" value="${item ? item.amount : ''}" required min="0" step="1" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                        <input type="date" name="date" required value="${item ? item.date : today}" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select name="category" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all">
                        ${catOptions}
                    </select>
                </div>
            `;
        } else if (type === 'budget') {
            const catOptions = CATEGORIES.map(cat => `<option value="${cat}" ${item && item.category === cat ? 'selected' : ''}>${cat}</option>`).join('');
            formHtml = `
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select name="category" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all">
                        ${catOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Limit</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input type="number" name="limit" value="${item ? item.limit : ''}" required min="0" step="1" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                </div>
            `;
        } else if (type === 'saving') {
            formHtml = `
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Goal Name</label>
                    <input type="text" name="name" value="${item ? item.name : ''}" required placeholder="e.g. New Laptop" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Amount</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input type="number" name="target" value="${item ? item.target : ''}" required min="0" step="1" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Currently Saved</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input type="number" name="current" value="${item ? item.current : '0'}" required min="0" step="1" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Save</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input type="number" name="monthlyContribution" value="${item ? (item.monthlyContribution || '') : ''}" required min="0" step="1" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Date</label>
                        <input type="date" name="date" required value="${item && item.date ? item.date : today}" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                </div>
            `;
        } else if (type === 'investment') {
            const invTypes = ['Stock', 'ETF', 'Crypto', 'Mutual Fund', 'Bonds'];
            const typeOptions = invTypes.map(t => `<option value="${t}" ${item && item.type === t ? 'selected' : ''}>${t}</option>`).join('');
            formHtml = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Symbol/Name</label>
                        <input type="text" name="symbol" value="${item ? item.symbol : ''}" required placeholder="e.g. AAPL" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Asset Type</label>
                        <select name="invType" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all">
                            ${typeOptions}
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Shares Owned</label>
                    <input type="number" name="shares" value="${item ? item.shares : ''}" required min="0" step="0.0001" placeholder="0" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Average Cost</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input type="number" name="avgCost" value="${item ? item.avgCost : ''}" required min="0" step="0.01" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Price</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input type="number" name="currentPrice" value="${item ? item.currentPrice : ''}" required min="0" step="0.01" placeholder="0" class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white transition-all" />
                        </div>
                    </div>
                </div>
            `;
        } else if (type === 'roadmap') {
            let stepsHtml = this.state.roadmap.map(s => `
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-2 border border-slate-200 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${s.icon}" class="w-4 h-4 text-slate-500"></i>
                        <span class="text-sm font-semibold dark:text-white">${s.title}</span>
                        <select onchange="App.updateRoadmapStatus(${s.id}, this.value)" class="text-xs bg-transparent text-slate-600 dark:text-slate-400 font-medium outline-none cursor-pointer">
                            <option value="completed" ${s.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="active" ${s.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
                        </select>
                    </div>
                    <button type="button" onclick="App.deleteItem('roadmap', ${s.id})" class="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `).join('');

            if (this.state.roadmap.length === 0) {
                stepsHtml = `<p class="text-sm text-slate-500 mb-4">No milestones yet. Add one below!</p>`;
            }

            formHtml = `
                <div class="mb-6 max-h-48 overflow-y-auto pr-2">${stepsHtml}</div>
                <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 class="text-sm font-bold dark:text-white mb-3 flex items-center gap-2"><i data-lucide="plus-circle" class="w-4 h-4"></i> Add New Milestone</h4>
                    <div class="grid grid-cols-2 gap-3 mb-2">
                        <input type="text" name="title" placeholder="Milestone Name" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white"/>
                        <select name="icon" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white">
                            <option value="target">Target</option>
                            <option value="home">Home</option>
                            <option value="car">Car</option>
                            <option value="plane">Plane</option>
                            <option value="graduation-cap">Education</option>
                            <option value="briefcase">Briefcase</option>
                            <option value="heart">Health/Heart</option>
                            <option value="shield-check">Shield</option>
                            <option value="laptop">Tech</option>
                        </select>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity fade-in">
                <div class="bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md slide-up overflow-hidden">
                    <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">${modalTitle}</h2>
                        <button type="button" onclick="App.closeModal()" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <form onsubmit="App.handleFormSubmit(event)" class="p-8 space-y-6">
                        ${formHtml}
                        <p id="form-error" class="text-rose-500 text-sm text-center -mb-2"></p>
                        <div class="pt-2 flex gap-4">
                            <button type="button" onclick="App.closeModal()" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all">${type === 'roadmap' ? 'Done' : 'Cancel'}</button>
                            <button type="submit" class="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all">${type === 'roadmap' ? 'Add Step' : 'Save Record'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

// Mix in methods from the module files
Object.assign(App, AppDashboard);
Object.assign(App, AppViews);
Object.assign(App, AppCharts);

// Boot
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
