import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Rocket, Target, DollarSign, UserRound } from 'lucide-react';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    age_range: '',
    income_range: '',
    primary_goal: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile/', {
        ...formData,
        onboarding_completed: true
      });
      navigate('/');
    } catch (err) {
      addToast(err.toString(), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg bg-card border rounded-2xl shadow-xl overflow-hidden p-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className={`h-2 rounded-full flex-1 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="w-4"></div>
            <div className={`h-2 rounded-full flex-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="w-4"></div>
            <div className={`h-2 rounded-full flex-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
          
          {step === 1 && (
            <div className="text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <Rocket size={32} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to Finora!</h1>
              <p className="text-muted-foreground">Let's set up your profile so we can personalize your experience.</p>
              
              <div className="mt-8 text-left">
                <label className="block text-sm font-medium mb-3">What is your age range?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['18-24', '25-34', '35-44', '45-54', '55+'].map(age => (
                    <button
                      key={age}
                      onClick={() => setFormData({...formData, age_range: age})}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        formData.age_range === age 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <DollarSign size={32} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Income Details</h1>
              <p className="text-muted-foreground">This helps us provide relevant financial benchmarks.</p>
              
              <div className="mt-8 text-left">
                <label className="block text-sm font-medium mb-3">What is your annual income range?</label>
                <div className="space-y-3">
                  {[
                    '< $30,000',
                    '$30,000 - $60,000',
                    '$60,000 - $100,000',
                    '$100,000 - $150,000',
                    '$150,000+'
                  ].map(income => (
                    <button
                      key={income}
                      onClick={() => setFormData({...formData, income_range: income})}
                      className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-colors text-left ${
                        formData.income_range === income 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {income}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <Target size={32} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Primary Goal</h1>
              <p className="text-muted-foreground">What do you want to achieve with Finora?</p>
              
              <div className="mt-8 text-left">
                <label className="block text-sm font-medium mb-3">Select your main focus:</label>
                <div className="space-y-3">
                  {[
                    'Save for a major purchase',
                    'Build an emergency fund',
                    'Pay off debt',
                    'Track daily expenses',
                    'Grow investments'
                  ].map(goal => (
                    <button
                      key={goal}
                      onClick={() => setFormData({...formData, primary_goal: goal})}
                      className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-colors text-left ${
                        formData.primary_goal === goal 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={step === 1 && !formData.age_range || step === 2 && !formData.income_range}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Next Step
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!formData.primary_goal || loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
