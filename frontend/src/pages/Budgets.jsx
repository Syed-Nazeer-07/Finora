import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const Budgets = () => {
  const [budgets, setBudgets] = [useState([]), null][0] /* placeholder trick removed to use actual hook syntax */ ;
  const { addToast } = useToast();
  const [realBudgets, setRealBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const fetchData = async () => {
    try {
      const [bData, tData] = await Promise.all([
        api.get('/api/budgets'),
        api.get('/api/transactions')
      ]);
      setRealBudgets(bData);
      setTransactions(tData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (b) => {
    setCategory(b.category);
    setLimit(b.limit);
    setEditingId(b.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setCategory('');
    setLimit('');
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/budgets/${editingId}`, { category, limit: parseFloat(limit) });
        addToast('Budget updated successfully', 'success');
      } else {
        await api.post('/api/budgets/', { category, limit: parseFloat(limit) });
        addToast('Budget created successfully', 'success');
      }
      resetForm();
      fetchData();
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this budget?")) {
      try {
        await api.delete(`/api/budgets/${id}`);
        addToast('Budget deleted', 'success');
        fetchData();
      } catch (err) {
        addToast(err.toString(), 'error');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  if (loading) return <div>Loading budgets...</div>;

  // Calculate spent amounts
  const currentMonthTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    const now = new Date();
    return tx.type === 'expense' && txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  const budgetsWithSpent = realBudgets.map(b => {
    const spent = currentMonthTransactions
      .filter(tx => tx.category === b.category)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...b, spent };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Control spending with monthly limits.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Create Budget
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgetsWithSpent.map(b => {
          const percent = Math.min((b.spent / b.limit) * 100, 100);
          const isOver = b.spent > b.limit;
          const remaining = b.limit - b.spent;

          return (
            <div key={b.id} className="rounded-xl border bg-card p-6 shadow-sm relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => openEditModal(b)} className="text-muted-foreground hover:text-primary">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(b.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{b.category}</h3>
                <span className={`text-xs font-bold uppercase ${isOver ? 'text-destructive' : 'text-green-500'}`}>
                  {isOver ? 'Over Budget' : 'On Track'}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Spent: <span className="font-bold text-foreground">{formatCurrency(b.spent)}</span></span>
                <span className="text-muted-foreground">Limit: <span className="font-bold text-foreground">{formatCurrency(b.limit)}</span></span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="text-right text-sm font-medium">
                {isOver ? (
                  <span className="text-destructive">Over by {formatCurrency(Math.abs(remaining))}</span>
                ) : (
                  <span className="text-green-500">{formatCurrency(remaining)} left</span>
                )}
              </div>
            </div>
          );
        })}

        {budgetsWithSpent.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-muted-foreground mb-4">You haven't set any budgets yet.</p>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80"
            >
              Create First Budget
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 border shadow-lg">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Budget' : 'Create Budget'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Groceries"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Limit</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="5000"
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 hover:bg-secondary rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  {editingId ? 'Save Changes' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
