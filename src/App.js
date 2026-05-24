import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Users, Stethoscope, PlusCircle, CheckCircle2, X, Lock, Mail, ChevronRight, Download, Edit3, Save, Menu } from 'lucide-react';

// Versioni 1.1.0 - Mobile Supporting
const API_URL = '/api';

export default function App() {
  const today = new Date().toISOString().split('T')[0];
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ordinanca_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardDate, setDashboardDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [appointments, setAppointments] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', reason: '', therapy: '', time: '09:00', cost: '', date: today });
  const [editingId, setEditingId] = useState(null);
  const [tempTherapy, setTempTherapy] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // 1. NGARKIMI I TË DHËNAVE
  useEffect(() => {
    fetch(`${API_URL}/data`)
      .then(res => res.json())
      .then(data => {
        if (data) setAppointments(data);
      })
      .catch(err => console.error("Error loading data:", err));
  }, []);

  // 2. RUAJTJA AUTOMATIKE
  const saveAll = (updatedData) => {
    setAppointments(updatedData);
    fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    }).catch(err => console.error("Error saving:", err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail === 'hyseniyll44@gmail.com' && loginPassword === 'admin') {
      const u = { email: loginEmail };
      setUser(u);
      localStorage.setItem('ordinanca_user', JSON.stringify(u));
    } else setLoginError(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ordinanca_user');
  };

  const markAsCompleted = (id) => {
    const updated = appointments.map(a => a.id === id ? { ...a, status: 'completed' } : a);
    saveAll(updated);
  };

  const hideFromDashboard = (id) => {
    const updated = appointments.map(a => a.id === id ? { ...a, hiddenFromDashboard: true } : a);
    saveAll(updated);
  };

  const saveAppointment = (e) => {
    e.preventDefault();
    const newApp = { ...newPatient, id: Date.now(), status: 'pending', hiddenFromDashboard: false };
    const updated = [...appointments, newApp];
    saveAll(updated);
    setIsModalOpen(false);
    setNewPatient({ name: '', reason: '', therapy: '', time: '09:00', cost: '', date: today });
  };

  const updateTherapy = (id) => {
    const updated = appointments.map(a => a.id === id ? { ...a, therapy: tempTherapy } : a);
    saveAll(updated);
    setEditingId(null);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 font-sans p-4">
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"><Stethoscope className="text-teal-600" size={32} /></div>
            <h2 className="text-2xl md:text-3xl font-bold">OrdinancaPro</h2>
            <p className="text-slate-500 mt-2">Hyni me llogarinë tuaj</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-teal-500" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-teal-500" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            {loginError && <p className="text-red-500 text-sm">Të dhëna të gabuara!</p>}
            <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">Kyçu</button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    {id:'dashboard', l:'Ballina', i:LayoutDashboard}, 
    {id:'raporte', l:'Raporte', i:BarChart3}, 
    {id:'paciente', l:'Regjistri', i:Users}
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-50">
        <h1 className="text-lg font-bold flex items-center gap-2 text-teal-400"><Stethoscope size={20}/> OrdinancaPro</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-xl">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-50 transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <h1 className="hidden md:flex text-xl font-bold mb-10 items-center gap-3 text-teal-400"><Stethoscope /> OrdinancaPro</h1>
        <nav className="space-y-3 flex-1">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.i size={20} /> {item.l}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 mt-10 text-red-400 hover:bg-slate-800 rounded-2xl"><X size={20} /> Dil</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div><h2 className="text-2xl md:text-3xl font-bold">Ballina</h2><p className="text-slate-500">Menaxhimi i pacientëve</p></div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input type="date" value={dashboardDate} onChange={e => setDashboardDate(e.target.value)} className="p-3 border rounded-2xl outline-none bg-white shadow-sm w-full sm:w-auto"/>
                <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-teal-700 shadow-xl transition-all active:scale-95"><PlusCircle size={22}/> Pacient i ri</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[ {l:'Fitimi Ditores', v:appointments.filter(a => a.status === 'completed' && a.date === dashboardDate).reduce((s,a)=>s+Number(a.cost),0) + ' €', c:'teal'},
                   {l:'Në Pritje', v:appointments.filter(a => a.status === 'pending' && a.date === dashboardDate && !a.hiddenFromDashboard).length, c:'orange'},
                   {l:'Të Kryera', v:appointments.filter(a => a.status === 'completed' && a.date === dashboardDate).length, c:'green'}
                ].map((s,i)=>(
                   <div key={i} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                     <p className="text-xs md:text-sm font-bold text-slate-400 uppercase mb-2">{s.l}</p>
                     <h3 className={`text-2xl md:text-4xl font-black text-${s.c}-600`}>{s.v}</h3>
                   </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[600px] md:min-w-0">
                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase"><tr className="border-b"><th className="p-4 md:p-6">Pacienti</th><th className="p-4 md:p-6">Diagnoza</th><th className="p-4 md:p-6 text-center">Ora</th><th className="p-4 md:p-6 text-right">Veprime</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.filter(a => a.date === dashboardDate && !a.hiddenFromDashboard).length > 0 ? appointments.filter(a => a.date === dashboardDate && !a.hiddenFromDashboard).map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 md:p-6 font-bold text-slate-800">{a.name}</td><td className="p-4 md:p-6 text-slate-600">{a.reason}</td><td className="p-4 md:p-6 text-center font-mono text-slate-500">{a.time}</td>
                      <td className="p-4 md:p-6 flex gap-3 justify-end">
                        {a.status === 'pending' && <button onClick={() => markAsCompleted(a.id)} className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle2 size={20}/></button>}
                        <button onClick={() => hideFromDashboard(a.id)} className="w-10 h-10 flex items-center justify-center bg-orange-50 text-orange-400 rounded-xl hover:bg-orange-400 hover:text-white transition-all"><X size={20}/></button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center p-12 md:p-20 text-slate-300 italic">Asnjë termin për sot.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'raporte' && (
           <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
             <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10">Raportet Financiare</h2>
             <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full sm:w-auto p-4 border rounded-2xl mb-6 md:mb-10 bg-slate-50 outline-none"/>
             <div className="space-y-4">
                {appointments.filter(a => a.status === 'completed' && a.date === selectedDate).map(a => (
                  <div key={a.id} className="flex flex-col sm:flex-row justify-between p-4 md:p-6 bg-slate-50 rounded-2xl items-start sm:items-center gap-3">
                    <div><p className="font-bold">{a.name}</p><p className="text-sm text-slate-500">{a.reason}</p></div>
                    <div className="text-lg md:text-xl font-black text-teal-600">{a.cost} €</div>
                  </div>
                ))}
                <div className="p-6 md:p-8 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row justify-between items-center mt-10 shadow-2xl gap-2">
                    <span className="text-base md:text-lg font-bold text-slate-400">Gjithsej:</span>
                    <span className="text-3xl md:text-4xl font-black text-teal-400">{appointments.filter(a => a.status === 'completed' && a.date === selectedDate).reduce((s,a)=>s+Number(a.cost),0)} €</span>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'paciente' && (
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Regjistri i Pacientëve</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full text-left min-w-[700px] md:min-w-0">
                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase"><tr><th className="p-4 md:p-6">Emri</th><th className="p-4 md:p-6">Terapia</th><th className="p-4 md:p-6">Data</th><th className="p-4 md:p-6 text-right">Kosto</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.sort((a,b) => b.date.localeCompare(a.date)).map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 md:p-6 font-bold">{a.name}</td>
                      <td className="p-4 md:p-6">
                        {editingId === a.id ? (
                            <div className="flex gap-2">
                                <input className="p-2 border rounded-xl w-full" value={tempTherapy} onChange={e => setTempTherapy(e.target.value)} autoFocus />
                                <button onClick={() => updateTherapy(a.id)} className="text-green-600"><Save /></button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-600 italic text-sm">{a.therapy || "Pa përshkrim"}</span>
                                <button onClick={() => { setEditingId(a.id); setTempTherapy(a.therapy || ''); }} className="text-slate-200 group-hover:text-teal-500 transition-colors"><Edit3 size={16}/></button>
                            </div>
                        )}
                      </td>
                      <td className="p-4 md:p-6 text-sm font-mono text-slate-400">{a.date}</td>
                      <td className="p-4 md:p-6 text-right font-black text-slate-700">{a.cost} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal for adding patient */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-[60]">
          <form className="bg-white p-6 md:p-10 rounded-[40px] shadow-2xl w-full max-w-lg space-y-4 md:space-y-6 max-h-[90vh] overflow-auto" onSubmit={saveAppointment}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-black">Shto Pacient</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="md:hidden p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-3 md:space-y-4">
              <input placeholder="Emri dhe Mbiemri" className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} required />
              <input placeholder="Diagnoza" className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none" value={newPatient.reason} onChange={e => setNewPatient({...newPatient, reason: e.target.value})} required />
              <textarea placeholder="Përshkrimi i Terapisë" className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none min-h-[100px] md:min-h-[120px]" value={newPatient.therapy} onChange={e => setNewPatient({...newPatient, therapy: e.target.value})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 px-2">Data</label>
                  <input type="date" className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl" value={newPatient.date} onChange={e => setNewPatient({...newPatient, date: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 px-2">Ora</label>
                  <input type="time" className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl" value={newPatient.time} onChange={e => setNewPatient({...newPatient, time: e.target.value})} required />
                </div>
              </div>
              <input type="number" placeholder="Kosto (€)" className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl" value={newPatient.cost} onChange={e => setNewPatient({...newPatient, cost: e.target.value})} required />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 md:py-5 border-2 rounded-2xl font-bold text-slate-400">Anulo</button>
              <button type="submit" className="order-1 sm:order-2 flex-1 py-4 md:py-5 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 shadow-xl transition-all">Ruaj</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
