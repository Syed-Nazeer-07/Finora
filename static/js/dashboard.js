// Dashboard tab view — attached to App at runtime via app.js

const AppDashboard = {
    getDashboardHTML() {
        const calc = this.getCalculations();
        const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';

        const healthTooltip = `Score: ${calc.healthScore}/100\nSavings: +${calc.breakdown.savingsRateScore}\nEmergency: +${calc.breakdown.emergencyFundScore}\nInvestments: +${calc.breakdown.investmentScore}\nBudgets: +${calc.breakdown.budgetScore}`;

        const roadmapHtml = this.state.roadmap.map(step => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            const isPending = step.status === 'pending';

            let circleClass = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-white dark:ring-dark-card';
            let textClass = 'text-slate-500';

            if (isCompleted) {
                circleClass = 'bg-brand-500 text-white shadow-md ring-white dark:ring-dark-card';
                textClass = 'text-slate-900 dark:text-white';
            } else if (isActive) {
                circleClass = 'bg-brand-500 text-white shadow-md animate-pulse ring-white dark:ring-dark-card';
                textClass = 'text-brand-600 dark:text-brand-400';
            }

            return `
                <div class="flex flex-col items-center gap-2 ${isPending ? 'opacity-50 hidden sm:flex' : ''}">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ring-4 z-10 ${circleClass}">
                        <i data-lucide="${step.icon}" class="w-4 h-4"></i>
                    </div>
                    <span class="text-xs font-semibold ${textClass} text-center leading-tight whitespace-nowrap">${step.title}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="space-y-6 sm:space-y-8 pb-10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 slide-up">
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">Good ${timeOfDay}, Nazeer 👋</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">Welcome to your Personal Financial OS.</p>
                    </div>
                    <button onclick="App.openModal('transaction')" class="w-full md:w-auto px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> Add Transaction
                    </button>
                </div>

                <!-- Row 1: Hero & Health -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up delay-100">
                    <div class="lg:col-span-2 relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900 dark:bg-dark-card border border-slate-800 dark:border-dark-border text-white shadow-2xl hover-card">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl -mr-20 -mt-40 pointer-events-none animate-pulse-slow"></div>
                        <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                        <div class="relative z-10 flex flex-col h-full justify-between">
                            <div class="flex justify-between items-start mb-8">
                                <div>
                                    <p class="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Total Net Worth</p>
                                    <h2 class="text-4xl sm:text-5xl font-extrabold tracking-tight">${this.formatCurrency(calc.netWorth)}</h2>
                                </div>
                                <div class="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 text-sm font-bold backdrop-blur-md">
                                    <i data-lucide="trending-up" class="w-4 h-4"></i> +${calc.netWorthGrowth.toFixed(1)}%
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                                <div>
                                    <p class="text-slate-400 text-xs mb-1">Liquid Cash</p>
                                    <p class="font-semibold text-lg">${this.formatCurrency(calc.currentCash)}</p>
                                </div>
                                <div>
                                    <p class="text-slate-400 text-xs mb-1">Savings</p>
                                    <p class="font-semibold text-lg">${this.formatCurrency(calc.totalSavings)}</p>
                                </div>
                                <div>
                                    <p class="text-slate-400 text-xs mb-1">Investments</p>
                                    <p class="font-semibold text-lg">${this.formatCurrency(calc.totalInvestmentValue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-dark-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border shadow-sm hover-card flex flex-col justify-center items-center text-center relative overflow-hidden group">
                        <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Financial Health V2</h3>
                        <div class="text-[10px] text-slate-400 mb-4 cursor-help" title="${healthTooltip}">Hover for breakdown</div>
                        <div class="relative w-32 h-32 flex items-center justify-center">
                            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path class="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="100, 100" />
                                <path class="${calc.healthScore > 75 ? 'text-emerald-500' : 'text-amber-500'}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="${calc.healthScore}, 100" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-3xl font-extrabold text-slate-900 dark:text-white">${calc.healthScore}</span>
                            </div>
                        </div>
                        <p class="mt-4 text-sm font-medium ${calc.healthScore > 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">
                            ${calc.healthScore > 75 ? 'Optimized 🚀' : 'Needs Attention'}
                        </p>
                    </div>
                </div>

                <!-- Row 2: Roadmap & Affordability -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up delay-200">
                    <div class="lg:col-span-2 bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-dark-border shadow-sm hover-card relative">
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><i data-lucide="map" class="w-5 h-5 text-brand-500"></i> Financial Roadmap</h3>
                            <button onclick="App.openModal('roadmap')" class="text-xs font-semibold text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 transition-colors flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                <i data-lucide="settings" class="w-3 h-3"></i> Customize
                            </button>
                        </div>
                        <div class="relative flex justify-between items-center w-full px-2 overflow-x-auto hide-scrollbar pb-2 pt-2">
                            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                            <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 -z-10 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style="width: 50%;"></div>
                            ${roadmapHtml}
                        </div>
                    </div>

                    <div class="bg-white dark:bg-dark-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border shadow-sm hover-card">
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2"><i data-lucide="shopping-cart" class="w-5 h-5 text-emerald-500"></i> Affordability Check</h3>
                        <form onsubmit="App.checkAffordability(event)" class="space-y-3">
                            <div>
                                <input type="text" name="itemName" placeholder="Item Name (e.g., iPhone 15)" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors">
                            </div>
                            <div class="flex gap-2">
                                <input type="number" name="price" placeholder="Price (₹)" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors">
                                <button type="submit" class="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-colors shrink-0 shadow-lg shadow-emerald-500/30"><i data-lucide="calculator" class="w-5 h-5"></i></button>
                            </div>
                        </form>
                        <div id="affordability-result"></div>
                    </div>
                </div>

                <!-- Row 3: Net Worth Chart & Expense Breakdown -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up delay-300">
                    <div class="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm hover-card">
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-6">Net Worth Trend</h3>
                        <div class="h-64 relative w-full">
                            <canvas id="netWorthChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-dark-card p-6 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm hover-card">
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-6">Expense Breakdown</h3>
                        <div class="h-64 relative w-full flex justify-center">
                            <canvas id="expenseChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Row 4: Future Simulator -->
                <div class="grid grid-cols-1 gap-6 slide-up delay-[400ms]">
                    <div class="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm hover-card">
                        <div class="mb-6">
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-1 flex items-center gap-2"><i data-lucide="zap" class="w-5 h-5 text-amber-500"></i> Future Simulator</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400">Test how lifestyle changes impact your 1-Year Projected Net Worth.</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <div>
                                <div class="flex justify-between text-sm mb-2 font-medium">
                                    <span class="text-slate-700 dark:text-slate-300">Increase Monthly Income</span>
                                    <span class="text-emerald-600 font-bold" id="val-salaryIncrease">+0%</span>
                                </div>
                                <input type="range" min="0" max="50" value="0" oninput="App.updateSimulator('salaryIncrease', this.value)">
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-2 font-medium">
                                    <span class="text-slate-700 dark:text-slate-300">Reduce Monthly Expenses</span>
                                    <span class="text-brand-600 font-bold" id="val-expenseReduction">-0%</span>
                                </div>
                                <input type="range" min="0" max="50" value="0" oninput="App.updateSimulator('expenseReduction', this.value)">
                            </div>
                            <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">1-Year Projected Net Worth</p>
                                <h4 class="text-3xl font-extrabold text-slate-900 dark:text-white" id="sim-projected-nw">${this.formatCurrency(calc.netWorth + ((calc.totalIncome - calc.totalExpenses) * 12) + (calc.totalInvestmentValue * 0.12))}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
