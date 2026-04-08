import { useState, useEffect, useRef } from 'react';
import './index.css';
import * as api from './api';

// ── TOAST ──────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// ── LOGIN ──────────────────────────────────────
function Login({ onLogin }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try { const r = await api.login(u, p); localStorage.setItem('token', r.data.token); onLogin(); }
    catch { setErr('Нэр эсвэл нууц үг буруу байна'); }
    finally { setLoading(false); }
  };
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">Steppeway Admin</div>
        <div className="login-sub">Steppeway — Удирдлагын систем</div>
        {err && <div className="login-error">{err}</div>}
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="form-group"><label>Нэвтрэх нэр</label><input value={u} onChange={e=>setU(e.target.value)} placeholder="admin" required /></div>
          <div className="form-group"><label>Нууц үг</label><input type="password" value={p} onChange={e=>setP(e.target.value)} required /></div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
            {loading ? 'Нэвтэрж байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── HERO EDITOR ────────────────────────────────
function HeroEditor({ showToast }) {
  const [data, setData] = useState(null); const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  useEffect(() => { api.getHero().then(r => setData(r.data)); }, []);
  const save = async () => { setSaving(true); try { await api.updateHero(data); showToast('Хадгалагдлаа', 'success'); } catch { showToast('Алдаа гарлаа', 'error'); } finally { setSaving(false); } };
  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const r = await api.uploadHeroMedia(file); setData(d => ({...d, media_url: r.data.url, media_type: r.data.type})); showToast('Зураг/бичлэг оруулагдлаа', 'success'); }
    catch { showToast('Upload алдаа', 'error'); } finally { setUploading(false); }
  };
  if (!data) return <div className="loading"><div className="spinner" /></div>;
  return (
    <div>
      <div className="page-header"><div className="page-title">Hero Хэсэг</div><div className="page-sub">Нүүр хуудасны зураг/бичлэг болон текст</div></div>
      <div className="card">
        <div className="card-title">🖼 Зураг / Бичлэг</div>
        <div className="upload-area">
          <input type="file" accept="image/*,video/*" onChange={upload} ref={fileRef} />
          <div className="upload-icon">{uploading ? '⏳' : '📁'}</div>
          <div className="upload-text">{uploading ? 'Оруулж байна...' : 'Зураг эсвэл бичлэг оруулах (дарах эсвэл drag & drop)'}</div>
        </div>
        {data.media_url && (
          data.media_type === 'video'
            ? <video src={api.getImgUrl(data.media_url)} className="preview-video" controls />
            : <img src={api.getImgUrl(data.media_url)} className="preview" alt="hero preview" />
        )}
      </div>
      <div className="card">
        <div className="card-title">✍️ Текст</div>
        <div className="form-grid">
          <div className="form-group"><label>Гарчиг (Монгол)</label><input value={data.title_mn||''} onChange={e=>setData(d=>({...d,title_mn:e.target.value}))} /></div>
          <div className="form-group"><label>Title (English)</label><input value={data.title_en||''} onChange={e=>setData(d=>({...d,title_en:e.target.value}))} /></div>
          <div className="form-group"><label>Дэд гарчиг (Монгол)</label><input value={data.subtitle_mn||''} onChange={e=>setData(d=>({...d,subtitle_mn:e.target.value}))} /></div>
          <div className="form-group"><label>Subtitle (English)</label><input value={data.subtitle_en||''} onChange={e=>setData(d=>({...d,subtitle_en:e.target.value}))} /></div>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Хадгалж байна...':'💾 Хадгалах'}</button></div>
      </div>
    </div>
  );
}

