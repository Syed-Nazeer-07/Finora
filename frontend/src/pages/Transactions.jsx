import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const Transactions = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/api/transactions');
      setTransactions(data);
    } catch (e) {
      console.error(e);
      addToast(e.toString(), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setShowModal(false);
  };

  const openEditModal = (tx) => {
    setDescription(tx.description);
    setAmount(tx.amount);
    setCategory(tx.category);
    setType(tx.type);
    setDate(tx.date);
    setEditingId(tx.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      description,
      amount: parseFloat(amount),
      category,
      type,
      date
    };

    try {
      if (editingId) {
        await api.put(`/api/transactions/${editingId}`, payload);
        addToast('Transaction updated successfully', 'success');
      } else {
        await api.post('/api/transactions/', payload);
        addToast('Transaction added successfully', 'success');
      }
      resetForm();
      fetchTransactions();
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/api/transactions/${id}`);
        addToast('Transaction deleted', 'success');
        fetchTransactions();
      } catch (err) {
        addToast(err.toString(), 'error');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No transactions yet. Click "Add Transaction" to get started.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">{tx.date}</td>
                    <td className="px-6 py-4 font-medium">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${tx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(tx)}
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors inline-block"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors inline-block"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 border shadow-lg">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="expense" checked={type === 'expense'} onChange={(e) => setType(e.target.value)} className="accent-primary" />
                    <span>Expense</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="income" checked={type === 'income'} onChange={(e) => setType(e.target.value)} className="accent-primary" />
                    <span>Income</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Groceries"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Food"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  {editingId ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
