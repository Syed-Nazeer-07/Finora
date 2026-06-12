
const AppCharts = {
    async initDashboardCharts() {
        const isDark = this.state.darkMode;
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        // Initialize charts with staggered timing
        await Promise.all([
            this._initNetWorthChart(isDark, textColor, gridColor),
            new Promise(resolve => setTimeout(() => {
                this._initExpenseChart(isDark, textColor);
                resolve();
            }, 150))
        ]);
    },
    
    async _initNetWorthChart(isDark, textColor, gridColor) {
        const nwCtx = document.getElementById('netWorthChart');
        if (!nwCtx) return;
        
        const existingNwChart = Chart.getChart(nwCtx);
        if (existingNwChart) existingNwChart.destroy();
        
        let nwLabels = ['Jan','Feb','Mar','Apr','May','Jun'];
        let nwData   = [0,0,0,0,0,0];
        try {
            const res = await fetch('/api/net-worth-history');
            if (res.ok) { const d = await res.json(); nwLabels = d.labels; nwData = d.data; }
        } catch(e) {}
        
        const skeleton = document.getElementById('netWorthSkeleton');
        const chartContainer = nwCtx.closest('[data-chart-type]');
        
        this.state.charts.nw = new Chart(nwCtx, {
            type: 'line',
            data: {
                labels: nwLabels,
                datasets: [{
                    label: 'Net Worth',
                    data: nwData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: isDark ? '#0f172a' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                    y: { border: {display: false}, grid: { color: gridColor }, ticks: { color: textColor, callback: (val) => {
                        const sym = App.getCurrencySymbol();
                        const abs = Math.abs(val);
                        if (abs >= 1e7) return (val/1e7).toFixed(1).replace(/\.0$/,'') + ' Cr';
                        if (abs >= 1e5) return (val/1e5).toFixed(1).replace(/\.0$/,'') + ' L';
                        if (abs >= 1e3) return (val/1e3).toFixed(0) + 'k';
                        return sym + val;
                    }}},
                    x: { border: {display: false}, grid: { display: false }, ticks: { color: textColor } }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
        
        // Fade in chart
        if (skeleton) skeleton.style.display = 'none';
        if (chartContainer) chartContainer.classList.add('fade-in-complete');
        nwCtx.style.opacity = '1';
    },
    
    _initExpenseChart(isDark, textColor) {
        const expCtx = document.getElementById('expenseChart');
        if (!expCtx) return;
        
        const existingExpChart = Chart.getChart(expCtx);
        if (existingExpChart) existingExpChart.destroy();
        
        const skeleton = document.getElementById('expenseSkeleton');
        const chartContainer = expCtx.closest('[data-chart-type]');
        
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
        this.state.charts.exp = new Chart(expCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#64748b', '#ef4444', '#14b8a6', '#84cc16'],
                    borderWidth: 2,
                    borderColor: isDark ? '#111827' : '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                cutout: '75%',
                plugins: {
                    legend: { position: 'right', labels: { color: textColor, usePointStyle: true, padding: 15 } }
                }
            }
        });
        
        // Fade in chart
        if (skeleton) skeleton.style.display = 'none';
        if (chartContainer) chartContainer.classList.add('fade-in-complete');
        expCtx.style.opacity = '1';
    },
    
    initInvestmentCharts() {
        const ctx = document.getElementById('allocationChart');
        if (!ctx) return;
        
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();
        
        const allocTotals = {};
        this.state.investments.forEach(inv => {
            const value = inv.shares * inv.currentPrice;
            allocTotals[inv.type] = (allocTotals[inv.type] || 0) + value;
        });
        const isDark = this.state.darkMode;
        const textColor = isDark ? '#94a3b8' : '#64748b';
        
        this.state.charts.invAlloc = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(allocTotals),
                datasets: [{
                    data: Object.values(allocTotals),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                    borderWidth: 2,
                    borderColor: isDark ? '#111827' : '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                cutout: '70%',
                plugins: { 
                    legend: { 
                        display: false,
                        labels: { color: textColor }
                    } 
                }
            }
        });
        
        // Fade in chart
        const chartContainer = ctx.closest('[data-chart-type]');
        if (chartContainer) chartContainer.classList.add('fade-in-complete');
        ctx.style.opacity = '1';
    }
};