// ── ABOUT EDITOR ───────────────────────────────
function AboutEditor({ showToast }) {
  const [data, setData] = useState(null); const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  useEffect(() => { api.getAbout().then(r => setData(r.data)); }, []);
  const save = async () => { setSaving(true); try { await api.updateAbout(data); showToast('Хадгалагдлаа', 'success'); } catch { showToast('Алдаа', 'error'); } finally { setSaving(false); } };
  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setUploading(true);
    try { const r = await api.uploadAboutImg(file); setData(d => ({...d, image_url: r.data.url})); showToast('Зураг оруулагдлаа', 'success'); }
    catch { showToast('Upload алдаа', 'error'); } finally { setUploading(false); }
  };
  if (!data) return <div style={{padding:'2rem',color:'var(--muted)'}}>Ачааллаж байна...</div>;
  return (
    <div>
      <div className="page-header"><div className="page-title">Бидний тухай</div><div className="page-sub">About хэсгийн мэдээлэл</div></div>
      <div className="card">
        <div className="card-title">🖼 Зураг</div>
        <div className="upload-area"><input type="file" accept="image/*" onChange={upload} /><div className="upload-icon">{uploading?'⏳':'📷'}</div><div className="upload-text">{uploading?'Оруулж байна...':'Зураг сонгох'}</div></div>
        {data.image_url && <img src={api.getImgUrl(data.image_url)} className="preview" alt="" />}
      </div>
      <div className="card">
        <div className="card-title">✍️ Текст</div>
        <div className="form-grid">
          <div className="form-group"><label>Гарчиг (МН)</label><input value={data.title_mn||''} onChange={e=>setData(d=>({...d,title_mn:e.target.value}))} /></div>
          <div className="form-group"><label>Title (EN)</label><input value={data.title_en||''} onChange={e=>setData(d=>({...d,title_en:e.target.value}))} /></div>
          <div className="form-group full"><label>Тайлбар (МН)</label><textarea value={data.content_mn||''} onChange={e=>setData(d=>({...d,content_mn:e.target.value}))} /></div>
          <div className="form-group full"><label>Content (EN)</label><textarea value={data.content_en||''} onChange={e=>setData(d=>({...d,content_en:e.target.value}))} /></div>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Хадгалж байна...':'💾 Хадгалах'}</button></div>
      </div>
    </div>
  );
}

