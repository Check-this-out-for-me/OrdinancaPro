import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Users, Stethoscope, PlusCircle, CheckCircle2, X, Lock, Mail, ChevronRight, Download, Edit3, Save } from 'lucide-react';

const API_URL = '/api';

export default function App() {
  const today = new Date().toISOString().split('T')[0];
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ordinanca_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardDate, setDashboardDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [appointments, setAppointments] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', reason: '', therapy: '', time: '09:00', cost: '', date: today });

  // State për editim
  const [editingId, setEditingId] = useState(null);
  const [tempTherapy, setTempTherapy] = useState('');

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/data`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setAppointments(data);
        else setAppointments([]); // Fillo me regjistër bosh
      })
      .catch(err => console.error("Server offline.", err));
  }, [today]);

  useEffect(() => {
    if (appointments.length > 0) {
      fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointments)
      }).catch(err => console.error("Gabim ne ruajtje.", err));
      localStorage.setItem('ordinanca_appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail === 'hyseniyll44@gmail.com' && loginPassword === 'admin') {
      const userData = { email: loginEmail };
      setUser(userData);
      localStorage.setItem('ordinanca_user', JSON.stringify(userData));
      setLoginError(false);
    } else setLoginError(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ordinanca_user');
    setLoginEmail('');
    setLoginPassword('');
  };

  const startEditing = (patient) => {
    setEditingId(patient.id);
    setTempTherapy(patient.therapy || '');
  };

  const saveTherapy = (id) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, therapy: tempTherapy } : a));
    setEditingId(null);
  };

  const markAsCompleted = (id) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'completed' } : a));
  };

  const hideFromDashboard = (id) => {
    if (window.confirm("Hiqe nga ballina?")) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, hiddenFromDashboard: true } : a));
    }
  };

  const downloadDailyReport = () => {
    const data = appointments.filter(a => a.status === 'completed' && a.date === selectedDate);
    if (data.length === 0) return alert("Nuk ka te dhena!");
    let csv = "Pacienti,Arsyeja,Terapia,Ora,Kosto\n";
    data.forEach(a => csv += `${a.name},${a.reason},${a.therapy || ''},${a.time},${a.cost}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `raporti_${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const dailyAppointments = useMemo(() => appointments.filter(a => a.date === dashboardDate && !a.hiddenFromDashboard), [appointments, dashboardDate]);
  const reportData = useMemo(() => appointments.filter(a => a.status === 'completed' && a.date === selectedDate), [appointments, selectedDate]);
  const stats = useMemo(() => {
    const comp = appointments.filter(a => a.status === 'completed' && a.date === dashboardDate);
    const pend = appointments.filter(a => a.status === 'pending' && a.date === dashboardDate && !a.hiddenFromDashboard);
    return { rev: comp.reduce((s, a) => s + Number(a.cost), 0), comp: comp.length, pend: pend.length };
  }, [appointments, dashboardDate]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 font-sans text-slate-900">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"><Stethoscope className="text-teal-600" size={32} /></div>
            <h2 className="text-3xl font-bold">OrdinancaPro</h2>
            <p className="text-slate-500 mt-2">Mirë se erdhët përsëri</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="email" placeholder="Email" className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none ${loginError ? 'border-red-500' : 'border-slate-200'}`} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" placeholder="Password" className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none ${loginError ? 'border-red-500' : 'border-slate-200'}`} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center font-medium">Kredencialet e gabuara!</p>}
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2">Kyçu <ChevronRight size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold mb-10 flex items-center gap-2 text-teal-400"><Stethoscope /> OrdinancaPro</h1>
        <nav className="space-y-2 flex-1">
          {[{id:'dashboard', l:'Ballina', i:LayoutDashboard}, {id:'raporte', l:'Raporte', i:BarChart3}, {id:'paciente', l:'Regjistri', i:Users}].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.i size={20} /> {item.l}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 mt-10 text-red-400 hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /> Dil</button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><h2 className="text-2xl font-bold">Ballina</h2><p className="text-slate-500 text-sm">Terminët e ditës</p></div>
              <div className="flex items-center gap-3">
                <input type="date" value={dashboardDate} onChange={e => setDashboardDate(e.target.value)} className="p-2 border rounded-xl shadow-sm outline-none bg-white"/>
                <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold hover:bg-teal-700 shadow-lg active:scale-95"><PlusCircle size={20}/> Pacient i ri</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-sm text-slate-500 mb-1">Fitimi</p><h3 className="text-2xl font-bold">{stats.rev} €</h3></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-sm text-slate-500 mb-1">Pritje</p><h3 className="text-2xl font-bold text-orange-500">{stats.pend}</h3></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-sm text-slate-500 mb-1">Kryera</p><h3 className="text-2xl font-bold text-green-600">{stats.comp}</h3></div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-sm uppercase font-bold"><tr className="border-b"><th className="p-4">Pacienti</th><th className="p-4">Diagnoza</th><th className="p-4 text-center">Ora</th><th className="p-4 text-right">Veprime</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{dailyAppointments.length > 0 ? dailyAppointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">{a.name}</td><td className="p-4">{a.reason}</td><td className="p-4 text-center">{a.time}</td>
                    <td className="p-4 flex gap-2 justify-end">
                      {a.status === 'pending' && <button onClick={() => markAsCompleted(a.id)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="Kryer"><CheckCircle2 size={20}/></button>}
                      <button onClick={() => hideFromDashboard(a.id)} className="text-orange-400 p-1 hover:bg-orange-50 rounded" title="Hiqe"><X size={20}/></button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="text-center p-12 text-slate-400 italic">Asnjë termin.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'raporte' && (
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-8">
                <div><h2 className="text-2xl font-bold">Raportet Financiare</h2><p className="text-slate-500 text-sm">Fitimet ditore</p></div>
                <button onClick={downloadDailyReport} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold border shadow-sm transition-colors"><Download size={18}/> Shkarko CSV</button>
             </div>
             <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-xl mb-8 bg-white outline-none"/>
             <div className="bg-white rounded-xl border overflow-hidden mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-sm font-bold"><tr className="border-b"><th className="p-4">Pacienti</th><th className="p-4 text-right">Shuma</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{reportData.length > 0 ? reportData.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors"><td className="p-4 font-medium">{a.name}</td><td className="p-4 text-right font-bold text-teal-600">{a.cost} €</td></tr>
                  )) : <tr><td colSpan="2" className="text-center p-12 text-slate-400">Nuk ka vizita.</td></tr>}</tbody>
                </table>
             </div>
             <div className="p-6 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-xl">
                <div><p className="text-slate-400 text-sm">Gjithsej</p></div>
                <div className="text-3xl font-bold text-teal-400">{reportData.reduce((s, a) => s + Number(a.cost), 0)} €</div>
             </div>
           </div>
        )}

        {activeTab === 'paciente' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Regjistri i Pacientëve</h2>
                <p className="text-slate-500 text-sm">Historiku i plotë i vizitave dhe terapive</p>
            </div>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-sm uppercase font-bold"><tr><th className="p-4">Emri</th><th className="p-4">Arsyeja</th><th className="p-4">Terapia (Pershkrimi)</th><th className="p-4">Data</th><th className="p-4 text-right">Veprime</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{appointments.length > 0 ? [...appointments].sort((a,b) => b.date.localeCompare(a.date)).map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">{a.name}</td>
                    <td className="p-4">{a.reason}</td>
                    <td className="p-4 text-slate-600 italic text-sm">
                        {editingId === a.id ? (
                            <div className="flex gap-2">
                                <input className="p-1 border rounded w-full text-sm outline-none focus:ring-1 focus:ring-teal-500" value={tempTherapy} onChange={(e) => setTempTherapy(e.target.value)} autoFocus />
                                <button onClick={() => saveTherapy(a.id)} className="text-green-600 hover:scale-110"><Save size={18}/></button>
                                <button onClick={() => setEditingId(null)} className="text-red-400 hover:scale-110"><X size={18}/></button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between group">
                                <span>{a.therapy || "Pa pershkrim"}</span>
                                <button onClick={() => startEditing(a)} className="text-slate-300 group-hover:text-teal-500 transition-colors ml-2"><Edit3 size={14}/></button>
                            </div>
                        )}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500">{a.date}</td>
                    <td className="p-4 text-right font-bold text-slate-700">{a.cost} €</td>
                  </tr>
                )) : <tr><td colSpan="5" className="text-center p-12 text-slate-400">Regjistri bosh.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-4 border border-slate-100" onSubmit={(e) => { e.preventDefault(); setAppointments([...appointments, {...newPatient, id: Date.now(), status: 'pending', hiddenFromDashboard: false}]); setIsModalOpen(false); setNewPatient({ name: '', reason: '', therapy: '', time: '09:00', cost: '', date: today }); }}>
            <div className="flex justify-between items-center mb-2"><h3 className="text-xl font-bold">Shto Pacient</h3><button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={24}/></button></div>
            <div className="space-y-4">
              <input placeholder="Emri dhe Mbiemri" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} required />
              <input placeholder="Arsyeja / Diagnoza" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" value={newPatient.reason} onChange={e => setNewPatient({...newPatient, reason: e.target.value})} required />
              <textarea placeholder="Pershkrimi i Terapise" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]" value={newPatient.therapy} onChange={e => setNewPatient({...newPatient, therapy: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={newPatient.date} onChange={e => setNewPatient({...newPatient, date: e.target.value})} required />
                <input type="time" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={newPatient.time} onChange={e => setNewPatient({...newPatient, time: e.target.value})} required />
              </div>
              <input type="number" placeholder="Kosto (€)" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" value={newPatient.cost} onChange={e => setNewPatient({...newPatient, cost: e.target.value})} required />
            </div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-slate-500">Anulo</button><button type="submit" className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg active:scale-95 transition-all">Ruaj</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
