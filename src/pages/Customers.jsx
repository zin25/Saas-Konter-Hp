import { useState, useEffect } from 'react';
import { User, Phone, Wallet, History, ChevronRight, X, UserX } from 'lucide-react';
import { db } from '../utils/db';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            const data = await db.getCustomers();
            setCustomers(data);
            setIsLoading(false);
        };
        fetchCustomers();
    }, []);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [search, setSearch] = useState('');
    const [payDebtModal, setPayDebtModal] = useState(false);
    const [payAmount, setPayAmount] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const handlePayDebt = async (e) => {
        e.preventDefault();
        const amount = parseInt(payAmount) || 0;

        setCustomers(prev => prev.map(c => {
            if (c.id === selectedCustomer.id) {
                const newDebt = Math.max(0, c.debt - amount);
                return { ...c, debt: newDebt };
            }
            return c;
        }));

        // Update local selected state
        setSelectedCustomer(prev => ({
            ...prev,
            debt: Math.max(0, prev.debt - amount)
        }));

        await db.updateCustomerDebt(selectedCustomer.phone, -amount);

        setPayDebtModal(false);
        setPayAmount('');
    };

    if (isLoading) {
        return (
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div className="text-muted">Memuat data pelanggan...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', height: '100%', alignItems: 'flex-start' }}>

            {/* List Panel */}
            <div style={{ flex: selectedCustomer ? '1' : '1', transition: 'var(--transition)' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div>
                        <h1 className="text-h2" style={{ marginBottom: '8px' }}>Database Pelanggan</h1>
                        <p className="text-muted">Kelola profil dan riwayat pelanggan.</p>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Cari Nama Pelanggan / No WA..."
                    className="form-input btn-block"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ marginBottom: '24px' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            className="glass-panel"
                            style={{
                                cursor: 'pointer',
                                borderLeft: customer.debt > 0 ? '4px solid var(--danger)' : '1px solid var(--border-color)',
                                backgroundColor: selectedCustomer?.id === customer.id ? 'var(--bg-surface-hover)' : 'rgba(30, 34, 43, 0.7)',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                                    <User size={24} className="text-muted" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>{customer.name}</div>
                                    <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                        <Phone size={12} /> {customer.phone}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {customer.debt > 0 && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>HUTANG AKTIF</div>
                                        <div style={{ color: 'var(--danger)', fontWeight: 700 }}>Rp {customer.debt.toLocaleString('id-ID')}</div>
                                    </div>
                                )}
                                <ChevronRight size={20} className="text-muted" />
                            </div>
                        </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="text-center text-muted" style={{ padding: '40px' }}>
                            <UserX size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                            <p>Tidak ada pelanggan ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Profil Detail Panel (Sidebar 2) */}
            {selectedCustomer && (
                <div className="glass-panel animate-fade-in" style={{ flex: '0 0 450px', position: 'sticky', top: '0' }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <h2 className="text-h2">Profil Pelanggan</h2>
                        <button onClick={() => setSelectedCustomer(null)} className="text-muted" style={{ padding: '4px' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <User size={40} className="text-muted" />
                        </div>
                        <h3 className="text-h2" style={{ marginBottom: '4px' }}>{selectedCustomer.name}</h3>
                        <div className="text-muted flex-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} /> {selectedCustomer.phone}
                        </div>
                    </div>

                    {/* Kartu Hutang */}
                    {selectedCustomer.debt > 0 ? (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '32px' }}>
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--danger)' }}>
                                    <Wallet size={20} />
                                    <span style={{ fontWeight: 600 }}>Total Hutang Bertjalan</span>
                                </div>
                                <span className="text-h2" style={{ color: 'var(--danger)' }}>Rp {selectedCustomer.debt.toLocaleString('id-ID')}</span>
                            </div>
                            <button className="btn btn-block" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={() => setPayDebtModal(true)}>
                                Bayar / Lunasi Hutang
                            </button>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '32px', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Wallet size={20} /> Bebas Hutang (Lunas)
                            </span>
                        </div>
                    )}

                    {/* Riwayat Servis */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <History size={18} className="text-muted" />
                            <h3 className="text-h3">Riwayat Servis</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selectedCustomer.history.map((hist, idx) => (
                                <div key={idx} style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{hist.id}</span>
                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>{hist.date}</span>
                                    </div>
                                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{hist.device}</div>
                                    <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Keluhan: {hist.issue}</div>
                                    <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                                        Biaya: Rp {hist.cost.toLocaleString('id-ID')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Bayar Hutang */}
            {payDebtModal && selectedCustomer && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-surface)' }}>
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h2 className="text-h2">Pelunasan Hutang</h2>
                            <button onClick={() => setPayDebtModal(false)}><X size={24} className="text-muted" /></button>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '24px' }}>
                            <div className="flex-between">
                                <span className="text-muted">Total Hutang:</span>
                                <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.2rem' }}>Rp {selectedCustomer.debt.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <form onSubmit={handlePayDebt}>
                            <div className="form-group">
                                <label className="form-label">Nominal Pembayaran (Rp)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ fontSize: '1.2rem', fontWeight: 600 }}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    max={selectedCustomer.debt}
                                    required
                                    autoFocus
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
                                Catat Pembayaran
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
