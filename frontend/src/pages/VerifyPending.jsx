import { useSearchParams, Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';

export const VerifyPending = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'your email address';

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <MailCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          We've sent a verification link to <span className="font-medium text-foreground">{email}</span>. 
          Please check your inbox and click the link to verify your account.
        </p>
        <Link 
          to="/login"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};
