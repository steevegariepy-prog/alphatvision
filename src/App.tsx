import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Target, MapPin, Zap, Settings, Milestone, Camera, Check, User, Globe, Heart, Brain, Radio, Shield } from 'lucide-react';

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "STEEVE",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300",
    bio: "Chercheur de trésors à temps partiel, passionné d'histoire antique.",
    location: "Playa del Carmen, MX",
    gender: "Homme",
    language: "Français",
    preferredExp: ["Énigme", "Chrono", "Exploration"],
    forces: {
      tactique: 40,
      endurance: 90,
      reseau: 20,
      synergie: 50,
      technique: 30
    }
  });

  const forcesList = [
    { id: 'tactique', label: 'TACTIQUE', desc: 'Énigmes', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500' },
    { id: 'endurance', label: 'ENDURANCE', desc: 'Vitesse', icon: Zap, color: 'text-[#c8a84b]', bg: 'bg-[#c8a84b]' },
    { id: 'reseau', label: 'RÉSEAU', desc: 'Social', icon: Radio, color: 'text-blue-400', bg: 'bg-blue-500' },
    { id: 'synergie', label: 'SYNERGIE', desc: 'Leader', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { id: 'technique', label: 'TECHNIQUE', desc: 'Nav', icon: Target, color: 'text-rose-400', bg: 'bg-rose-500' },
  ];

  const allExperiences = ["Chrono", "Énigme", "Exploration", "Survie", "Co-op", "Chasse au trésor"];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 bg-[#0d0a04] p-6 pt-24 overflow-y-auto pb-32 scrollbar-hide"
    >
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md ${isEditing ? 'bg-[#10B981] text-black border border-[#059669]' : 'bg-[#1a1408] border border-[#4a3c1b] text-[#c8a84b] hover:bg-[#322718]'}`}
        >
          {isEditing ? <Check className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-[#c8a84b] overflow-hidden shadow-[0_0_30px_rgba(200,168,75,0.4)] relative group">
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
            {isEditing && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer transition-opacity"
              >
                <Camera className="w-8 h-8 text-white mb-1" />
                <span className="text-[9px] text-white font-bold uppercase tracking-widest">Modifier</span>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-[#f5e09f] via-[#c8a84b] to-[#8a722f] text-black font-black text-sm px-3 py-1 rounded-full border-2 border-black shadow-lg">
            LVL 42
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full space-y-4 mb-4"
            >
              <div>
                <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1">Callsign / Nom</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-[#1a1408] border border-[#4a3c1b] rounded-lg p-2.5 text-white text-sm focus:border-[#c8a84b] focus:outline-none transition-colors uppercase font-serif tracking-wider" />
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1">Mini Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#1a1408] border border-[#4a3c1b] rounded-lg p-2.5 text-white text-sm h-20 resize-none focus:border-[#c8a84b] focus:outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1">Sexe</label>
                  <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-[#1a1408] border border-[#4a3c1b] rounded-lg p-2.5 text-white text-sm focus:border-[#c8a84b] focus:outline-none transition-colors">
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Non binaire">Non binaire</option>
                    <option value="Secret">Secret</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1">Langue</label>
                  <select value={profile.language} onChange={e => setProfile({...profile, language: e.target.value})} className="w-full bg-[#1a1408] border border-[#4a3c1b] rounded-lg p-2.5 text-white text-sm focus:border-[#c8a84b] focus:outline-none transition-colors">
                    <option value="Français">Français</option>
                    <option value="Anglais">Anglais</option>
                    <option value="Espagnol">Espagnol</option>
                    <option value="Japonais">Japonais</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1">Localisation</label>
                <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full bg-[#1a1408] border border-[#4a3c1b] rounded-lg p-2.5 text-white text-sm focus:border-[#c8a84b] focus:outline-none transition-colors" />
              </div>
              
              <div>
                <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1 mb-2 block">Types d'aventure préférés (6)</label>
                <div className="flex flex-wrap gap-2">
                  {allExperiences.map(exp => (
                    <button 
                      key={exp}
                      onClick={() => {
                        if (profile.preferredExp.includes(exp)) {
                          setProfile({...profile, preferredExp: profile.preferredExp.filter(e => e !== exp)});
                        } else {
                          setProfile({...profile, preferredExp: [...profile.preferredExp, exp]});
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors border ${profile.preferredExp.includes(exp) ? 'bg-[#c8a84b]/20 border-[#c8a84b] text-[#c8a84b]' : 'bg-[#1a1408] border-[#4a3c1b] text-gray-500'}`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#322718]">
                <label className="text-[10px] text-[#9CA3AF] font-bold tracking-[0.1em] uppercase ml-1 mb-4 block">Tes 5 Forces (Répartition)</label>
                <div className="space-y-4">
                  {forcesList.map(force => (
                    <div key={force.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase ${force.color}`}>
                          <force.icon className="w-3.5 h-3.5" />
                          {force.label}
                        </div>
                        <span className="text-[10px] text-white font-mono">{profile.forces[force.id as keyof typeof profile.forces]}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={profile.forces[force.id as keyof typeof profile.forces]} 
                        onChange={(e) => setProfile({
                          ...profile, 
                          forces: { ...profile.forces, [force.id]: parseInt(e.target.value) }
                        })}
                        className="w-full h-1.5 bg-[#322718] rounded-lg appearance-none cursor-pointer accent-[#c8a84b]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full px-2"
            >
              <h2 className="text-white text-2xl font-bold tracking-wider font-serif mb-1 uppercase drop-shadow-md">{profile.name}</h2>
              <p className="text-[#c8a84b] text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 mb-4 bg-[#c8a84b]/10 px-3 py-1 rounded-full border border-[#c8a84b]/20">
                <MapPin className="w-3 h-3" /> {profile.location}
              </p>
              
              <div className="bg-[#1a1408]/80 backdrop-blur-sm border border-[#322718] rounded-2xl p-5 w-full mb-6 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="text-gray-300 text-sm leading-relaxed text-center font-medium italic mb-5">"{profile.bio}"</div>
                
                <div className="flex justify-center gap-8 mt-2 pt-4 border-t border-[#322718]/70">
                  <div className="flex flex-col items-center gap-1.5">
                    <User className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#D1D5DB] text-[10px] font-bold uppercase tracking-widest">{profile.gender}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#D1D5DB] text-[10px] font-bold uppercase tracking-widest">{profile.language}</span>
                  </div>
                </div>
              </div>

              <div className="w-full mb-6">
                <h3 className="text-[#9CA3AF] text-[10px] font-bold tracking-[0.15em] uppercase mb-3 flex items-center justify-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Répartition des 5 Forces
                </h3>
                <div className="bg-[#1a1408] border border-[#322718] rounded-xl p-4 space-y-3 shadow-md">
                  {forcesList.map(force => {
                    const value = profile.forces[force.id as keyof typeof profile.forces];
                    return (
                      <div key={force.id}>
                        <div className="flex justify-between items-center mb-1">
                          <div className={`flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase ${force.color}`}>
                            <force.icon className="w-3 h-3" />
                            {force.label}
                          </div>
                          <span className="text-[9px] text-white font-mono">{value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#322718] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`h-full ${force.bg}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full mb-2">
                <h3 className="text-[#9CA3AF] text-[10px] font-bold tracking-[0.15em] uppercase mb-3 flex items-center justify-center gap-2">
                  <Heart className="w-3.5 h-3.5" /> Aventures Préférées
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.preferredExp.map(exp => (
                    <span key={exp} className="px-3 py-1.5 bg-gradient-to-br from-[#1a1408] to-[#0d0a04] border border-[#c8a84b]/40 text-[#c8a84b] shadow-[0_0_10px_rgba(200,168,75,0.1)] rounded-full text-[9px] font-bold tracking-widest uppercase">
                      {exp}
                    </span>
                  ))}
                  {profile.preferredExp.length === 0 && (
                    <span className="text-gray-600 text-[10px] italic">Aucune spécialité définie</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isEditing && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1a1408] border border-[#322718] rounded-2xl p-4 flex flex-col items-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]">
              <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                 <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white mb-0.5">86%</div>
              <div className="text-[9px] text-[#9CA3AF] font-bold tracking-widest uppercase">Précision</div>
            </div>

            <div className="bg-[#1a1408] border border-[#322718] rounded-2xl p-4 flex flex-col items-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]">
              <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center mb-2">
                 <Award className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-xl font-bold text-white mb-0.5">14</div>
              <div className="text-[9px] text-[#9CA3AF] font-bold tracking-widest uppercase">Victoires</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#c8a84b] text-[11px] font-bold tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
              <Milestone className="w-4 h-4" /> Historique d'aventures
            </h3>

            {[
              { title: "LE SECRET DU CENOTE", date: "Il y a 2 jours", pts: "+840", status: "Victoire" },
              { title: "L'OR DE CHICHÉN ITZÁ", date: "La semaine dernière", pts: "+1250", status: "Victoire" },
              { title: "LA MYSTIQUE DES MAYAS", date: "Il y a 2 semaines", pts: "+400", status: "Terminé" }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-r from-[#1a1408] to-transparent border-l-2 border-[#c8a84b] p-4 rounded-r-xl flex justify-between items-center">
                <div>
                  <h4 className="text-white text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-[10px] text-[#9CA3AF]">{item.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-[#10B981] font-mono font-bold text-sm tracking-wider">{item.pts} pts</div>
                  <div className="text-[9px] text-[#c8a84b] tracking-widest uppercase mt-0.5">{item.status}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 bg-black border border-[#EF4444]/40 text-[#EF4444] font-bold text-[11px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-[#EF4444]/10 uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            Déconnexion
          </button>
        </>
      )}

    </motion.div>
  );
}
