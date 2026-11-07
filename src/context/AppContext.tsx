import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Profile, 
  Nominee, 
  StoredVote, 
  GalaSettings, 
  AwardCategory, 
  UserBallot,
  BALLON_DOR_POINTS,
  GUANTE_ORO_POINTS,
  GOLEADOR_POINTS,
  QuintetoBallot
} from '../types';
import { INITIAL_PROFILES, INITIAL_NOMINEES, INITIAL_SETTINGS } from '../data/initialData';
import { getSupabaseClient, setCustomSupabaseCredentials, getSavedSupabaseCredentials } from '../lib/supabase';

interface AppContextType {
  currentUser: Profile | null;
  profiles: Profile[];
  nominees: Nominee[];
  votes: StoredVote[];
  settings: GalaSettings;
  isSupabaseConnected: boolean;
  activeCategory: AwardCategory;
  userBallot: UserBallot;
  loading: boolean;
  error: string | null;
  
  // Navigation & Category
  setActiveCategory: (cat: AwardCategory) => void;
  setUserBallot: React.Dispatch<React.SetStateAction<UserBallot>>;
  
  // Auth
  login: (username: string, accessCode: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Voting
  submitBallotForCategory: (category: AwardCategory, ballotData: any) => Promise<{ success: boolean; message: string }>;
  submitFullBallot: () => Promise<{ success: boolean; message: string }>;
  
  // Admin functions
  addNominee: (nominee: Omit<Nominee, 'id'>) => Promise<boolean>;
  updateNominee: (id: string, nominee: Partial<Nominee>) => Promise<boolean>;
  deleteNominee: (id: string) => Promise<boolean>;
  toggleHideNominee: (id: string) => Promise<boolean>;
  uploadNomineePhoto: (file: File) => Promise<string | null>;
  
  addUserProfile: (profile: Omit<Profile, 'id' | 'hasVoted'>) => Promise<boolean>;
  updateUserProfile: (id: string, profile: Partial<Profile>) => Promise<boolean>;
  deleteUserProfile: (id: string) => Promise<boolean>;
  
  toggleVotingOpen: () => Promise<boolean>;
  resetAllVotes: () => Promise<boolean>;
  restoreDefaultData: () => Promise<boolean>;
  updateSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  
  // Results calculation
  calculateStandings: (category: AwardCategory) => Array<{ nominee: Nominee; points: number; firstPlaces: number; totalVotes: number }>;
  calculateQuintetoIdeal: () => {
    gk: { nominee: Nominee; votes: number } | null;
    cierre: { nominee: Nominee; votes: number } | null;
    alas: Array<{ nominee: Nominee; votes: number }>;
    pivot: { nominee: Nominee; votes: number } | null;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('GALA_CURRENT_USER');
    return saved ? JSON.parse(saved) : null;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('GALA_PROFILES');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [nominees, setNominees] = useState<Nominee[]>(() => {
    const saved = localStorage.getItem('GALA_NOMINEES');
    return saved ? JSON.parse(saved) : INITIAL_NOMINEES;
  });

  const [votes, setVotes] = useState<StoredVote[]>(() => {
    const saved = localStorage.getItem('GALA_VOTES');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<GalaSettings>(() => {
    const saved = localStorage.getItem('GALA_SETTINGS');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [activeCategory, setActiveCategory] = useState<AwardCategory>('ballon_dor');
  const [userBallot, setUserBallot] = useState<UserBallot>({});
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('GALA_PROFILES', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('GALA_NOMINEES', JSON.stringify(nominees));
  }, [nominees]);

  useEffect(() => {
    localStorage.setItem('GALA_VOTES', JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem('GALA_SETTINGS', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('GALA_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('GALA_CURRENT_USER');
    }
  }, [currentUser]);

  // Load user existing ballot if logged in
  useEffect(() => {
    if (currentUser) {
      const userVotes = votes.filter(v => v.userId === currentUser.id);
      const loadedBallot: UserBallot = {};
      userVotes.forEach(v => {
        if (v.categoryId === 'ballon_dor') loadedBallot.ballon_dor = v.ballot;
        if (v.categoryId === 'guante_oro') loadedBallot.guante_oro = v.ballot;
        if (v.categoryId === 'quinteto_ideal') loadedBallot.quinteto_ideal = v.ballot;
        if (v.categoryId === 'goleador') loadedBallot.goleador = v.ballot;
      });
      setUserBallot(loadedBallot);
    } else {
      setUserBallot({});
    }
  }, [currentUser, votes]);

  // Try connecting to Supabase and load data from remote DB if available
  const loadFromSupabase = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsSupabaseConnected(false);
      return;
    }

    try {
      setLoading(true);
      // Test connection with profiles
      const { data: remoteProfiles, error: pErr } = await supabase.from('profiles').select('*');
      if (pErr) throw pErr;

      setIsSupabaseConnected(true);
      if (remoteProfiles && remoteProfiles.length > 0) {
        setProfiles(remoteProfiles.map(p => ({
          id: p.id,
          username: p.username,
          displayName: p.display_name,
          role: p.role,
          accessCode: p.access_code,
          hasVoted: p.has_voted ?? false,
          votedAt: p.voted_at,
        })));
      }

      // Fetch Nominees
      const { data: remoteNominees, error: nErr } = await supabase.from('nominees').select('*');
      if (!nErr && remoteNominees && remoteNominees.length > 0) {
        setNominees(remoteNominees.map(n => ({
          id: n.id,
          name: n.name,
          nickname: n.nickname,
          team: n.team,
          position: n.position,
          photoUrl: n.photo_url,
          description: n.description,
          categories: n.categories,
        })));
      }

      // Fetch Votes
      const { data: remoteVotes, error: vErr } = await supabase.from('votes').select('*');
      if (!vErr && remoteVotes) {
        setVotes(remoteVotes.map(v => ({
          id: v.id,
          userId: v.user_id,
          categoryId: v.category_id,
          ballot: v.ballot,
          createdAt: v.created_at,
        })));
      }

      // Fetch Settings
      const { data: remoteSettings } = await supabase.from('gala_settings').select('*').limit(1).single();
      if (remoteSettings) {
        setSettings(prev => ({
          ...prev,
          votingOpen: remoteSettings.voting_open ?? true,
          revealedCategory: remoteSettings.revealed_category ?? null,
        }));
      }

    } catch (err: any) {
      console.warn('Supabase no configurado o sin tablas creadas aún:', err.message);
      setIsSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromSupabase();
  }, []);

  // Login handler
  const login = async (username: string, accessCode: string): Promise<{ success: boolean; message: string }> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanCode = accessCode.trim().toUpperCase();

    // Check remote supabase first if connected
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        const { data, error: qErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanUser)
          .eq('access_code', cleanCode)
          .single();

        if (data && !qErr) {
          const profile: Profile = {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            role: data.role,
            accessCode: data.access_code,
            hasVoted: data.has_voted ?? false,
            votedAt: data.voted_at,
          };
          setCurrentUser(profile);
          return { success: true, message: `¡Bienvenido, ${profile.displayName}!` };
        }
      } catch (e) {
        console.warn('Fallo query a supabase, intentando memoria local');
      }
    }

    // Fallback to local profile list
    const found = profiles.find(
      p => p.username.toLowerCase() === cleanUser && p.accessCode.toUpperCase() === cleanCode
    );

    if (found) {
      setCurrentUser(found);
      return { success: true, message: `¡Bienvenido, ${found.displayName}!` };
    }

    return { success: false, message: 'Usuario o código de acceso inválido. Consulta al Admin.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Submit ballot for one category
  const submitBallotForCategory = async (category: AwardCategory, ballotData: any): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Debes iniciar sesión para votar.' };
    if (!settings.votingOpen) return { success: false, message: 'Las votaciones están oficialmente cerradas.' };

    const newVote: StoredVote = {
      id: `${currentUser.id}_${category}_${Date.now()}`,
      userId: currentUser.id,
      categoryId: category,
      ballot: ballotData,
      createdAt: new Date().toISOString(),
    };

    // Update local state
    setVotes(prev => {
      const filtered = prev.filter(v => !(v.userId === currentUser.id && v.categoryId === category));
      return [...filtered, newVote];
    });

    setUserBallot(prev => ({
      ...prev,
      [category]: ballotData
    }));

    // If Supabase is connected, write to DB
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('votes').upsert({
          user_id: currentUser.id,
          category_id: category,
          ballot: ballotData,
        }, { onConflict: 'user_id, category_id' });
      } catch (err) {
        console.error('Error guardando voto en Supabase:', err);
      }
    }

    return { success: true, message: `Voto guardado para ${category.replace('_', ' ').toUpperCase()}` };
  };

  // Submit all votes and finalize user ballot
  const submitFullBallot = async (): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'No hay sesión activa.' };
    if (!settings.votingOpen) return { success: false, message: 'Las votaciones están cerradas.' };

