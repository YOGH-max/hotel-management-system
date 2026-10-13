import { useEffect, useMemo, useState } from 'react';
import { BedDouble, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardList, Hotel, LayoutDashboard, Plus, Search, Users, XCircle, RefreshCw, ArrowUpRight } from 'lucide-react';

const API = 'http://localhost:8080/api';
const today = () => new Date().toLocaleDateString('en-CA');
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guestName: '', email: '', phone: '', roomId: '', checkIn: today(), checkOut: '' });

  async function loadData() {
    setLoading(true); setError('');
    try {
      const [r, b] = await Promise.all([fetch(`${API}/rooms`), fetch(`${API}/bookings`)]);
      if (!r.ok || !b.ok) throw new Error('The server returned an error. Check that the backend is running.');
      setRooms(await r.json()); setBookings(await b.json());
    } catch (e) { setError('Cannot connect to the backend. Start the Spring Boot server on port 8080, then refresh.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const revenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const filteredBookings = useMemo(() => bookings.filter(b => {
    const text = `${b.guestName} ${b.email} ${b.roomNumber} ${b.id}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === 'ALL' || b.status === statusFilter);
  }), [bookings, query, statusFilter]);

  function updateForm(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  async function submitBooking(e) {
    e.preventDefault(); setError(''); setNotice('');
    try {
      const response = await fetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, roomId: Number(form.roomId) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not create booking.');
      setNotice(`Booking #${data.id} confirmed for ${data.guestName}. Total: ${money(data.totalAmount)}.`);
      setForm({ guestName: '', email: '', phone: '', roomId: '', checkIn: today(), checkOut: '' }); setShowForm(false); await loadData();
    } catch (e) { setError(e.message || 'Booking failed. Please try again.'); }
  }
  async function cancelBooking(id) {
    if (!window.confirm(`Cancel booking #${id}?`)) return;
    setError(''); setNotice('');
    try { const response = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' }); if (!response.ok) throw new Error('Could not cancel this booking.'); setNotice(`Booking #${id} cancelled.`); await loadData(); }
    catch (e) { setError(e.message); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Hotel size={22}/></div><div><strong>staywise</strong><span>HOTEL MANAGEMENT</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <div className="nav-item active"><LayoutDashboard size={18}/> Overview</div>
      <div className="nav-item" onClick={() => { setShowForm(true); document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth' }); }}><CalendarDays size={18}/> Reservations</div>
      <div className="nav-item" onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}><BedDouble size={18}/> Rooms</div>
      <div className="nav-item" onClick={() => document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth' })}><ClipboardList size={18}/> Guest records</div>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-orb">✦</div><strong>Stay organized</strong><p>Manage stays, guests and room revenue from one place.</p></div><div className="user-profile"><div className="avatar">SM</div><div><strong>Staywise Manager</strong><span>Administrator</span></div><span className="online-dot"/></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="live-dot"/> System overview <div className="top-avatar">SM</div></div></header>
      <section className="page-heading"><div><div className="eyebrow">MONDAY — YOUR FRONT DESK, SIMPLIFIED</div><h1>Good day, Manager <span>✦</span></h1><p>Here’s what’s happening at your property today.</p></div><button className="primary-button" onClick={() => { setShowForm(v => !v); setError(''); }}><Plus size={17}/> New reservation</button></section>
      {error && <div className="alert error"><XCircle size={18}/><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><XCircle size={16}/></button></div>}
      {notice && <div className="alert success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><XCircle size={16}/></button></div>}

      <section className="stats-grid">
        <StatCard label="TOTAL ROOMS" value={rooms.length} hint="Across all room types" icon={<BedDouble/>} tone="blue"/>
        <StatCard label="ACTIVE BOOKINGS" value={activeBookings.length} hint="Confirmed reservations" icon={<CalendarDays/>} tone="purple"/>
        <StatCard label="GUESTS BOOKED" value={new Set(activeBookings.map(b => b.email)).size} hint="Unique guest emails" icon={<Users/>} tone="orange"/>
        <StatCard label="BOOKED REVENUE" value={money(revenue)} hint="Confirmed booking value" icon={<CircleDollarSign/>} tone="green"/>
      </section>

      {showForm && <section className="panel booking-panel" id="new-booking"><div className="panel-header"><div><div className="eyebrow">FRONT DESK</div><h2>Create a reservation</h2><p>Enter guest details and stay dates to calculate the bill.</p></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close form"><XCircle size={19}/></button></div>
        <form onSubmit={submitBooking} className="booking-form">
          <label>Guest full name<input required minLength="2" value={form.guestName} onChange={e => updateForm('guestName', e.target.value)} placeholder="e.g. Priya Sharma"/></label>
          <label>Email address<input required type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="guest@example.com"/></label>
          <label>Phone number <span className="optional">OPTIONAL</span><input value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+91 98765 43210"/></label>
          <label>Room<select required value={form.roomId} onChange={e => updateForm('roomId', e.target.value)}><option value="">Choose a room</option>{rooms.map(room => <option key={room.id} value={room.id}>Room {room.roomNumber} · {room.type} · {money(room.pricePerNight)}/night</option>)}</select></label>
          <label>Check-in<input required type="date" min={today()} value={form.checkIn} onChange={e => { updateForm('checkIn', e.target.value); if (form.checkOut && form.checkOut <= e.target.value) updateForm('checkOut', ''); }}/></label>
          <label>Check-out<input required type="date" min={form.checkIn || today()} value={form.checkOut} onChange={e => updateForm('checkOut', e.target.value)}/></label>
          <div className="form-footer"><span>Room availability is validated when you confirm.</span><button className="primary-button" type="submit"><CheckCircle2 size={17}/> Confirm booking</button></div>
        </form>
      </section>}

      <section className="panel rooms-panel" id="rooms"><div className="panel-header"><div><div className="eyebrow">YOUR PROPERTY</div><h2>Rooms & rates</h2><p>Browse the room types available in your property.</p></div><span className="count-pill">{rooms.length} room types</span></div>
        {loading ? <div className="loading"><RefreshCw className="spin" size={20}/> Loading rooms…</div> : <div className="rooms-grid">{rooms.map((room, index) => <div className="room-card" key={room.id}><div className={`room-art art-${index % 4}`}><div className="room-art-top"><span className="room-tag">ROOM {room.roomNumber}</span><span className="room-art-icon"><BedDouble size={21}/></span></div><div className="room-illustration"><div className="window"/><div className="bed"><div className="pillow"/><div className="blanket"/></div><div className="nightstand"/></div></div><div className="room-info"><div className="room-title-row"><h3>{room.type}</h3><span className="capacity"><Users size={14}/>{room.capacity}</span></div><p>{room.description}</p><div className="room-price"><div><strong>{money(room.pricePerNight)}</strong><span> / night</span></div><button className="text-button" onClick={() => { setForm(prev => ({ ...prev, roomId: String(room.id), checkIn: today(), checkOut: '' })); setShowForm(true); document.getElementById('new-booking')?.scrollIntoView({ behavior: 'smooth' }); }}>Book room <ArrowUpRight size={15}/></button></div></div></div>)}</div>}
      </section>

      <section className="panel bookings-panel" id="bookings"><div className="panel-header bookings-heading"><div><div className="eyebrow">RESERVATION MANAGEMENT</div><h2>Recent bookings</h2><p>Review reservations, guest information and billing.</p></div><button className="secondary-button" onClick={loadData}><RefreshCw size={15}/> Refresh</button></div>
        <div className="table-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search guest, email or room…"/></div><select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All statuses</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option></select></div>
        <div className="table-wrap"><table><thead><tr><th>BOOKING</th><th>GUEST</th><th>ROOM</th><th>STAY DATES</th><th>TOTAL BILL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7" className="empty-state">Loading reservations…</td></tr> : filteredBookings.length === 0 ? <tr><td colSpan="7" className="empty-state"><div className="empty-icon"><ClipboardList size={22}/></div><strong>No bookings found</strong><span>Create a reservation to see it listed here.</span></td></tr> : filteredBookings.map(b => <tr key={b.id}><td><span className="booking-id">#{String(b.id).padStart(4, '0')}</span><span className="cell-sub">Reservation</span></td><td><strong>{b.guestName}</strong><span className="cell-sub">{b.email}</span></td><td><span className="room-cell">{b.roomNumber}</span><span className="cell-sub">{b.nights} night{b.nights === 1 ? '' : 's'}</span></td><td><strong>{b.checkIn}</strong><span className="cell-sub">to {b.checkOut}</span></td><td><strong>{money(b.totalAmount)}</strong><span className="cell-sub">Inclusive room charges</span></td><td><span className={`status ${b.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}><span/>{b.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}</span></td><td>{b.status === 'CONFIRMED' ? <button className="cancel-button" onClick={() => cancelBooking(b.id)}>Cancel</button> : <span className="muted-dash">—</span>}</td></tr>)}
        </tbody></table></div><div className="table-footer"><span>Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> reservations</span><span>Currency: INR (₹)</span></div>
      </section>
      <footer className="footer"><span>© 2026 Staywise Hotel Management</span><span>Built with React · Spring Boot · H2 Database</span></footer>
    </main>
  </div>;
}

function StatCard({ label, value, hint, icon, tone }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><div className="stat-value">{value}</div><div className="stat-hint"><span className="hint-dot"/>{hint}</div></div>; }
