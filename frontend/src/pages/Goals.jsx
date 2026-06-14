import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Edit2, Target, AlertTriangle, CheckCircle, TrendingUp, Info } from 'lucide-react';

export const Goals = () => {
  const { addToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const fetchData = async () => {
    try {
      const [gData, fData] = await Promise.all([
        api.get('/api/goals'),
        api.get('/api/goals/forecast').catch(() => []) // Handle case if forecast fails
      ]);
      setGoals(gData);
      setForecasts(fData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (g) => {
    setName(g.name);
    setTarget(g.target);
    setCurrent(g.current);
    setMonthlyContribution(g.monthlyContribution);
    setTargetDate(g.date || '');
    setEditingId(g.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setTarget('');
    setCurrent('');
    setMonthlyContribution('');
    setTargetDate('');
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      name, 
      target: parseFloat(target),
      current: current ? parseFloat(current) : 0,
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0,
      date: targetDate || null
    };

    try {
      if (editingId) {
        await api.put(`/api/goals/${editingId}`, payload);
        addToast('Goal updated successfully', 'success');
      } else {
        await api.post('/api/goals/', payload);
        addToast('Goal created successfully', 'success');
      }
      resetForm();
      fetchData();
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this goal?")) {
      try {
        await api.delete(`/api/goals/${id}`);
        addToast('Goal deleted', 'success');
        fetchData();
      } catch (err) {
        addToast(err.toString(), 'error');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const getHealthColors = (health) => {
    switch(health) {
      case 'on_track': return 'text-green-500 bg-green-50 border-green-200';
      case 'behind': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'at_risk': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'complete': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getHealthIcon = (health) => {
    switch(health) {
      case 'on_track': return <TrendingUp size={16} />;
      case 'behind': return <AlertTriangle size={16} />;
      case 'at_risk': return <AlertTriangle size={16} />;
      case 'complete': return <CheckCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  if (loading) return <div>Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground">Track and forecast your financial objectives.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Create Goal
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {goals.map(g => {
          const percent = Math.min((g.current / g.target) * 100, 100);
          const forecast = forecasts.find(f => f.goalId === g.id) || {};
          const healthClass = getHealthColors(forecast.health);

          return (
            <div key={g.id} className="rounded-xl border bg-card shadow-sm flex flex-col relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => openEditModal(g)} className="text-muted-foreground hover:text-primary">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(g.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{g.name}</h3>
                    {forecast.health && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${healthClass}`}>
                        {getHealthIcon(forecast.health)}
                        <span className="capitalize">{forecast.health.replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-2 mt-6">
                  <span className="text-muted-foreground">Saved: <span className="font-bold text-foreground">{formatCurrency(g.current)}</span></span>
                  <span className="text-muted-foreground">Target: <span className="font-bold text-foreground">{formatCurrency(g.target)}</span></span>
                </div>
                
                <div className="w-full bg-secondary rounded-full h-2.5 mb-2 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground mb-4">
                  {percent.toFixed(1)}% Completed
                </div>
              </div>

              <div className="mt-auto border-t bg-muted/30 p-4 rounded-b-xl text-sm">
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-background rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground mb-1">Current Pace</div>
                    <div className="font-semibold">{forecast.currentPace?.months ? `${forecast.currentPace.months} mo` : 'N/A'}</div>
                  </div>
                  <div className="bg-primary/5 rounded-lg border border-primary/20 p-2">
                    <div className="text-xs text-primary font-medium mb-1">+10% Save</div>
                    <div className="font-semibold">{forecast.accelerated?.months ? `${forecast.accelerated.months} mo` : 'N/A'}</div>
                  </div>
                  <div className="bg-green-500/5 rounded-lg border border-green-500/20 p-2">
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">+25% Save</div>
                    <div className="font-semibold">{forecast.aggressive?.months ? `${forecast.aggressive.months} mo` : 'N/A'}</div>
                  </div>
                </div>
                {forecast.insights && forecast.insights.length > 0 && (
                  <div className="text-xs text-muted-foreground bg-background rounded-lg p-3 border">
                    <ul className="list-disc pl-4 space-y-1">
                      {forecast.insights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transform rotate-3">
                <Target size={32} />
              </div>
            </div>
            <p className="font-bold text-xl mb-2">Set Financial Targets</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">Create goals for big purchases, emergencies, or investments. We will track your progress and provide dynamic forecasts.</p>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create First Goal
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 border shadow-lg my-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Goal' : 'Create Savings Goal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Car Downpayment"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="25000"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Currently Saved</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Plan</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
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
                  {editingId ? 'Save Changes' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
