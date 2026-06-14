import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Investments = () => {
  const { addToast } = useToast();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('Stock');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const fetchData = async () => {
    try {
      const data = await api.get('/api/investments');
      setInvestments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (inv) => {
    setSymbol(inv.symbol);
    setType(inv.type);
    setShares(inv.shares);
    setAvgCost(inv.avgCost);
    setCurrentPrice(inv.currentPrice);
    setEditingId(inv.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setSymbol('');
    setType('Stock');
    setShares('');
    setAvgCost('');
    setCurrentPrice('');
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      symbol,
      type,
      shares: parseFloat(shares),
      avgCost: avgCost ? parseFloat(avgCost) : 0,
      currentPrice: currentPrice ? parseFloat(currentPrice) : 0
    };

    try {
      if (editingId) {
        await api.put(`/api/investments/${editingId}`, payload);
        addToast('Investment updated successfully', 'success');
      } else {
        await api.post('/api/investments/', payload);
        addToast('Investment created successfully', 'success');
      }
      resetForm();
      fetchData();
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this investment?")) {
      try {
        await api.delete(`/api/investments/${id}`);
        addToast('Investment deleted', 'success');
        fetchData();
      } catch (err) {
        addToast(err.toString(), 'error');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  if (loading) return <div>Loading investments...</div>;

  let totalValue = 0;
  let totalCost = 0;
  investments.forEach(inv => {
    totalValue += inv.shares * inv.currentPrice;
    totalCost += inv.shares * inv.avgCost;
  });
  const totalReturn = totalValue - totalCost;
  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">Manage your portfolio and track returns.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Portfolio Value</h3>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Cost</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalCost)}</div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Return</h3>
            {totalReturn >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
          </div>
          <div className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-green-500' : 'text-destructive'}`}>
            {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
          </div>
          <p className={`text-sm ${totalReturn >= 0 ? 'text-green-500/80' : 'text-destructive/80'}`}>
            {totalReturn >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Asset</th>
              <th className="px-6 py-4 font-medium text-right">Shares</th>
              <th className="px-6 py-4 font-medium text-right">Avg Cost</th>
              <th className="px-6 py-4 font-medium text-right">Price</th>
              <th className="px-6 py-4 font-medium text-right">Total Value</th>
              <th className="px-6 py-4 font-medium text-right">Return</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {investments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                  No investments yet.
                </td>
              </tr>
            ) : (
              investments.map(inv => {
                const value = inv.shares * inv.currentPrice;
                const cost = inv.shares * inv.avgCost;
                const ret = value - cost;
                const retPct = cost > 0 ? (ret / cost) * 100 : 0;
                
                return (
                  <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-base">{inv.symbol}</div>
                      <div className="text-xs text-muted-foreground">{inv.type}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{inv.shares}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(inv.avgCost)}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(inv.currentPrice)}</td>
                    <td className="px-6 py-4 text-right font-bold">{formatCurrency(value)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${ret >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      {ret >= 0 ? '+' : ''}{formatCurrency(ret)}
                      <div className="text-xs opacity-80">{ret >= 0 ? '+' : ''}{retPct.toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(inv)}
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 inline-block"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv.id)}
                        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 inline-block"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 border shadow-lg">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Investment' : 'Add Investment'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Symbol/Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Type</label>
                  <select 
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Stock">Stock</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="ETF">ETF</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Shares</label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="10.5"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Average Cost</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={avgCost}
                    onChange={(e) => setAvgCost(e.target.value)}
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    placeholder="165.50"
                  />
                </div>
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
                  {editingId ? 'Save Changes' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
