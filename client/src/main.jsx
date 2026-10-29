import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Bookmark, CalendarDays, ExternalLink, Pencil, Trash2, LogIn, LogOut, X, BriefcaseBusiness, GraduationCap, Trophy, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import './style.css';

// Set VITE_API_URL in client/.env for a different backend host.
const API = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');
const TOKEN_KEY = 'opportunity-hub-token';
const TYPES = ['All types', 'Scholarship', 'Internship', 'Hackathon', 'Competition', 'Fellowship', 'Workshop', 'Course', 'Other'];
const STATUSES = ['Interested', 'Planning', 'InProgress', 'Applied', 'Accepted', 'Rejected', 'Withdrawn'];
const emptyForm = { title: '', type: 'Internship', organization: '', summary: '', applicationUrl: '', sourceUrl: '', deadlineAt: '', eligibilityText: '' };
async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || `Request failed (${response.status})`);
  return payload;
}

function dateLabel(value) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not specified' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function statusLabel(value) { return value === 'InProgress' ? 'In progress' : value || 'Interested'; }

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All types');
  const [page, setPage] = useState('Discover');
  const [user, setUser] = useState(null);
  const [tracking, setTracking] = useState({});
  const [detail, setDetail] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ displayName: '', email: '', password: '' });
  const [adminItems, setAdminItems] = useState([]);
  const [adminForm, setAdminForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function loadOpportunities() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '50', sort: 'deadline' });
      if (query.trim()) params.set('q', query.trim());
      if (type !== 'All types') params.set('type', type);
      const result = await api(`/opportunities?${params.toString()}`);
      const items = result.data || [];
      setOpportunities(items);
    } catch (e) {
      setOpportunities([]);
      setError(`Could not load opportunities from the backend: ${e.message}`);
    } finally { setLoading(false); }
  }

  async function loadTracking() {
    if (!localStorage.getItem(TOKEN_KEY)) { setTracking({}); return; }
    try {
      const result = await api('/me/tracking');
      const next = {};
      for (const record of result.data || []) {
        const opportunity = record.opportunityId;
        if (opportunity?._id) next[opportunity._id] = { ...record, opportunity, checklist: record.checklist instanceof Map ? Object.fromEntries(record.checklist) : (record.checklist || {}) };
      }
      setTracking(next);
    } catch (e) { setTracking({}); }
  }

  async function loadAdminItems() {
    try {
      const result = await api('/opportunities/admin/all');
      setAdminItems(result.data || []);
    } catch (e) { setError(e.message); }
  }

  async function syncOnlineFeed() {
    if (syncing) return;
    setSyncing(true);
    setError('');
    try {
      const result = await api('/opportunities/sync', { method: 'POST', body: JSON.stringify({}) });
      const report = result.data || {};
      const sourceFailures = (report.failures || []).map(item => `${item.source}: ${item.message}`).join(' · ');
      const optionalNotes = (report.sources || []).filter(item => item.note).map(item => `${item.name}: ${item.note}`).join(' · ');
      let message = `Online sync finished: ${report.imported || 0} new, ${report.updated || 0} updated, ${report.total || 0} total opportunities.`;
      if (sourceFailures) message += ` Some sources were unavailable: ${sourceFailures}`;
      else if (optionalNotes) message += ` ${optionalNotes}`;
      setNotice(message);
      await Promise.all([loadAdminItems(), loadOpportunities()]);
    } catch (e) {
      setError(`Could not sync online opportunities: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    loadOpportunities();
    if (savedToken) {
      api('/auth/me').then(result => setUser(result.user)).catch(() => localStorage.removeItem(TOKEN_KEY));
    }
  // Fetch search and type filters from the server.
  }, [query, type]);

  useEffect(() => {
    if (user?.role === 'student') {
      loadTracking();
    } else {
      setTracking({});
    }
    if (user?.role === 'admin') loadAdminItems();
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'student' && (page === 'Saved' || page === 'Applications')) setPage('Discover');
  }, [user, page]);

  const filtered = useMemo(() => opportunities.filter(item => {
    const matchesType = type === 'All types' || item.type === type;
    const text = `${item.title} ${item.organization} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase();
    return matchesType && text.includes(query.trim().toLowerCase());
  }), [opportunities, query, type]);

  const visibleItems = useMemo(() => {
    if (page === 'Saved') return filtered.filter(item => tracking[item._id]?.isSaved);
    if (page === 'Applications') return filtered.filter(item => tracking[item._id]?.hasApplied === true);
    return filtered;
  }, [filtered, page, tracking]);

  function requireLogin() {
    setAuthMode('login');
    setAuthOpen(true);
    setNotice('Sign in to save opportunities and track applications.');
  }

  async function submitAuth(event) {
    event.preventDefault();
    setError('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const body = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : { displayName: authForm.displayName, email: authForm.email, password: authForm.password };
      const result = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      setAuthOpen(false);
      setAuthForm({ displayName: '', email: '', password: '' });
      setNotice(authMode === 'login' ? 'Signed in successfully.' : 'Account created successfully.');
    } catch (e) { setError(e.message); }
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setTracking({});
    setPage('Discover');
    setNotice('You have signed out.');
  }

  async function updateTracking(opportunity, updates) {
    if (!user) return requireLogin();
    if (user.role !== 'student') { setNotice('Only student accounts can save opportunities or track applications.'); return; }
    const old = tracking[opportunity._id] || { isSaved: false, hasApplied: false, status: null, checklist: {} };
    setTracking(previous => ({ ...previous, [opportunity._id]: { ...old, ...updates, opportunity } }));
    try {
      await api(`/me/tracking/${opportunity._id}`, { method: 'PUT', body: JSON.stringify(updates) });
      await loadTracking();
      setNotice('Your changes have been saved.');
    } catch (e) {
      setError(e.message);
      await loadTracking();
    }
  }

  function handleApplyClick(event, opportunity) {
    if (!user) { event.preventDefault(); requireLogin(); return; }
    if (user.role !== 'student') return;
    const record = tracking[opportunity._id] || {};
    const status = record.hasApplied ? (record.status || 'Applied') : 'Applied';
    void updateTracking(opportunity, { hasApplied: true, status });
  }

  function beginEdit(item) {
    setEditingId(item._id);
    setAdminForm({
      title: item.title || '', type: item.type || 'Internship', organization: item.organization || '', summary: item.summary || '',
      applicationUrl: item.applicationUrl || '', sourceUrl: item.sourceUrl || '',
      deadlineAt: item.deadlineAt ? new Date(item.deadlineAt).toISOString().slice(0, 16) : '',
      eligibilityText: (item.eligibilityCriteria || []).map(c => c.label).join('\n')
    });
    setAdminFormOpen(true);
  }
  async function submitOpportunity(event) {
    event.preventDefault();
    setError('');
    const criteria = adminForm.eligibilityText.split('\n').map(v => v.trim()).filter(Boolean).map((label, index) => ({ criterionId: `criterion-${index + 1}`, label, importance: 'Required' }));
    const payload = {
      title: adminForm.title.trim(), type: adminForm.type, organization: adminForm.organization.trim(), summary: adminForm.summary.trim(),
      applicationUrl: adminForm.applicationUrl.trim(), sourceUrl: adminForm.sourceUrl.trim(),
      deadlineAt: adminForm.deadlineAt ? new Date(adminForm.deadlineAt).toISOString() : null,
      deadlineState: adminForm.deadlineAt ? 'Known' : 'NotSpecified', eligibilityCriteria: criteria,
      tags: [], targetEducationLevels: [], mode: 'Any', status: 'Published'
    };
    try {
      if (!editingId) throw new Error('Select an imported opportunity to edit.');
      await api(`/opportunities/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setAdminFormOpen(false);
      setNotice('Opportunity updated. A future source sync may refresh fields from the original listing.');
      await loadAdminItems();
      await loadOpportunities();
    } catch (e) { setError(e.message); }
  }
  async function deleteOpportunity(item) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await api(`/opportunities/${item._id}`, { method: 'DELETE' });
      setNotice('Opportunity deleted.');
      await loadAdminItems();
      await loadOpportunities();
    } catch (e) { setError(e.message); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setPage('Discover')} aria-label="Opportunity Hub home"><span className="brand-mark"><GraduationCap size={22} /></span><span>Opportunity Hub<small>STUDENT OPPORTUNITIES</small></span></button>
      <nav className="nav-links" aria-label="Main navigation">
        <button className={page === 'Discover' ? 'active' : ''} onClick={() => setPage('Discover')}>Discover</button>
        {user?.role === 'student' && <button className={page === 'Saved' ? 'active' : ''} onClick={() => setPage('Saved')}>Saved ({Object.values(tracking).filter(t => t.isSaved).length})</button>}
        {user?.role === 'student' && <button className={page === 'Applications' ? 'active' : ''} onClick={() => setPage('Applications')}>Applications</button>}
        {user?.role === 'admin' && <button className={page === 'Manage' ? 'active' : ''} onClick={() => setPage('Manage')}>Manage listings</button>}
      </nav>
      <div className="account-area">{user ? <><span className="user-name">{user.displayName || user.email}</span><button className="outline-button" onClick={signOut}><LogOut size={15} /> Sign out</button></> : <button className="solid-button" onClick={() => { setAuthMode('login'); setAuthOpen(true); }}><LogIn size={16} /> Sign in</button>}</div>
    </header>

    <main className="main-content">
      {page !== 'Manage' && <section className="hero"><div><p className="eyebrow">ONE PLACE. MORE POSSIBILITIES.</p><h1>Find your next <span>opportunity.</span></h1><p className="hero-copy">Discover internships, hackathons, and student competitions collected from online opportunity feeds.</p></div><div className="hero-graphic"><GraduationCap size={54} /><span><BriefcaseBusiness size={20} /></span><span><Trophy size={19} /></span></div></section>}

      {page === 'Manage' && user?.role === 'admin' ? <section className="manage-page">
        <div className="page-title-row"><div><p className="eyebrow">ADMIN</p><h1>Manage opportunities</h1><p className="hero-copy">Fetch current listings from online APIs. No manual entry is needed; edit or remove imported records only when necessary.</p></div><div className="admin-main-actions"><button className="solid-button" onClick={syncOnlineFeed} disabled={syncing}><RefreshCw size={16} className={syncing ? 'spin-icon' : ''} /> {syncing ? 'Syncing online feeds…' : 'Sync online opportunities'}</button></div></div>
        {error && <div className="message error-message">{error}</div>}
        <p className="feed-note">Online sources: Tech Opportunities and Himalayas for internships, Hackalendar for hackathons, and Brabble.ai for India-focused college competitions when its API key is configured.</p>
        <div className="admin-table">{adminItems.length ? adminItems.map(item => <div className="admin-row" key={item._id}><div className="admin-item-copy"><span className={`type-badge ${item.type?.toLowerCase()}`}>{item.type}</span><strong>{item.title}</strong><small>{item.organization} · {item.status}{item.sourceName ? ` · Source: ${item.sourceName}` : ''}</small></div><div className="admin-row-actions"><button className="outline-button small" onClick={() => beginEdit(item)}><Pencil size={14} /> Edit</button><button className="danger-button" onClick={() => deleteOpportunity(item)}><Trash2 size={14} /> Delete</button></div></div>) : <div className="empty-state"><p>No opportunities loaded yet.</p><button className="solid-button" onClick={syncOnlineFeed} disabled={syncing}><RefreshCw size={16} className={syncing ? 'spin-icon' : ''} /> {syncing ? 'Syncing online feeds…' : 'Fetch opportunities online'}</button></div>}</div>
      </section> : <>
        <section className="search-panel">
          <label className="search-box"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, organization, or keyword" /></label>
          <label className="type-select"><span>Category</span><select value={type} onChange={e => setType(e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
        </section>
        {error && <div className="message error-message">{error}</div>}
        <div className="section-heading"><div><h2>{page === 'Saved' ? 'Saved opportunities' : page === 'Applications' ? 'My applications' : 'Explore opportunities'}</h2><p>{page === 'Saved' ? 'Listings you want to come back to.' : page === 'Applications' ? 'Only opportunities you click Apply on appear here. Saving a listing does not add it to Applications.' : 'Browse current opportunities and check their eligibility.'}</p></div><span className="result-count">{visibleItems.length} {visibleItems.length === 1 ? 'result' : 'results'}</span></div>
        {loading ? <div className="loading-state">Loading opportunities…</div> : visibleItems.length ? <div className="opportunity-grid">{visibleItems.map(item => {
          const record = tracking[item._id] || {};
          return <article className="opportunity-card" key={item._id}>
            <div className="card-top"><span className={`type-badge ${item.type?.toLowerCase()}`}>{item.type}</span>{user?.role !== 'admin' && <button className={`save-button ${record.isSaved ? 'saved' : ''}`} title={record.isSaved ? 'Remove from saved' : 'Save opportunity'} onClick={() => updateTracking(item, { isSaved: !record.isSaved })}><Bookmark size={17} fill={record.isSaved ? 'currentColor' : 'none'} /></button>}</div>
            <h3>{item.title}</h3><p className="organization">{item.organization}</p>{item.sourceName && <p className="source-attribution">Source: {item.sourceName}</p>}<p className="card-summary">{item.summary}</p>
            <div className="card-meta"><span><CalendarDays size={15} /> Deadline: {dateLabel(item.deadlineAt)}</span>{record.hasApplied && record.status && <span className="status-chip">{statusLabel(record.status)}</span>}</div>
            {page === 'Applications' && record.hasApplied && <label className="inline-status">Application status<select value={record.status || 'Applied'} onChange={e => updateTracking(item, { status: e.target.value })}>{STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></label>}
            <div className="card-actions"><button className="text-button" onClick={() => setDetail(item)}>View details <ChevronRight size={16} /></button>{item.applicationUrl && <a href={item.applicationUrl} target="_blank" rel="noreferrer" className="apply-link" onClick={event => handleApplyClick(event, item)}>Apply <ExternalLink size={14} /></a>}</div>
          </article>;
        })}</div> : <div className="empty-state"><CheckCircle2 size={35} /><h3>{page === 'Saved' ? 'No saved opportunities yet' : page === 'Applications' ? 'Nothing being tracked yet' : 'No opportunities found'}</h3><p>{page === 'Discover' ? 'Try another search term or category.' : 'Browse opportunities and save or track the ones that interest you.'}</p><button className="outline-button" onClick={() => { setPage('Discover'); setQuery(''); setType('All types'); }}>Browse opportunities</button></div>}
      </>}
      <footer className="footer"><span>Opportunity Hub</span><span>Full Stack Web Development case study · MERN</span></footer>
    </main>

    {detail && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDetail(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="close-button" onClick={() => setDetail(null)} aria-label="Close"><X size={18} /></button><span className={`type-badge ${detail.type?.toLowerCase()}`}>{detail.type}</span><h2 id="detail-title">{detail.title}</h2><p className="organization">{detail.organization}</p><p className="detail-summary">{detail.summary}</p><div className="detail-fact"><CalendarDays size={18} /><span><small>APPLICATION DEADLINE</small><strong>{dateLabel(detail.deadlineAt)}</strong></span></div><h3>Eligibility criteria</h3>{detail.eligibilityCriteria?.length ? <div className="criteria-list">{detail.eligibilityCriteria.map((criterion, index) => <label className="criterion-row" key={criterion.criterionId || index}><span>{criterion.label}</span><select disabled={user?.role !== 'student'} value={tracking[detail._id]?.checklist?.[criterion.criterionId] || 'Not sure'} onChange={e => updateTracking(detail, { checklist: { ...(tracking[detail._id]?.checklist || {}), [criterion.criterionId]: e.target.value } })}><option>Not sure</option><option>Meets</option><option>Does not meet</option></select></label>)}</div> : <p className="muted">No eligibility criteria listed. Check the official source before applying.</p>}{user?.role === 'student' && tracking[detail._id]?.hasApplied && <div className="status-editor"><label htmlFor="application-status">Application status</label><select id="application-status" value={tracking[detail._id]?.status || 'Applied'} onChange={e => updateTracking(detail, { status: e.target.value })}>{STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></div>}<p className="eligibility-note">This checklist is for personal reference only. Confirm all requirements on the official listing.</p><div className="modal-actions">{user?.role !== 'admin' && <button className="outline-button" onClick={() => updateTracking(detail, { isSaved: !tracking[detail._id]?.isSaved })}><Bookmark size={15} /> {tracking[detail._id]?.isSaved ? 'Saved' : 'Save listing'}</button>}<a className="solid-button" href={detail.applicationUrl} target="_blank" rel="noreferrer" onClick={event => handleApplyClick(event, detail)}>Apply & track <ExternalLink size={15} /></a></div><p className="source-line">Source: <a href={detail.sourceUrl} target="_blank" rel="noreferrer">{detail.sourceName || 'View official source'} <ExternalLink size={12} /></a></p></section></div>}

    {authOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}><section className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="close-button" onClick={() => setAuthOpen(false)} aria-label="Close"><X size={18} /></button><p className="eyebrow">OPPORTUNITY HUB</p><h2 id="auth-title">{authMode === 'login' ? 'Sign in' : 'Create an account'}</h2><p className="muted">Sign in as a student to save listings and track your applications.</p><form className="form-stack" onSubmit={submitAuth}>{authMode === 'register' && <label>Name<input required value={authForm.displayName} onChange={e => setAuthForm({ ...authForm, displayName: e.target.value })} /></label>}<label>Email<input type="email" required value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} /></label><label>Password<input type="password" minLength={authMode === 'register' ? 8 : 1} required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="solid-button full-width" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'}</button></form><p className="auth-switch">{authMode === 'login' ? 'New here?' : 'Already registered?'} <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); }}> {authMode === 'login' ? 'Create an account' : 'Sign in'}</button></p></section></div>}

    {adminFormOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAdminFormOpen(false); }}><section className="modal admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-form-title"><button className="close-button" onClick={() => setAdminFormOpen(false)} aria-label="Close"><X size={18} /></button><h2 id="admin-form-title">Edit imported opportunity</h2><p className="muted">Correct listing details if needed. The next online sync may refresh fields from the original source. Separate each eligibility criterion onto a new line.</p><form className="form-stack" onSubmit={submitOpportunity}><label>Title<input required minLength={3} value={adminForm.title} onChange={e => setAdminForm({ ...adminForm, title: e.target.value })} /></label><div className="form-two"><label>Type<select value={adminForm.type} onChange={e => setAdminForm({ ...adminForm, type: e.target.value })}>{TYPES.slice(1).map(t => <option key={t}>{t}</option>)}</select></label><label>Organization<input required value={adminForm.organization} onChange={e => setAdminForm({ ...adminForm, organization: e.target.value })} /></label></div><label>Summary<textarea required minLength={10} rows={3} value={adminForm.summary} onChange={e => setAdminForm({ ...adminForm, summary: e.target.value })} /></label><label>Application URL<input required type="url" value={adminForm.applicationUrl} onChange={e => setAdminForm({ ...adminForm, applicationUrl: e.target.value })} /></label><label>Official source URL<input required type="url" value={adminForm.sourceUrl} onChange={e => setAdminForm({ ...adminForm, sourceUrl: e.target.value })} /></label><label>Deadline (optional)<input type="datetime-local" value={adminForm.deadlineAt} onChange={e => setAdminForm({ ...adminForm, deadlineAt: e.target.value })} /></label><label>Eligibility criteria<textarea rows={3} value={adminForm.eligibilityText} onChange={e => setAdminForm({ ...adminForm, eligibilityText: e.target.value })} placeholder={'Currently enrolled as a student\nMust submit a project proposal'} /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="outline-button" onClick={() => setAdminFormOpen(false)}>Cancel</button><button type="submit" className="solid-button">Save changes</button></div></form></section></div>}

    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
