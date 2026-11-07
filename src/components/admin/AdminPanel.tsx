import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  Users, 
  Trophy, 
  Settings, 
  CheckCircle, 
  Clock, 
  Copy, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Tv, 
  Database, 
  RefreshCw, 
  Share2, 
  Lock, 
  Unlock,
  Check,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { Nominee, Position, AwardCategory, Profile } from '../../types';
import { GalaRevealCeremony } from './GalaRevealCeremony';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    profiles, 
    nominees, 
    votes, 
    settings, 
    isSupabaseConnected,
    calculateStandings,
    calculateQuintetoIdeal,
    addUserProfile,
    deleteUserProfile,
    addNominee,
    updateNominee,
    deleteNominee,
    toggleHideNominee,
    uploadNomineePhoto,
    toggleVotingOpen,
    resetAllVotes,
    updateSupabaseConfig
  } = useApp();

  const [activeTab, setActiveTab] = useState<'results' | 'users' | 'nominees' | 'settings'>('results');
  const [showCeremony, setShowCeremony] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // New user form state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserCode, setNewUserCode] = useState('');

  // New nominee form state
  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [nomName, setNomName] = useState('');
  const [nomNickname, setNomNickname] = useState('');
  const [nomTeam, setNomTeam] = useState('Futsal Amigos');
  const [nomPosition, setNomPosition] = useState<Position>('Jugador');
  const [nomPhoto, setNomPhoto] = useState('');
  const [nomDescription, setNomDescription] = useState('');
  const [nomCategories, setNomCategories] = useState<AwardCategory[]>(['ballon_dor', 'quinteto_ideal', 'goleador']);

  // Supabase keys state
  const [sbUrl, setSbUrl] = useState(() => localStorage.getItem('GALA_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '');
  const [sbKey, setSbKey] = useState(() => localStorage.getItem('GALA_SUPABASE_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [sbStatus, setSbStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Protect Admin view: only accessible if user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-gala-card border border-rose-500/40 rounded-3xl p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Acceso Restringido</h3>
          <p className="text-xs text-gray-400 mb-6">
            Solo la cuenta oficial del Comité Administrador tiene permisos para ver los resultados en vivo y gestionar la gala.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Calculate live results
  const ballonStandings = calculateStandings('ballon_dor');
  const guanteStandings = calculateStandings('guante_oro');
  const goleadorStandings = calculateStandings('goleador');
  const quintetoLive = calculateQuintetoIdeal();

  const totalVoters = profiles.filter(p => p.role === 'voter');
  const votedCount = totalVoters.filter(p => p.hasVoted).length;
  const participationRate = totalVoters.length > 0 ? Math.round((votedCount / totalVoters.length) * 100) : 0;

  // Handle copy credentials
  const handleCopyCredentials = (profile: Profile) => {
    const text = `🏆 ¡Hola ${profile.displayName}! Has sido acreditado como jurado oficial para la Gala Balón de Oro Futsal.\n\n👤 Usuario: ${profile.username}\n🔑 Código: ${profile.accessCode}\n\nIngresa a votar en la plataforma oficial y arma tu Top 10 y Quinteto Ideal.`;
    navigator.clipboard.writeText(text);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername) return;

    const generatedCode = newUserCode.trim() || `VOTE${Math.floor(100 + Math.random() * 900)}`;

    await addUserProfile({
      displayName: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      accessCode: generatedCode.toUpperCase(),
      role: 'voter',
    });

    setNewUserName('');
    setNewUserUsername('');
    setNewUserCode('');
    setShowUserModal(false);
  };

  const handleGenerateAccountsForNominees = async () => {
    let codeIndex = 101;
    for (const nom of nominees) {
      const cleanUsername = nom.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "") || `user${codeIndex}`;

      const alreadyExists = profiles.some(p => p.username === cleanUsername);
      if (!alreadyExists) {
        await addUserProfile({
          displayName: nom.name,
          username: cleanUsername,
          accessCode: `VOTE${codeIndex}`,
          role: 'voter',
        });
        codeIndex++;
      }
    }
  };

  const handleOpenCreateNominee = () => {
    setEditingNominee(null);
    setNomName('');
    setNomNickname('');
    setNomTeam('Futsal Amigos');
    setNomPosition('Jugador');
    setNomPhoto('');
    setNomDescription('');
    setNomCategories(['ballon_dor', 'quinteto_ideal', 'goleador']);
    setShowNomineeModal(true);
  };

  const handleStartEditNominee = (nom: Nominee) => {
    setEditingNominee(nom);
    setNomName(nom.name);
    setNomNickname(nom.nickname || '');
    setNomTeam(nom.team);
    setNomPosition((nom.position as Position) || 'Jugador');
    setNomPhoto(nom.photoUrl || '');
    setNomDescription(nom.description || '');
    setNomCategories(nom.categories || ['ballon_dor', 'quinteto_ideal']);
    setShowNomineeModal(true);
  };

  const handleSaveNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomName || !nomTeam) return;

    if (editingNominee) {
      await updateNominee(editingNominee.id, {
        name: nomName.trim(),
        nickname: nomNickname.trim() || undefined,
        team: nomTeam.trim(),
        position: nomPosition,
        photoUrl: nomPhoto.trim() || undefined,
        description: nomDescription.trim() || undefined,
        categories: nomCategories,
      });
    } else {
      await addNominee({
        name: nomName.trim(),
        nickname: nomNickname.trim() || undefined,
        team: nomTeam.trim(),
        position: nomPosition,
        photoUrl: nomPhoto.trim() || undefined,
        description: nomDescription.trim() || undefined,
        categories: nomCategories,
      });
    }

    setEditingNominee(null);
    setNomName('');
    setNomNickname('');
    setNomTeam('');
    setNomPhoto('');
    setNomDescription('');
    setShowNomineeModal(false);
  };

  const handleSaveSupabase = async () => {
    if (!sbUrl || !sbKey) {
      setSbStatus('Por favor ingresa URL y Anon Key.');
      return;
    }
    setSbStatus('Conectando...');
    await updateSupabaseConfig(sbUrl, sbKey);
    setSbStatus('Configuración aplicada.');
  };

  return (
    <>
      {showCeremony && (
        <GalaRevealCeremony onClose={() => setShowCeremony(false)} />
      )}

      {/* Admin Panel Modal / Fullscreen on Mobile */}
      <div className="fixed inset-0 z-50 flex flex-col bg-[#090A0D] sm:bg-black/90 sm:backdrop-blur-md sm:p-4 sm:items-center sm:justify-center animate-fade-in overflow-hidden">
        <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-6xl bg-[#0D0F15] sm:border sm:border-white/15 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Top Bar (Compact & Fixed) */}
          <div className="p-3 sm:p-5 border-b border-white/10 bg-[#0A0C11] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h2 className="font-brand font-semibold text-sm sm:text-lg text-white uppercase tracking-wider">
                    Panel Administrador
                  </h2>
                  <span className="px-1.5 py-0.2 rounded bg-gold-500 text-black text-[9px] font-extrabold uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 hidden sm:block">
                  Control oficial de votantes, nominados y gala
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => setShowCeremony(true)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-brand font-bold text-[11px] uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow"
                title="Lanzar Ceremonia en Pantalla Completa"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ceremonia</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (100% visible on any mobile screen in 4 columns) */}
          <div className="grid grid-cols-4 sm:flex sm:overflow-x-auto border-b border-white/10 bg-[#0E1017] flex-shrink-0">
            {[
              { id: 'results', label: 'Resultados', mobileLabel: 'Resultados', icon: Trophy },
              { id: 'users', label: 'Cuentas', mobileLabel: 'Cuentas', icon: Users, badge: `${votedCount}/${totalVoters.length}` },
              { id: 'nominees', label: 'Nominados', mobileLabel: 'Nominados', icon: Edit3, badge: nominees.length },
              { id: 'settings', label: 'Ajustes', mobileLabel: 'Ajustes', icon: Database },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 py-2.5 sm:py-3.5 px-2 sm:px-5 border-b-2 text-center transition-all ${
                    isActive
                      ? 'border-gold-500 text-gold-300 bg-white/[0.03]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" />
                    {tab.badge && (
                      <span className="sm:hidden absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] bg-gold-500 text-black font-bold">
                        {String(tab.badge).split('/')[0]}
                      </span>
                    )}
                  </div>
                  <span className="font-brand font-semibold text-[10px] sm:text-xs uppercase tracking-wider mt-1 sm:mt-0 truncate">
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span className="hidden sm:inline px-1.5 py-0.2 rounded-full text-[9px] bg-white/10 text-gold-400 font-bold ml-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Container (Scrollable) */}
          <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">
            
            {/* 1. RESULTADOS EN VIVO */}
            {activeTab === 'results' && (
              <div className="space-y-8">
                
                {/* Participation Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gala-muted uppercase font-semibold">Total Amigos Votantes</p>
                      <h3 className="font-display text-2xl font-bold text-white mt-1">{totalVoters.length}</h3>
                    </div>
                    <Users className="w-8 h-8 text-gold-400 opacity-60" />
                  </div>

                  <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gala-muted uppercase font-semibold">Votos Sellados</p>
                      <h3 className="font-display text-2xl font-bold text-emerald-400 mt-1">{votedCount}</h3>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-400 opacity-60" />
                  </div>

                  <div className="p-4 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gala-muted uppercase font-semibold">Participación Actual</p>
                      <h3 className="font-display text-2xl font-bold text-gold-400 mt-1">{participationRate}%</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-gold-500 flex items-center justify-center font-bold text-xs">
                      {participationRate}%
                    </div>
                  </div>
                </div>

                {/* Ballon d'Or Live Standings */}
                <div className="bg-gala-black/60 border border-gold-500/30 rounded-2xl p-5 shadow">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-gold-400" />
                      <h3 className="font-display text-lg font-bold text-white uppercase">
                        Clasificación Balón de Oro (Top Puntos Oficial)
                      </h3>
                    </div>
                    <span className="text-xs text-gold-400 font-semibold">
                      {ballonStandings.length} nominados
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Puesto</th>
                          <th className="py-2.5 px-3">Jugador</th>
                          <th className="py-2.5 px-3">Equipo</th>
                          <th className="py-2.5 px-3 text-center">1º Lugares</th>
                          <th className="py-2.5 px-3 text-center">Total Votos</th>
                          <th className="py-2.5 px-3 text-right">Puntos Totales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ballonStandings.map((item, index) => (
                          <tr
                            key={item.nominee.id}
                            className={`hover:bg-white/[0.02] ${
                              index === 0 ? 'bg-gold-500/10 font-bold' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <span className={`w-6 h-6 rounded flex items-center justify-center font-display font-bold ${
                                index === 0 ? 'bg-gold-500 text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'text-gray-400'
                              }`}>
                                #{index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-3 flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-lg bg-black/60 border border-gold-500/30 p-1 flex items-center justify-center flex-shrink-0">
                                <img src="/images.png" alt="" className="w-full h-full object-contain" />
                              </div>
                              <span className="text-white font-medium">{item.nominee.name}</span>
                            </td>
                            <td className="py-3 px-3 text-gray-400">{item.nominee.team}</td>
                            <td className="py-3 px-3 text-center text-gold-400">{item.firstPlaces}</td>
                            <td className="py-3 px-3 text-center text-gray-300">{item.totalVotes}</td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2.5 py-1 rounded bg-gold-500/20 text-gold-300 font-extrabold text-sm border border-gold-500/30">
                                {item.points} pts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quinteto Ideal Live Snapshot */}
                <div className="bg-gala-black/60 border border-emerald-500/30 rounded-2xl p-5 shadow">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <h3 className="font-display text-lg font-bold text-white uppercase flex items-center space-x-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <span>Quinteto Ideal en Tiempo Real</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                    {[
                      { pos: 'PORTERO', item: quintetoLive.gk },
                      { pos: 'CIERRE', item: quintetoLive.cierre },
                      { pos: 'ALA 1', item: quintetoLive.alas[0] },
                      { pos: 'ALA 2', item: quintetoLive.alas[1] },
                      { pos: 'PÍVOT', item: quintetoLive.pivot },
                    ].map((slot, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gala-card border border-white/10">
                        <span className="text-[10px] text-emerald-400 font-bold block mb-1">{slot.pos}</span>
                        <p className="font-display text-xs font-bold text-white truncate">
                          {slot.item?.nominee.name || 'Sin votos'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{slot.item?.nominee.team || '-'}</p>
                        <span className="mt-1 inline-block text-[10px] font-bold text-emerald-300">
                          {slot.item?.votes || 0} votos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guante de Oro & Mejor Goleador 2-col Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Guante de Oro */}
                  <div className="bg-gala-black/60 border border-amber-500/30 rounded-2xl p-5 shadow">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <h4 className="font-display text-base font-bold text-white uppercase flex items-center space-x-2">
                        <span>Guante de Oro (Porteros)</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {guanteStandings.slice(0, 5).map((item, idx) => (
                        <div key={item.nominee.id} className="flex items-center justify-between p-2 rounded-lg bg-gala-card text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-bold text-gold-400 w-5">#{idx + 1}</span>
                            <span className="text-white font-medium truncate">{item.nominee.name}</span>
                          </div>
                          <span className="font-bold text-gold-300">{item.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mejor Goleador */}
                  <div className="bg-gala-black/60 border border-rose-500/30 rounded-2xl p-5 shadow">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <h4 className="font-display text-base font-bold text-white uppercase flex items-center space-x-2">
                        <span>Mejor Goleador & Creador</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {goleadorStandings.slice(0, 5).map((item, idx) => (
                        <div key={item.nominee.id} className="flex items-center justify-between p-2 rounded-lg bg-gala-card text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-bold text-rose-400 w-5">#{idx + 1}</span>
                            <span className="text-white font-medium truncate">{item.nominee.name}</span>
                          </div>
                          <span className="font-bold text-rose-300">{item.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


              </div>
            )}

            {/* 2. GESTIÓN DE CUENTAS DE AMIGOS */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white uppercase">
                      Cuentas y Claves de Acceso de Amigos
                    </h3>
                    <p className="text-xs text-gala-muted">
                      Comparte las credenciales con cada amigo para que ingrese desde su propio teléfono o PC.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleGenerateAccountsForNominees}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gold-300 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors border border-white/10"
                      title="Crea automáticamente una cuenta para cada amigo que aún no tenga cuenta"
                    >
                      <span>⚡ Generar Cuentas Automáticas</span>
                    </button>

                    <button
                      onClick={() => setShowUserModal(true)}
                      className="px-4 py-2 rounded-xl bg-gold-500 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 hover:brightness-110 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Amigo Manual</span>
                    </button>
                  </div>
                </div>

                {/* Form to add friend */}
                {showUserModal && (
                  <form onSubmit={handleCreateUser} className="p-5 rounded-2xl bg-gala-black border border-gold-500/40 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="font-bold text-sm text-gold-300 uppercase">Nueva Cuenta de Votante</h4>
                      <button type="button" onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Ej. Mateo Gómez"
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Usuario (Login)</label>
                        <input
                          type="text"
                          required
                          value={newUserUsername}
                          onChange={(e) => setNewUserUsername(e.target.value)}
                          placeholder="Ej. mateo"
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Código de Acceso (Opcional)</label>
                        <input
                          type="text"
                          value={newUserCode}
                          onChange={(e) => setNewUserCode(e.target.value)}
                          placeholder="Auto si se deja vacío"
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUserModal(false)}
                        className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-gold-500 text-black font-bold text-xs uppercase"
                      >
                        Guardar Cuenta
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of Users */}
                <div className="bg-gala-black/60 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                        <th className="py-3 px-4">Amigo / Votante</th>
                        <th className="py-3 px-4">Usuario</th>
                        <th className="py-3 px-4">Código de Acceso</th>
                        <th className="py-3 px-4">Estado Votación</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {profiles.map(profile => (
                        <tr key={profile.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{profile.displayName}</span>
                            <span className="text-[10px] text-gold-400/80 uppercase">
                              {profile.role === 'admin' ? 'Administrador' : 'Votante'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-300">{profile.username}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-gold-300 font-bold text-[11px] border border-white/10">
                              {profile.accessCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {profile.hasVoted ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                                <CheckCircle className="w-3 h-3" />
                                <span>Votó</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                <span>Pendiente</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleCopyCredentials(profile)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1 ${
                                  copiedId === profile.id
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-white/5 hover:bg-gold-500 hover:text-black text-gold-300'
                                }`}
                                title="Copiar invitación lista para WhatsApp"
                              >
                                {copiedId === profile.id ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                                <span>{copiedId === profile.id ? 'Copiado!' : 'WhatsApp'}</span>
                              </button>

                              {profile.role !== 'admin' && (
                                <button
                                  onClick={() => deleteUserProfile(profile.id)}
                                  className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                                  title="Eliminar cuenta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. GESTOR DE NOMINADOS */}
            {activeTab === 'nominees' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white uppercase">
                      Gestión de Nominados Oficiales
                    </h3>
                    <p className="text-xs text-gala-muted">
                      Personaliza los nombres, apodos, fotos y premios a los que postulan tus amigos.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenCreateNominee}
                    className="px-4 py-2 rounded-xl bg-gold-500 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 hover:brightness-110 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Nominado</span>
                  </button>
                </div>

                {/* Form to add or edit nominee */}
                {showNomineeModal && (
                  <form onSubmit={handleSaveNominee} className="p-5 rounded-2xl bg-black border border-gold-500/40 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="font-bold text-sm text-gold-300 uppercase">
                        {editingNominee ? `Editar: ${editingNominee.name}` : 'Nuevo Jugador Nominado'}
                      </h4>
                      <button type="button" onClick={() => setShowNomineeModal(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          value={nomName}
                          onChange={(e) => setNomName(e.target.value)}
                          placeholder="Ej. Mateo Gómez"
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Apodo (Opcional)</label>
                        <input
                          type="text"
                          value={nomNickname}
                          onChange={(e) => setNomNickname(e.target.value)}
                          placeholder="Ej. El Mágico"
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Equipo / Club</label>
                        <input
                          type="text"
                          required
                          value={nomTeam}
                          onChange={(e) => setNomTeam(e.target.value)}
                          placeholder="Ej. Los Galácticos FC"
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Posición Futsal</label>
                        <select
                          value={nomPosition}
                          onChange={(e) => setNomPosition(e.target.value as Position)}
                          className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                        >
                          <option value="Portero">Portero</option>
                          <option value="Cierre">Cierre</option>
                          <option value="Ala">Ala</option>
                          <option value="Pívot">Pívot</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Foto del Jugador (Opcional)</label>
                        <div className="flex items-center space-x-2">
                          <label className="cursor-pointer px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-gold-300 flex items-center space-x-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingPhoto ? 'Subiendo...' : 'Subir desde Celular/PC'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadingPhoto(true);
                                  const url = await uploadNomineePhoto(file);
                                  if (url) setNomPhoto(url);
                                  setUploadingPhoto(false);
                                }
                              }}
                            />
                          </label>

                          {nomPhoto && (
                            <div className="flex items-center space-x-1.5">
                              <img src={nomPhoto} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-gold-500/40" />
                              <button
                                type="button"
                                onClick={() => setNomPhoto('')}
                                className="text-rose-400 hover:text-rose-300 text-[10px]"
                              >
                                Quitar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Descripción / Destacado</label>
                      <input
                        type="text"
                        value={nomDescription}
                        onChange={(e) => setNomDescription(e.target.value)}
                        placeholder="Ej. Líder defensivo, salida limpia y corazón del equipo"
                        className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Premios a los que postula</label>
                      <div className="flex flex-wrap gap-4 pt-1 text-xs">
                        {[
                          { id: 'ballon_dor', label: "Ballon d'Or" },
                          { id: 'guante_oro', label: 'Guante de Oro' },
                          { id: 'quinteto_ideal', label: 'Quinteto Ideal' },
                          { id: 'goleador', label: 'Mejor Goleador' },
                        ].map(cat => (
                          <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={nomCategories.includes(cat.id as AwardCategory)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNomCategories(prev => [...prev, cat.id as AwardCategory]);
                                } else {
                                  setNomCategories(prev => prev.filter(c => c !== cat.id));
                                }
                              }}
                              className="rounded border-gray-700 text-gold-500 focus:ring-gold-500"
                            />
                            <span className="text-gray-300">{cat.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNomineeModal(false)}
                        className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-gold-500 text-black font-bold text-xs uppercase"
                      >
                        {editingNominee ? 'Guardar Cambios' : 'Crear Nominado'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Nominees Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {nominees.map(nom => (
                    <div 
                      key={nom.id} 
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        nom.hidden 
                          ? 'bg-black/30 border-dashed border-white/10 opacity-60' 
                          : 'bg-[#111319] border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {nom.photoUrl ? (
                          <img src={nom.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/15 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-gold-400 font-brand font-bold text-xs">
                            {nom.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-brand font-semibold text-sm text-white truncate">{nom.name}</h4>
                            {nom.hidden && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950/60 text-amber-400 border border-amber-500/30">
                                Oculto
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{nom.team} {nom.position ? `· ${nom.position}` : ''}</p>
                          <span className="text-[10px] text-gray-500 truncate block">
                            {nom.categories.join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEditNominee(nom)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-gold-500 hover:text-black text-gray-300 transition-colors"
                          title="Editar nombre, equipo o foto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => toggleHideNominee(nom.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            nom.hidden 
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black' 
                              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                          title={nom.hidden ? 'Mostrar en votación' : 'Ocultar de la votación'}
                        >
                          {nom.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteNominee(nom.id)}
                          className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                          title="Eliminar nominado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SUPABASE Y CONFIGURACIÓN */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                
                {/* Voting Open/Closed Control */}
                <div className="p-5 rounded-2xl bg-gala-black/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white uppercase">Estado de la Votación</h4>
                    <p className="text-xs text-gray-400">
                      {settings.votingOpen
                        ? 'Las votaciones están abiertas para todos los amigos.'
                        : 'Las votaciones están cerradas. Los votos quedan sellados para la premiación.'}
                    </p>
                  </div>

                  <button
                    onClick={toggleVotingOpen}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all ${
                      settings.votingOpen
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500 hover:text-white'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black'
                    }`}
                  >
                    {settings.votingOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span>{settings.votingOpen ? 'Cerrar Votaciones' : 'Abrir Votaciones'}</span>
                  </button>
                </div>

                {/* Supabase Connection Settings */}
                <div className="p-5 rounded-2xl bg-gala-black/60 border border-gold-500/30 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-gold-400" />
                    <h4 className="font-display text-sm font-bold text-white uppercase">
                      Conexión a Base de Datos Supabase
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400">
                    Ingresa tus credenciales del proyecto Supabase. Si no las configuras, la app seguirá funcionando perfectamente en modo local persistente.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">
                        Project URL
                      </label>
                      <input
                        type="text"
                        value={sbUrl}
                        onChange={(e) => setSbUrl(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs font-mono focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">
                        Anon Public Key
                      </label>
                      <input
                        type="password"
                        value={sbKey}
                        onChange={(e) => setSbKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
                        className="w-full px-3 py-2 rounded-lg bg-gala-card border border-white/15 text-white text-xs font-mono focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    {sbStatus && (
                      <p className="text-xs text-gold-300 font-semibold">{sbStatus}</p>
                    )}

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={handleSaveSupabase}
                        className="px-5 py-2 rounded-xl bg-gold-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow"
                      >
                        Guardar y Probar Conexión
                      </button>

                      <div className="text-xs text-gray-400">
                        Estado:{' '}
                        <span className={isSupabaseConnected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {isSupabaseConnected ? 'Conectado a Supabase' : 'Modo Almacenamiento Local'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset test votes */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm font-bold text-rose-300 uppercase">Reiniciar Votos de Prueba</h4>
                    <p className="text-xs text-gray-400">
                      Borra los votos emitidos para comenzar desde cero con tu grupo de amigos.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de reiniciar todos los votos emitidos?')) {
                        resetAllVotes();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase transition-colors"
                  >
                    Limpiar Votos
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
};
