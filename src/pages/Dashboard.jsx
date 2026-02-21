import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, CheckCircle, Wallet, Plus, Clock, AlertCircle } from 'lucide-react';
import { db } from '../utils/db';

export default function Dashboard() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({ activeServices: 0, readyToPickup: 0, totalDebt: 0 });
    const [priorityQueue, setPriorityQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const services = await db.getServices();
                const customers = await db.getCustomers();

                const active = services.filter(s => s.status === 'Dikerjakan' || s.status === 'Menunggu Sparepart');
                const ready = services.filter(s => s.status === 'Selesai (Siap Ambil)');
                const debt = customers.reduce((sum, c) => sum + c.debt, 0);

                setMetrics({ activeServices: active.length, readyToPickup: ready.length, totalDebt: debt });
                setPriorityQueue(active.slice(0, 5));
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div className="text-muted">Memuat data dari Server...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="text-h1" style={{ marginBottom: '8px' }}>Pusat Kendali</h1>
                    <p className="text-muted">Ringkasan operasional konter hari ini.</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ padding: '16px 24px', fontSize: '1.1rem' }}
                    onClick={() => navigate('/new-service')}
                >
                    <Plus size={24} />
                    <span>Servis Baru</span>
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid-cards" style={{ marginBottom: '40px' }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <span className="text-muted font-medium">Servis Aktif</span>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent)' }}>
                            <Wrench size={24} />
                        </div>
                    </div>
                    <div className="text-h1">{metrics.activeServices}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>Sedang dikerjakan/Menunggu part</div>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <span className="text-muted font-medium">Siap Ambil</span>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="text-h1">{metrics.readyToPickup}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>Sudah selesai diservis</div>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <span className="text-muted font-medium">Total Piutang</span>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger)' }}>
                            <Wallet size={24} />
                        </div>
                    </div>
                    <div className="text-h1" style={{ color: 'var(--danger)' }}>
                        Rp {metrics.totalDebt.toLocaleString('id-ID')}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>Hutang belum dibayar</div>
                </div>
            </div>

            {/* Priority Queue */}
            <div>
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <h2 className="text-h2">Antrean Prioritas</h2>
                    <span className="badge badge-warning" style={{ display: 'flex', gap: '4px' }}>
                        <Clock size={14} /> Mendekati Deadline
                    </span>
                </div>

                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <tr>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>Nota</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>Pelanggan & HP</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>Keluhan</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>Status</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border-color)' }}>Tenggat Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priorityQueue.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: idx !== priorityQueue.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{item.id}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.customer}</div>
                                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>{item.device}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{item.issue}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${item.status === 'Menunggu Sparepart' ? 'badge-warning' : 'badge-info'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: item.is_urgent ? 'var(--danger)' : 'var(--text-main)', fontWeight: item.is_urgent ? '600' : '400' }}>
                                            {item.is_urgent && <AlertCircle size={16} />}
                                            {item.deadline}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {priorityQueue.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Tidak ada antrean prioritas saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