// ── TOURS EDITOR ───────────────────────────────
function ToursEditor({ showToast }) {
  const [tours, setTours] = useState([]); const [editing, setEditing] = useState(null); const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  const empty = { title_mn:'', title_en:'', description_mn:'', description_en:'', price:'', duration_mn:'', duration_en:'', is_active:1 };
  const load = () => api.getTours().then(r => setTours(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) await api.updateTour(editing.id, editing);
      else await api.createTour(editing);
      showToast('Хадгалагдлаа', 'success'); setEditing(null); load();
    } catch { showToast('Алдаа', 'error'); } finally { setSaving(false); }
  };
  const del = async (id) => { if (!confirm('Устгах уу?')) return; await api.deleteTour(id); load(); showToast('Устгагдлаа', 'success'); };
  const uploadImg = async (e, id) => {
    const file = e.target.files[0]; if (!file) return; setUploading(id);
    try { await api.uploadTourImg(id, file); load(); showToast('Зураг оруулагдлаа', 'success'); }
    catch { showToast('Upload алдаа', 'error'); } finally { setUploading(false); }
  };
  return (
    <div>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><div className="page-title">Аяллууд</div><div className="page-sub">Аялалуудыг удирдах</div></div>
        <button className="btn btn-primary" onClick={() => setEditing({...empty})}>+ Шинэ аялал</button>
      </div>

      {editing && (
        <div className="card">
          <div className="card-title">{editing.id ? '✏️ Засах' : '➕ Шинэ аялал'}</div>
          <div className="form-grid">
            <div className="form-group"><label>Гарчиг (МН)</label><input value={editing.title_mn} onChange={e=>setEditing(d=>({...d,title_mn:e.target.value}))} /></div>
            <div className="form-group"><label>Title (EN)</label><input value={editing.title_en} onChange={e=>setEditing(d=>({...d,title_en:e.target.value}))} /></div>
            <div className="form-group full"><label>Тайлбар (МН)</label><textarea value={editing.description_mn} onChange={e=>setEditing(d=>({...d,description_mn:e.target.value}))} /></div>
            <div className="form-group full"><label>Description (EN)</label><textarea value={editing.description_en} onChange={e=>setEditing(d=>({...d,description_en:e.target.value}))} /></div>
            <div className="form-group"><label>Үнэ (жишээ: $450)</label><input value={editing.price} onChange={e=>setEditing(d=>({...d,price:e.target.value}))} /></div>
            <div className="form-group"><label>Хугацаа (МН)</label><input value={editing.duration_mn} onChange={e=>setEditing(d=>({...d,duration_mn:e.target.value}))} placeholder="5 хоног" /></div>
            <div className="form-group"><label>Duration (EN)</label><input value={editing.duration_en} onChange={e=>setEditing(d=>({...d,duration_en:e.target.value}))} placeholder="5 Days" /></div>
            <div className="form-group"><label>Идэвхтэй эсэх</label>
              <select value={editing.is_active} onChange={e=>setEditing(d=>({...d,is_active:Number(e.target.value)}))}>
                <option value={1}>Идэвхтэй</option><option value={0}>Идэвхгүй</option>
              </select>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Хадгалж байна...':'💾 Хадгалах'}</button>
            <button className="btn btn-secondary" onClick={()=>setEditing(null)}>Болих</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">📋 Аяллын жагсаалт ({tours.length})</div>
        <div className="tours-list">
          {tours.map(tour => (
            <div className="tour-row" key={tour.id}>
              <div className="tour-row-img">
                {tour.image_url ? <img src={api.getImgUrl(tour.image_url)} style={{width:'100%',height:'100%',borderRadius:'8px',objectFit:'cover'}} alt="" /> : '🌄'}
              </div>
              <div className="tour-row-info">
                <div className="tour-row-title">{tour.title_mn} / {tour.title_en}</div>
                <div className="tour-row-meta">{tour.price} · {tour.duration_mn} · <span className={`badge badge-${tour.is_active?'active':'inactive'}`}>{tour.is_active?'Идэвхтэй':'Идэвхгүй'}</span></div>
              </div>
              <div className="tour-row-actions">
                <label className="btn btn-secondary btn-sm" style={{cursor:'pointer'}}>
                  {uploading===tour.id?'⏳':'🖼'}
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>uploadImg(e,tour.id)} />
                </label>
                <button className="btn btn-secondary btn-sm" onClick={()=>setEditing({...tour})}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={()=>del(tour.id)}>🗑</button>
              </div>
            </div>
          ))}
          {!tours.length && <div style={{color:'var(--muted)',textAlign:'center',padding:'2rem'}}>Аялал байхгүй байна</div>}
        </div>
      </div>
    </div>
  );
}

