import { useState, useEffect } from 'react';
import { Send, CheckCircle, Edit, DollarSign, X } from 'lucide-react';
import { db } from '../utils/db';

export default function ServiceList() {
    const [filter, setFilter] = useState('Semua');
    const [services, setServices] = useState([]);
    const [paymentModal, setPaymentModal] = useState({ open: false, service: null, paidAmount: '' });
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadServices = async () => {
            const data = await db.getServices();
            setServices(data);
            setIsLoading(false);
        };
        loadServices();
    }, []);

    const filters = ['Semua', 'Menunggu Sparepart', 'Dikerjakan', 'Selesai (Siap Ambil)', 'Diambil'];

    const filteredServices = services.filter(s => {
        const matchFilter = filter === 'Semua' || s.status === filter;
        const matchSearch = s.customer.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const handleStatusChange = async (id, newStatus) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        await db.updateService(id, { status: newStatus });
    };

    const sendReminder = (service) => {
        const text = `Halo Kak ${service.customer}, HP ${service.device} dengan nota ${service.id} sudah selesai diservis dan siap diambil. Total biaya: Rp ${service.cost.toLocaleString('id-ID')}. Terima kasih!`;
        const url = `https://wa.me/${service.phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        const { service, paidAmount } = paymentModal;
        const paid = parseInt(paidAmount) || 0;
        const debt = service.cost - paid;

        if (debt > 0) {
            if (!window.confirm(`Terdapat sisa Rp ${debt.toLocaleString('id-ID')}. Masukkan ke Catatan Hutang?`)) {
                return;
            }
            await db.updateCustomerDebt(service.phone, debt);
        }

        // Status to Diambil
        await handleStatusChange(service.id, 'Diambil');
        setPaymentModal({ open: false, service: null, paidAmount: '' });
    };

    if (isLoading) {
        return (
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div className="text-muted">Memuat data perbaikan...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 className="text-h2" style={{ marginBottom: '8px' }}>Manajemen Servis</h1>
                    <p className="text-muted">Pantau status pengerjaan.</p>
                </div>
                <input
                    type="text"
                    placeholder="Cari Nota / Nama..."
                    className="form-input"
                    style={{ width: '300px' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {filters.map(f => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Service List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredServices.map(service => (
                    <div key={service.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>{service.id}</span>
                                <span className={`badge ${service.status === 'Selesai (Siap Ambil)' ? 'badge-success' : service.status === 'Diambil' ? 'badge-info' : 'badge-warning'}`}>
                                    {service.status}
                                </span>
                            </div>
                            <div className="text-muted" style={{ marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{service.customer}</span> • {service.device}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Keluhan: {service.issue}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '4px' }}>
                                Rp {service.cost.toLocaleString('id-ID')}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                                Deadline: {service.deadline}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                            {service.status !== 'Selesai (Siap Ambil)' && service.status !== 'Diambil' && (
                                <button className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleStatusChange(service.id, 'Selesai (Siap Ambil)')}>
                                    <CheckCircle size={18} /> Tandai Selesai
                                </button>
                            )}

                            {service.status === 'Selesai (Siap Ambil)' && (
                                <>
                                    <button className="btn btn-primary" style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }} onClick={() => sendReminder(service)}>
                                        <Send size={18} /> WA Reminder
                                    </button>
                                    <button className="btn btn-accent" onClick={() => setPaymentModal({ open: true, service, paidAmount: service.cost.toString() })}>
                                        <DollarSign size={18} /> Selesaikan
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {filteredServices.length === 0 && (
                    <div className="glass-panel text-center text-muted" style={{ padding: '48px' }}>
                        Tidak ada data servis untuk filter ini.
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {paymentModal.open && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-surface)' }}>
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h2 className="text-h2">Pembayaran & Pengambilan</h2>
                            <button onClick={() => setPaymentModal({ open: false, service: null, paidAmount: '' })}><X size={24} className="text-muted" /></button>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '24px' }}>
                            <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <span className="text-muted">Nota:</span>
                                <span style={{ fontWeight: 600 }}>{paymentModal.service.id}</span>
                            </div>
                            <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <span className="text-muted">Pelanggan:</span>
                                <span style={{ fontWeight: 600 }}>{paymentModal.service.customer}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Total Tagihan:</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.2rem' }}>Rp {paymentModal.service.cost.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <form onSubmit={handleCheckoutSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nominal Dibayar (Rp)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ fontSize: '1.2rem', fontWeight: 600 }}
                                    value={paymentModal.paidAmount}
                                    onChange={(e) => setPaymentModal(prev => ({ ...prev, paidAmount: e.target.value }))}
                                    required
                                    autoFocus
                                />
                            </div>

                            {paymentModal.service.cost - parseInt(paymentModal.paidAmount || 0) > 0 && (
                                <div style={{ padding: '12px', border: '1px solid var(--danger)', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '16px', fontSize: '0.9rem' }}>
                                    <strong>Peringatan Hutang:</strong> Terdapat sisa Rp {(paymentModal.service.cost - parseInt(paymentModal.paidAmount || 0)).toLocaleString('id-ID')} yang belum dibayar.
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
                                Ya, Selesaikan Transaksi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
