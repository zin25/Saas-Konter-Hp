import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [method, setMethod] = useState('pin');

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center" style={{ marginBottom: '32px' }}>
                    <h1 className="text-h2" style={{ color: 'var(--primary)' }}>SaaS Konter</h1>
                    <p className="text-muted">Login untuk masuk ke sistem</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button
                        className={`btn btn-block ${method === 'pin' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setMethod('pin')}
                    >
                        PIN Akses
                    </button>
                    <button
                        className={`btn btn-block ${method === 'email' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setMethod('email')}
                    >
                        Email
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    {method === 'pin' ? (
                        <div className="form-group">
                            <label className="form-label">PIN (4-6 Digit)</label>
                            <input type="password" placeholder="••••" className="form-input" style={{ letterSpacing: '8px', fontSize: '1.5rem', textAlign: 'center' }} autoFocus />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" placeholder="admin@konter.com" className="form-input" autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input type="password" placeholder="••••••••" className="form-input" />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '16px' }}>
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}
