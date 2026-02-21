import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Wrench, Users, LogOut } from 'lucide-react';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Servis Baru', path: '/new-service', icon: PlusCircle },
        { name: 'Daftar Servis', path: '/services', icon: Wrench },
        { name: 'Pelanggan', path: '/customers', icon: Users },
    ];

    return (
        <div className="app-container" style={{ flexDirection: 'row' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px'
            }}>
                <div style={{ marginBottom: '40px', padding: '0 12px' }}>
                    <h2 className="text-h2" style={{ color: 'var(--primary)' }}>SaaS Konter</h2>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>Manajemen Servis HP</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                                    backgroundColor: isActive ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                    fontWeight: isActive ? '600' : '400',
                                    transition: 'var(--transition)'
                                }}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <Link to="/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        color: 'var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        transition: 'var(--transition)'
                    }}>
                        <LogOut size={20} />
                        <span>Keluar</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
                <div className="main-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
