// Tab view HTML generators for non-dashboard tabs — attached to App at runtime via app.js

const AppViews = {
    getTransactionsHTML() {
        let filteredTx = this.state.transactions;

        if (this.state.txSearchQuery) {
            const query = this.state.txSearchQuery.toLowerCase();
            filteredTx = filteredTx.filter(tx => tx.description.toLowerCase().includes(query));
        }

        if (this.state.txFilterCategory && this.state.txFilterCategory !== 'All') {
            filteredTx = filteredTx.filter(tx => tx.category === this.state.txFilterCategory);
        }

        let rowsHtml = filteredTx.map(tx => {
            const catEmoji = CATEGORY_EMOJIS[tx.category] || '📦';
            return `
            <tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-dark-border last:border-0">
                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">${this.formatDate(tx.date)}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-lg flex items-center justify-center w-10 h-10 shrink-0">${catEmoji}</div>
                        <span class="font-semibold text-slate-900 dark:text-white">${tx.description}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg whitespace-nowrap border border-slate-200 dark:border-slate-700">${tx.category}</span>
                </td>
                <td class="px-6 py-4 font-bold text-right whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}">
                    ${tx.type === 'income' ? '+' : '-'}${this.formatCurrency(tx.amount)}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="App.openModal('transaction', ${tx.id})" class="text-slate-400 hover:text-brand-500 transition-colors p-2" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="App.deleteItem('transaction', ${tx.id})" class="text-slate-400 hover:text-rose-500 transition-colors p-2" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `}).join('');

        if (filteredTx.length === 0) {
            rowsHtml = `<tr><td colspan="5" class="py-12 text-center text-slate-500 dark:text-slate-400">No transactions found matching your filters.</td></tr>`;
        }

        return `
            <div class="space-y-6 slide-up pb-10">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Transaction Ledger</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Advanced search and filtering.</p>
                    </div>
                    <button onclick="App.openModal('transaction')" class="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex justify-center items-center gap-2 transition-colors shadow-sm hover:scale-105">
                        <i data-lucide="plus" class="w-4 h-4"></i> Add Record
                    </button>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                        <input type="text" placeholder="Search transactions..." oninput="App.handleTxSearch(event)" value="${this.state.txSearchQuery}" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm dark:text-white transition-all">
                    </div>
                    <select onchange="App.handleTxFilter(event)" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm dark:text-white transition-all">
                        <option value="All">All Categories</option>
                        ${CATEGORIES.map(c => `<option value="${c}" ${this.state.txFilterCategory === c ? 'selected' : ''}>${CATEGORY_EMOJIS[c]} ${c}</option>`).join('')}
                    </select>
                </div>
                <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden w-full">
                    <div class="overflow-x-auto w-full">
                        <table class="w-full text-left border-collapse min-w-full">
                            <thead>
                                <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-dark-border">
                                    <th class="px-6 py-4 font-semibold">Date</th>
                                    <th class="px-6 py-4 font-semibold">Description</th>
                                    <th class="px-6 py-4 font-semibold">Category</th>
                                    <th class="px-6 py-4 font-semibold text-right">Amount</th>
                                    <th class="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    getBudgetsHTML() {
        const calc = this.getCalculations();
        const cardsHtml = calc.budgetProgress.map(b => {
            const percent = Math.min((b.spent / b.limit) * 100, 100);
            const isOver = b.spent > b.limit;
            const remaining = b.limit - b.spent;
            const runRate = b.spent * 2;
            const forecastClass = runRate > b.limit ? 'text-rose-500' : 'text-emerald-500';

            return `
                <div class="bg-white dark:bg-dark-card p-6 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm relative group hover-card flex flex-col">
                    <div class="absolute top-4 right-4 flex opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-1">
                        <button onclick="App.openModal('budget', ${b.id})" class="p-2 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="App.deleteItem('budget', ${b.id})" class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="flex items-center gap-4 mb-6">
                        <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl"><i data-lucide="pie-chart" class="w-6 h-6 text-slate-600 dark:text-slate-300"></i></div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white leading-tight">${b.category}</h3>
                            <span class="text-xs font-bold uppercase tracking-wider ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}">
                                ${isOver ? 'Over Budget' : 'On Track'}
                            </span>
                        </div>
                    </div>
                    <div class="mb-2 flex justify-between text-sm mt-auto">
                        <span class="text-slate-500 dark:text-slate-400">Spent: <strong class="text-slate-900 dark:text-white">${this.formatCurrency(b.spent)}</strong></span>
                        <span class="text-slate-500 dark:text-slate-400">Limit: <strong class="text-slate-900 dark:text-white">${this.formatCurrency(b.limit)}</strong></span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
                        <div class="h-3 rounded-full transition-all duration-1000 ${isOver ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-brand-400 to-indigo-600'}" style="width: ${percent}%"></div>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <div class="text-xs font-medium text-slate-500">
                            EOM Forecast: <span class="${forecastClass}">${this.formatCurrency(runRate)}</span>
                        </div>
                        <div class="font-medium text-right">
                            ${isOver ?
                                `<span class="text-rose-500">Over by ${this.formatCurrency(Math.abs(remaining))}</span>` :
                                `<span class="text-emerald-600 dark:text-emerald-400">${this.formatCurrency(remaining)} left</span>`
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="space-y-6 slide-up pb-10">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Budgets & Predictors</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Control spending with end-of-month (EOM) forecasts.</p>
                    </div>
                    <button onclick="App.openModal('budget')" class="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold flex justify-center items-center gap-2 hover:scale-105 transition-all shadow-lg">
                        <i data-lucide="plus" class="w-4 h-4"></i> Create Budget
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${cardsHtml}
                    ${calc.budgetProgress.length === 0 ? `<div class="col-span-full p-12 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">No budgets set.</div>` : ''}
                </div>
            </div>
        `;
    },

    getSavingsHTML() {
        const cardsHtml = this.state.savings.map(goal => {
            const percent = Math.min(((goal.current / goal.target) * 100), 100).toFixed(0);
            const isComplete = goal.current >= goal.target;
            const remainingAmount = goal.target - goal.current;
            const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remainingAmount / goal.monthlyContribution) : 'Infinity';
            let estimatedDateStr = 'Needs adjustment';
            let probability = 'Low';
            let probClass = 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20';

            if (monthsLeft !== 'Infinity') {
                const targetDate = new Date(goal.date);
                const estDate = new Date();
                estDate.setMonth(estDate.getMonth() + monthsLeft);
                estimatedDateStr = estDate.toLocaleDateString('en-IN', {month: 'short', year: 'numeric'});

                if (estDate <= targetDate) {
                    probability = 'High';
                    probClass = 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20';
                } else if ((estDate.getTime() - targetDate.getTime()) < (90*24*60*60*1000)) {
                    probability = 'Medium';
                    probClass = 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20';
                }
            }

            return `
                <div class="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-col relative group hover-card">
                    ${isComplete ? '<div class="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>' : ''}
                    <div class="absolute top-4 right-4 flex opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-1 z-10">
                        <button onclick="App.openModal('saving', ${goal.id})" class="p-2 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="App.deleteItem('saving', ${goal.id})" class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="flex justify-between items-start w-full mb-6">
                        <div>
                            <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-1">${goal.name}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400">Target: <span class="font-semibold text-slate-800 dark:text-slate-200">${this.formatCurrency(goal.target)}</span></p>
                        </div>
                        <div class="px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${probClass}">Prob: ${probability}</div>
                    </div>
                    <div class="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div class="relative w-32 h-32 shrink-0 rounded-full flex items-center justify-center shadow-inner"
                             style="background: conic-gradient(${isComplete ? '#10b981' : '#4f46e5'} ${percent}%, ${this.state.darkMode ? '#1e293b' : '#f1f5f9'} 0)">
                            <div class="absolute w-[112px] h-[112px] bg-white dark:bg-dark-card rounded-full flex flex-col items-center justify-center shadow-md border border-slate-100 dark:border-slate-800">
                                <span class="text-2xl font-extrabold ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}">${percent}%</span>
                            </div>
                        </div>
                        <div class="w-full space-y-4">
                            <div>
                                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Current Saved</p>
                                <p class="text-xl font-bold text-slate-900 dark:text-white">${this.formatCurrency(goal.current)}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Monthly In</p>
                                    <p class="text-sm font-semibold text-brand-600 dark:text-brand-400">${this.formatCurrency(goal.monthlyContribution || 0)}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Est. Completion</p>
                                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">${estimatedDateStr}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="w-full mt-auto bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-center text-slate-500">
                        Desired Date: <strong>${new Date(goal.date).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'})}</strong>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="space-y-6 slide-up pb-10">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Goal Forecasting</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Track progress and predict milestones based on your actual contributions.</p>
                    </div>
                    <button onclick="App.openModal('saving')" class="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex justify-center items-center gap-2 hover:scale-105 transition-all shadow-lg">
                        <i data-lucide="plus" class="w-4 h-4"></i> Add Goal
                    </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">${cardsHtml}</div>
            </div>
        `;
    },

    getInvestmentsHTML() {
        const calc = this.getCalculations();
        let riskProfile = "Balanced";

        let rowsHtml = this.state.investments.map(inv => {
            const currentTotal = inv.shares * inv.currentPrice;
            const costTotal = inv.shares * inv.avgCost;
            const profit = currentTotal - costTotal;
            const profitPercent = costTotal > 0 ? (profit / costTotal) * 100 : 0;
            const isPositive = profit >= 0;

            return `
                <tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-dark-border last:border-0">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-bold text-slate-900 dark:text-white">${inv.symbol}</div>
                        <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">${inv.type}</div>
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">${inv.shares}</td>
                    <td class="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">${this.formatCurrency(inv.avgCost)}</td>
                    <td class="px-6 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${this.formatCurrency(inv.currentPrice)}</td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                        <div class="font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                            ${isPositive ? '+' : ''}${this.formatCurrency(profit)}
                        </div>
                        <div class="text-xs font-semibold mt-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}">
                            ${isPositive ? '+' : ''}${profitPercent.toFixed(2)}%
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        <div class="flex items-center justify-end gap-1">
                            <button onclick="App.openModal('investment', ${inv.id})" class="text-slate-400 hover:text-brand-500 transition-colors p-2" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                            <button onclick="App.deleteItem('investment', ${inv.id})" class="text-slate-400 hover:text-rose-500 transition-colors p-2" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="space-y-6 slide-up pb-10">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Investment Portfolio</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Monitor assets, allocation, and risk profile.</p>
                    </div>
                    <button onclick="App.openModal('investment')" class="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex justify-center items-center gap-2 hover:scale-105 transition-all shadow-lg">
                        <i data-lucide="plus" class="w-4 h-4"></i> Add Asset
                    </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none"></div>
                        <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p class="text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Total Value</p>
                                <h3 class="text-4xl font-extrabold tracking-tight">${this.formatCurrency(calc.totalInvestmentValue)}</h3>
                            </div>
                            <div>
                                <p class="text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Total Invested</p>
                                <h3 class="text-2xl font-semibold">${this.formatCurrency(calc.totalInvestmentCost)}</h3>
                            </div>
                            <div>
                                <p class="text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">Unrealized Return</p>
                                <div class="inline-flex items-center text-xl font-bold px-3 py-1.5 rounded-xl ${calc.investmentProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                                    <i data-lucide="${calc.investmentProfit >= 0 ? 'trending-up' : 'trending-down'}" class="w-5 h-5 mr-1"></i>
                                    ${calc.investmentProfit >= 0 ? '+' : ''}${this.formatCurrency(calc.investmentProfit)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-dark-border flex flex-col items-center">
                        <div class="w-full flex justify-between items-center mb-4">
                            <h3 class="font-bold text-slate-900 dark:text-white text-sm">Asset Allocation</h3>
                            <span class="text-xs font-semibold px-2 py-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">Risk: ${riskProfile}</span>
                        </div>
                        <div class="relative w-full h-40 flex justify-center">
                            <canvas id="allocationChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-sm overflow-hidden w-full">
                    <div class="overflow-x-auto w-full">
                        <table class="w-full text-left border-collapse min-w-full">
                            <thead>
                                <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-dark-border">
                                    <th class="px-6 py-5 font-semibold">Asset</th>
                                    <th class="px-6 py-5 font-semibold">Holdings</th>
                                    <th class="px-6 py-5 font-semibold">Avg Cost</th>
                                    <th class="px-6 py-5 font-semibold">Current Price</th>
                                    <th class="px-6 py-5 font-semibold text-right">Total Return</th>
                                    <th class="px-6 py-5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    getAiCoachHTML() {
        const insights = this.getRuleBasedInsights();
        const insightsHtml = insights.map(ins => {
            let colors = '';
            if (ins.type === 'danger') colors = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20';
            else if (ins.type === 'warning') colors = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
            else if (ins.type === 'success') colors = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
            else colors = 'bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20';

            return `
                <div class="p-3 mb-3 rounded-xl border flex items-start gap-3 text-sm font-medium ${colors}">
                    <i data-lucide="${ins.icon}" class="w-5 h-5 shrink-0"></i>
                    <p>${ins.text}</p>
                </div>
            `;
        }).join('');

        const chatHtml = this.state.aiChats.map(msg => `
            <div class="flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} mb-6">
                <div class="w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${msg.role === 'ai' ? 'bg-gradient-to-br from-purple-500 to-brand-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}">
                    ${msg.role === 'ai' ? '<i data-lucide="bot" class="w-5 h-5"></i>' : 'NA'}
                </div>
                <div class="max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 shadow-sm' : 'bg-brand-600 text-white shadow-md'}">
                    ${msg.text}
                </div>
            </div>
        `).join('');

        return `
            <div class="flex flex-col h-full max-h-[85vh] slide-up">
                <div class="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                            <i data-lucide="sparkles" class="w-6 h-6 text-purple-500"></i> Smart Coach V2
                        </h2>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Your dynamic, rule-based financial advisor.</p>
                    </div>
                    <div class="lg:col-span-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm rounded-2xl p-4 max-h-48 overflow-y-auto">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Account Insights</h4>
                        ${insightsHtml}
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto pr-2 bg-slate-50/50 dark:bg-dark-bg/50 rounded-2xl p-4 border border-slate-100 dark:border-dark-border" id="chat-container">
                    ${chatHtml}
                </div>
                <div class="mt-4 pt-4">
                    <div class="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                        <button onclick="App.sendAiMsg('Where am I overspending?')" class="shrink-0 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Where am I overspending?</button>
                        <button onclick="App.sendAiMsg('Can I afford a new laptop?')" class="shrink-0 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Can I afford a new laptop?</button>
                        <button onclick="App.sendAiMsg('How much should I save monthly?')" class="shrink-0 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">How much should I save monthly?</button>
                    </div>
                    <form onsubmit="App.handleAiSubmit(event)" class="relative">
                        <input type="text" name="prompt" placeholder="Ask the LLM interface..." class="w-full bg-white dark:bg-dark-card border border-slate-300 dark:border-slate-700 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all">
                        <button type="submit" class="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center transition-colors">
                            <i data-lucide="send" class="w-4 h-4"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
    }
};
