import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';

export const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/profile').catch(() => null),
      api.get('/api/transactions').catch(() => [])
    ]).then(([profileData, txData]) => {
      setProfile(profileData);
      setTransactions(txData.slice(0, 5)); // Show only recent 5
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const netWorth = (profile?.current_savings || 0) + (profile?.current_investments || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to Finora.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Net Worth</h3>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Monthly Income</h3>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500">+{formatCurrency(profile?.monthly_income)}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Monthly Expenses</h3>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive">-{formatCurrency(profile?.monthly_expenses)}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Savings Goal</h3>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{profile?.financial_goal || 'Not set'}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 p-6">
          <div className="mb-4">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions.</p>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                      {tx.type === 'income' ? '💵' : '🛒'}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${tx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
