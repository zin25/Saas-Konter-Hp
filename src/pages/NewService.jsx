import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save, User, Smartphone, DollarSign } from 'lucide-react';
import { db } from '../utils/db';

export default function NewService() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        waNumber: '',
        customerName: '',
        device: '',
        pin: '',
        issue: '',
        cost: '',
        deadlineDate: '',
        deadlineTime: ''
    });

    const [isSaved, setIsSaved] = useState(false);
    const [ticketId, setTicketId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-fill logic mock
        if (name === 'waNumber' && value === '08123456789') {
            setFormData(prev => ({ ...prev, customerName: 'Budi (Pelanggan Lama)' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.waNumber || !formData.customerName || !formData.device || !formData.issue || !formData.cost || !formData.deadlineDate) {
            alert('Mohon lengkapi semua data pelanggan dan servis yang wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        const newTicketId = `SRV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // Save to Database
        const success = await db.addService({
            id: newTicketId,
            customer: `${formData.customerName} (${formData.waNumber})`,
            phone: formData.waNumber,
            device: formData.device,
            issue: formData.issue,
            cost: parseInt(formData.cost),
            deadline: `${formData.deadlineDate} ${formData.deadlineTime}`,
            status: 'Dikerjakan',
            is_urgent: false
        });

        setIsSubmitting(false);

        if (success) {
            setTicketId(newTicketId);
            setIsSaved(true);
        } else {
            alert('Gagal menyimpan ke Database Cloud. Silakan periksa koneksi atau kredensial Supabase Anda.');
        }
    };

    const sendWhatsApp = () => {
        const text = `Halo Kak ${formData.customerName}, HP ${formData.device} dengan nota ${ticketId} telah kami terima untuk servis keluhan: ${formData.issue}. Estimasi biaya: Rp ${parseInt(formData.cost).toLocaleString('id-ID')}. Kami akan infokan jika sudah selesai. Terima kasih!`;
        const url = `https://wa.me/${formData.waNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        navigate('/services');
    };

    if (isSaved) {
        return (
            <div className="animate-fade-in flex-center" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel text-center" style={{ maxWidth: '500px', width: '100%' }}>
                    <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.2)', color: 'var(--primary)', marginBottom: '24px' }}>
                        <Save size={48} />
                    </div>
                    <h2 className="text-h2" style={{ marginBottom: '8px' }}>Tiket Dibuat: {ticketId}</h2>
                    <p className="text-muted" style={{ marginBottom: '32px' }}>Data servis telah berhasil disimpan ke database.</p>

                    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                        <button className="btn btn-primary btn-block" style={{ padding: '16px', fontSize: '1.1rem' }} onClick={sendWhatsApp}>
                            <Send size={20} /> Kirim Nota via WhatsApp
                        </button>
                        <button className="btn btn-outline btn-block" onClick={() => navigate('/services')}>
                            Lewati & Ke Daftar Servis
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 className="text-h2">Penerimaan Servis Baru</h1>
                <p className="text-muted">Isi data di bawah ini untuk membuat tiket servis baru.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="glass-panel" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent)' }}>
                        <User size={20} />
                        <h3 className="text-h3" style={{ color: 'var(--text-main)' }}>1. Data Pelanggan</h3>
                    </div>
                    <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Nomor WhatsApp</label>
                            <input type="text" name="waNumber" value={formData.waNumber} onChange={handleChange} placeholder="08..." className="form-input" required autoFocus />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nama Pelanggan (Otomatis/Baru)</label>
                            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Nama Lengkap" className="form-input" required />
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                        <Smartphone size={20} />
                        <h3 className="text-h3" style={{ color: 'var(--text-main)' }}>2. Data Perangkat & Keluhan</h3>
                    </div>
                    <div className="grid-cards" style={{ gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Merek & Tipe HP</label>
                            <input type="text" name="device" value={formData.device} onChange={handleChange} placeholder="Misal: Samsung A51" className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pola / PIN Layar</label>
                            <input type="text" name="pin" value={formData.pin} onChange={handleChange} placeholder="Kosongkan jika tidak ada" className="form-input" />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">Keluhan / Kerusakan</label>
                        <textarea name="issue" value={formData.issue} onChange={handleChange} placeholder="Jelaskan detail keluhan..." className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} required></textarea>
                    </div>
                </div>

                <div className="glass-panel" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--warning)' }}>
                        <DollarSign size={20} />
                        <h3 className="text-h3" style={{ color: 'var(--text-main)' }}>3. Biaya & Tenggat Waktu</h3>
                    </div>
                    <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Estimasi Biaya (Rp)</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="0" className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tanggal Selesai</label>
                            <input type="date" name="deadlineDate" value={formData.deadlineDate} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Jam Selesai</label>
                            <input type="time" name="deadlineTime" value={formData.deadlineTime} onChange={handleChange} className="form-input" required />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Batal</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                Menyimpan...
                            </span>
                        ) : (
                            <span>Simpan & Buat Nota</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