    const updatedUser = {
      ...currentUser,
      hasVoted: true,
      votedAt: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase
          .from('profiles')
          .update({ has_voted: true, voted_at: updatedUser.votedAt })
          .eq('id', currentUser.id);
      } catch (err) {
        console.error('Error actualizando perfil en Supabase:', err);
      }
    }

    return { success: true, message: '¡Tus votaciones han sido selladas y registradas para la gala!' };
  };

  // Admin: Nominees management
  const addNominee = async (newNom: Omit<Nominee, 'id'>): Promise<boolean> => {
    const id = `nom-${Date.now()}`;
    const nominee: Nominee = { ...newNom, id };

    setNominees(prev => [...prev, nominee]);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('nominees').insert({
          id,
          name: nominee.name,
          nickname: nominee.nickname,
          team: nominee.team,
          position: nominee.position,
          photo_url: nominee.photoUrl,
          description: nominee.description,
          categories: nominee.categories,
        });
      } catch (err) {
        console.error('Error agregando nominado en Supabase:', err);
      }
    }
    return true;
  };

  const updateNominee = async (id: string, updated: Partial<Nominee>): Promise<boolean> => {
    setNominees(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        const payload: any = {};
        if (updated.name) payload.name = updated.name;
        if (updated.nickname !== undefined) payload.nickname = updated.nickname;
        if (updated.team) payload.team = updated.team;
        if (updated.position) payload.position = updated.position;
        if (updated.photoUrl) payload.photo_url = updated.photoUrl;
        if (updated.description !== undefined) payload.description = updated.description;
        if (updated.categories) payload.categories = updated.categories;

        await supabase.from('nominees').update(payload).eq('id', id);
      } catch (err) {
        console.error('Error actualizando nominado en Supabase:', err);
      }
    }
    return true;
  };

  const deleteNominee = async (id: string): Promise<boolean> => {
    setNominees(prev => prev.filter(n => n.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('nominees').delete().eq('id', id);
      } catch (err) {
        console.error('Error eliminando nominado en Supabase:', err);
      }
    }
    return true;
  };

  const uploadNomineePhoto = async (file: File): Promise<string | null> => {
    const supabase = getSupabaseClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `nominee_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    if (supabase && isSupabaseConnected) {
      try {
        const { error: upErr } = await supabase.storage.from('nominee-photos').upload(fileName, file, {
          upsert: true,
        });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('nominee-photos').getPublicUrl(fileName);
        return data.publicUrl;
      } catch (err: any) {
        console.warn('Error subiendo a Supabase Storage, usando base64 fallback:', err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const toggleHideNominee = async (id: string): Promise<boolean> => {
    let nextHidden = false;
    setNominees(prev => prev.map(n => {
      if (n.id === id) {
        nextHidden = !n.hidden;
        return { ...n, hidden: nextHidden };
      }
      return n;
    }));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('nominees').update({ hidden: nextHidden }).eq('id', id);
      } catch (err) {
        console.error('Error actualizando estado oculto en Supabase:', err);
      }
    }
    return true;
  };

  // Admin: User profiles management
  const addUserProfile = async (newProfile: Omit<Profile, 'id' | 'hasVoted'>): Promise<boolean> => {
    const id = `user-${Date.now()}`;
    const profile: Profile = {
      ...newProfile,
      id,
      hasVoted: false,
    };

    setProfiles(prev => [...prev, profile]);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('profiles').insert({
          id,
          username: profile.username,
          display_name: profile.displayName,
          role: profile.role,
          access_code: profile.accessCode,
          has_voted: false,
        });
      } catch (err) {
        console.error('Error creando perfil en Supabase:', err);
      }
    }
    return true;
  };

  const updateUserProfile = async (id: string, updated: Partial<Profile>): Promise<boolean> => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        const payload: any = {};
        if (updated.username) payload.username = updated.username;
        if (updated.displayName) payload.display_name = updated.displayName;
        if (updated.role) payload.role = updated.role;
        if (updated.accessCode) payload.access_code = updated.accessCode;
        if (updated.hasVoted !== undefined) payload.has_voted = updated.hasVoted;

        await supabase.from('profiles').update(payload).eq('id', id);
      } catch (err) {
        console.error('Error actualizando perfil en Supabase:', err);
      }
    }
    return true;
  };

  const deleteUserProfile = async (id: string): Promise<boolean> => {
    setProfiles(prev => prev.filter(p => p.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (err) {
        console.error('Error eliminando usuario en Supabase:', err);
      }
    }
    return true;
  };

  // Admin: Settings & voting controls
  const toggleVotingOpen = async (): Promise<boolean> => {
    const nextState = !settings.votingOpen;
    setSettings(prev => ({ ...prev, votingOpen: nextState }));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('gala_settings').update({ voting_open: nextState }).eq('id', 'current_gala');
      } catch (err) {
        console.error('Error actualizando estado en Supabase:', err);
      }
    }
    return true;
  };

  const resetAllVotes = async (): Promise<boolean> => {
    setVotes([]);
    setProfiles(prev => prev.map(p => ({ ...p, hasVoted: false, votedAt: null })));
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, hasVoted: false, votedAt: null }) : null);
    }
    setUserBallot({});

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('profiles').update({ has_voted: false, voted_at: null }).neq('id', '');
      } catch (err) {
        console.error('Error limpiando votos en Supabase:', err);
      }
    }
    return true;
  };

  const restoreDefaultData = async (): Promise<boolean> => {
    setProfiles(INITIAL_PROFILES);
    setNominees(INITIAL_NOMINEES);
    setVotes([]);
    setSettings(INITIAL_SETTINGS);
    setUserBallot({});
    return true;
  };

  const updateSupabaseConfig = async (url: string, key: string): Promise<boolean> => {
    setCustomSupabaseCredentials(url, key);
    await loadFromSupabase();
    return true;
  };

  // Standings calculation for Ranking categories
  const calculateStandings = (category: AwardCategory) => {
    const categoryNominees = nominees.filter(n => n.categories.includes(category));
    const scoreMap = new Map<string, { points: number; firstPlaces: number; totalVotes: number }>();

    // Init map
    categoryNominees.forEach(n => {
      scoreMap.set(n.id, { points: 0, firstPlaces: 0, totalVotes: 0 });
    });

    const categoryVotes = votes.filter(v => v.categoryId === category);

    categoryVotes.forEach(voteRecord => {
      const ranking: string[] = Array.isArray(voteRecord.ballot) ? voteRecord.ballot : [];
      
      ranking.forEach((nomineeId, index) => {
        const current = scoreMap.get(nomineeId);
        if (current) {
          let pointsForRank = 0;
          if (category === 'ballon_dor') {
            pointsForRank = BALLON_DOR_POINTS[index] || 0;
          } else if (category === 'guante_oro') {
            pointsForRank = GUANTE_ORO_POINTS[index] || 0;
          } else if (category === 'goleador') {
            pointsForRank = GOLEADOR_POINTS[index] || 0;
          }

          scoreMap.set(nomineeId, {
            points: current.points + pointsForRank,
            firstPlaces: current.firstPlaces + (index === 0 ? 1 : 0),
            totalVotes: current.totalVotes + 1,
          });
        }
      });
    });

    // Sort descending by points, tie-break by 1st place picks, then total mentions
    return categoryNominees
      .map(n => ({
        nominee: n,
        points: scoreMap.get(n.id)?.points || 0,
        firstPlaces: scoreMap.get(n.id)?.firstPlaces || 0,
        totalVotes: scoreMap.get(n.id)?.totalVotes || 0,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces;
        return b.totalVotes - a.totalVotes;
      });
  };

  // Standings calculation for Futsal Quinteto Ideal (1 GK + 4 Field Players)
  const calculateQuintetoIdeal = () => {
    const quintetoVotes = votes.filter(v => v.categoryId === 'quinteto_ideal');

    const counts = {
      gk: new Map<string, number>(),
      field: new Map<string, number>(),
    };

    quintetoVotes.forEach(v => {
      const ballot: any = v.ballot;
      if (ballot) {
        if (Array.isArray(ballot.players)) {
          if (ballot.players[0]) {
            counts.gk.set(ballot.players[0], (counts.gk.get(ballot.players[0]) || 0) + 1);
          }
          for (let i = 1; i < 5; i++) {
            const pId = ballot.players[i];
            if (pId) counts.field.set(pId, (counts.field.get(pId) || 0) + 1);
          }
        } else {
          if (ballot.gk) counts.gk.set(ballot.gk, (counts.gk.get(ballot.gk) || 0) + 1);
          if (ballot.cierre) counts.field.set(ballot.cierre, (counts.field.get(ballot.cierre) || 0) + 1);
          if (ballot.ala_izq) counts.field.set(ballot.ala_izq, (counts.field.get(ballot.ala_izq) || 0) + 1);
          if (ballot.ala_der) counts.field.set(ballot.ala_der, (counts.field.get(ballot.ala_der) || 0) + 1);
          if (ballot.pivot) counts.field.set(ballot.pivot, (counts.field.get(ballot.pivot) || 0) + 1);
        }
      }
    });

    const getTopNominee = (map: Map<string, number>) => {
      let topId: string | null = null;
      let maxVotes = -1;
      map.forEach((count, id) => {
        if (count > maxVotes) {
          maxVotes = count;
          topId = id;
        }
      });
      if (!topId) return null;
      const nom = nominees.find(n => n.id === topId);
      return nom ? { nominee: nom, votes: maxVotes } : null;
    };

    const getTopFieldPlayers = (map: Map<string, number>) => {
      const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
      const result: Array<{ nominee: Nominee; votes: number }> = [];
      for (const [id, count] of sorted) {
        const nom = nominees.find(n => n.id === id);
        if (nom) result.push({ nominee: nom, votes: count });
        if (result.length >= 4) break;
      }
      return result;
    };

    const topField = getTopFieldPlayers(counts.field);

    return {
      gk: getTopNominee(counts.gk),
      cierre: topField[0] || null,
      alas: [topField[1] || null, topField[2] || null].filter(Boolean) as Array<{ nominee: Nominee; votes: number }>,
      pivot: topField[3] || null,
      topField,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        profiles,
        nominees,
        votes,
        settings,
        isSupabaseConnected,
        activeCategory,
        userBallot,
        loading,
        error,
        setActiveCategory,
        setUserBallot,
        login,
        logout,
        submitBallotForCategory,
        submitFullBallot,
        addNominee,
        updateNominee,
        deleteNominee,
        toggleHideNominee,
        uploadNomineePhoto,
        addUserProfile,
        updateUserProfile,
        deleteUserProfile,
        toggleVotingOpen,
        resetAllVotes,
        restoreDefaultData,
        updateSupabaseConfig,
        calculateStandings,
        calculateQuintetoIdeal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