// ── CONTACT EDITOR ─────────────────────────────
function ContactEditor({ showToast }) {
  const [data, setData] = useState(null); const [saving, setSaving] = useState(false); const [msgs, setMsgs] = useState([]);
  useEffect(() => { api.getContact().then(r=>setData(r.data)); api.getMessages().then(r=>setMsgs(r.data)); }, []);
  const save = async () => { setSaving(true); try { await api.updateContact(data); showToast('Хадгалагдлаа','success'); } catch { showToast('Алдаа','error'); } finally { setSaving(false); } };
  if (!data) return <div style={{padding:'2rem',color:'var(--muted)'}}>Ачааллаж байна...</div>;
  return (
    <div>
      <div className="page-header"><div className="page-title">Холбоо барих</div><div className="page-sub">Холбоо барих мэдээлэл</div></div>
      <div className="card">
        <div className="card-title">📞 Мэдээлэл</div>
        <div className="form-grid">
          <div className="form-group"><label>Утас</label><input value={data.phone||''} onChange={e=>setData(d=>({...d,phone:e.target.value}))} /></div>
          <div className="form-group"><label>Имэйл</label><input value={data.email||''} onChange={e=>setData(d=>({...d,email:e.target.value}))} /></div>
          <div className="form-group"><label>Хаяг (МН)</label><input value={data.address_mn||''} onChange={e=>setData(d=>({...d,address_mn:e.target.value}))} /></div>
          <div className="form-group"><label>Address (EN)</label><input value={data.address_en||''} onChange={e=>setData(d=>({...d,address_en:e.target.value}))} /></div>
          <div className="form-group"><label>Facebook URL</label><input value={data.facebook||''} onChange={e=>setData(d=>({...d,facebook:e.target.value}))} /></div>
          <div className="form-group"><label>Instagram URL</label><input value={data.instagram||''} onChange={e=>setData(d=>({...d,instagram:e.target.value}))} /></div>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Хадгалж байна...':'💾 Хадгалах'}</button></div>
      </div>
      <div className="card">
        <div className="card-title">💬 Мессежүүд ({msgs.length})</div>
        <div className="msg-list">
          {msgs.map(m => (
            <div className="msg-item" key={m.id}>
              <div className="msg-header"><div className="msg-name">{m.name}</div><div className="msg-date">{new Date(m.created_at).toLocaleDateString('mn-MN')}</div></div>
              <div className="msg-text">{m.message}</div>
              <div className="msg-contact">{m.email} {m.phone && `· ${m.phone}`}</div>
            </div>
          ))}
          {!msgs.length && <div style={{color:'var(--muted)',textAlign:'center',padding:'1.5rem'}}>Мессеж байхгүй</div>}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────
function Dashboard() {
  const [tours, setTours] = useState([]); const [msgs, setMsgs] = useState([]);
  useEffect(() => { api.getTours().then(r=>setTours(r.data)).catch(()=>{}); api.getMessages().then(r=>setMsgs(r.data)).catch(()=>{}); }, []);
  return (
    <div>
      <div className="page-header"><div className="page-title">Хяналтын самбар</div><div className="page-sub">Тавтай морил! Системийн товч мэдээлэл.</div></div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon">🗺</div><div><div className="stat-val">{tours.length}</div><div className="stat-label">Нийт аялал</div></div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div><div className="stat-val">{tours.filter(t=>t.is_active).length}</div><div className="stat-label">Идэвхтэй</div></div></div>
        <div className="stat-card"><div className="stat-icon">💬</div><div><div className="stat-val">{msgs.length}</div><div className="stat-label">Мессеж</div></div></div>
      </div>
      <div className="card">
        <div className="card-title">🚀 Хурдан холбоос</div>
        <div style={{color:'var(--muted)',fontSize:'0.9rem',lineHeight:'1.8'}}>
          <p>← Зүүн цэснээс хэсэг бүрийг засварлана уу</p>
          <p>🖼 <b>Hero</b> — Нүүр хуудасны зураг/бичлэг, гарчиг солих</p>
          <p>ℹ️ <b>Бидний тухай</b> — Компанийн мэдээлэл</p>
          <p>🗺 <b>Аяллууд</b> — Аялал нэмэх, засах, устгах</p>
          <p>📞 <b>Холбоо барих</b> — Утас, имэйл, мессеж харах</p>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => { setToast({msg,type}); };
  const logout = () => { localStorage.removeItem('token'); setAuthed(false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const nav = [
    { id:'dashboard', icon:'🏠', label:'Хяналт' },
    { id:'hero', icon:'🖼', label:'Hero хэсэг' },
    { id:'about', icon:'ℹ️', label:'Бидний тухай' },
    { id:'tours', icon:'🗺', label:'Аяллууд' },
    { id:'contact', icon:'📞', label:'Холбоо барих' },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>Steppeway</span>
          <small>Удирдлагын систем</small>
        </div>
        {nav.map(n => (
          <div key={n.id} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
            <span className="icon">{n.icon}</span>{n.label}
          </div>
        ))}
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={logout}>🚪 Гарах</button>
        </div>
      </aside>
      <main className="main">
        {page==='dashboard' && <Dashboard />}
        {page==='hero' && <HeroEditor showToast={showToast} />}
        {page==='about' && <AboutEditor showToast={showToast} />}
        {page==='tours' && <ToursEditor showToast={showToast} />}
        {page==='contact' && <ContactEditor showToast={showToast} />}
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
    </div>
  );
}
