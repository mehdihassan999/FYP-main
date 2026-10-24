








import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '@/components/auth/Login';
import { Register } from '@/components/auth/Register';
import { toast } from 'sonner';

export type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthPageProps {
  onAuthSuccess: (user: {
    username: string;
    email: string;
    networkType: 'home' | 'company' | 'education';
  }) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();

  // ---------------- Login Handler ----------------
  const handleLogin = async (credentials: {
    email: string;
    password: string;
    routerUsername: string;
  }) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Login failed', { description: data.error || 'Invalid credentials' });
        return;
      }

      // Store JWT in localStorage
      localStorage.setItem('token', data.access_token);

      const user = {
        username: data.username,
        email: credentials.email,
        networkType: 'home' as 'home' | 'company' | 'education', // optional: get from backend
      };

      toast.success('Login successful', { description: 'Welcome to CyberX' });
      onAuthSuccess(user);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed', { description: 'Server error, try again later' });
      console.error(error);
    }
  };

  // ---------------- Register Handler ----------------
  const handleRegister = async (userData: {
    username: string;
    email: string;
    password: string;
    networkType: string;
    routerUsername: string;
    routerPassword: string;
    acceptedTerms: boolean;
  }) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Registration failed', { description: data.error || 'Try again' });
        return;
      }

      toast.success('Registration successful', {
        description: 'Your security suite has been initialized',
      });

      // Auto-login after registration
      await handleLogin({
        email: userData.email,
        password: userData.password,
        routerUsername: userData.routerUsername,
      });
    } catch (error) {
      toast.error('Registration failed', { description: 'Server error, try again later' });
      console.error(error);
    }
  };

  // ---------------- Forgot Password Handler ----------------
  const handleForgotPassword = () => {
    console.log('Forgot password requested');
    toast.info('Password reset', {
      description: 'Password reset functionality will be implemented',
    });
    setMode('login');
  };

  // ---------------- Render ----------------
  switch (mode) {
    case 'register':
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setMode('login')}
        />
      );
    case 'login':
    default:
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setMode('register')}
          onForgotPassword={handleForgotPassword}
        />
      );
  }
}
