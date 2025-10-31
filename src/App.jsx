import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, User, Zap, Settings, ArrowLeft, Send, Sun, Moon } from 'lucide-react';
import ViajeHuaraz from "./viajeHuaraz";

// --- DATOS DE PERFIL ---
const profiles = [
  {
    id: 'brunella',
    name: "Brunella",
    age: 32,
    bio: "PUCP • HISTORIA",
    interests: ["Salud", "Lectura", "Gatos", "Girasoles", "PUCP"],
    image: "/images/brunella.png" 
  },
  {
    id: 'manuel',
    name: "Manuel",
    age: 29,
    bio: "Administración y Marketing",
    interests: ["Viajes", "Series", "Programación", "Diversión pero no me cierro"],
    image: "/images/Otto.png"
  }
];

// --- UTILITY: CORAZÓN PIXELADO ---
const PixelHeart = ({ size = 20, color = "#FF6633" }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <rect x="2" y="0" width="1" height="1" fill={color}/>
    <rect x="5" y="0" width="1" height="1" fill={color}/>
    <rect x="1" y="1" width="2" height="1" fill={color}/>
    <rect x="4" y="1" width="2" height="1" fill={color}/>
    <rect x="0" y="2" width="7" height="1" fill={color}/>
    <rect x="0" y="3" width="7" height="1" fill={color}/>
    <rect x="1" y="4" width="5" height="1" fill={color}/>
    <rect x="2" y="5" width="3" height="1" fill={color}/>
    <rect x="3" y="6" width="1" height="1" fill={color}/>
  </svg>
);

// --- CONVERSACIÓN EXTENDIDA Y ESTRUCTURADA POR TIEMPO/PROGRESO ---
const conversationData = [
  // Start: Day (Progress ~0)
  { type: 'timestamp', content: 'Inicio de la Conversación' },
  { type: 'received', speaker: 'Manuel', content: "Hola Brunella, me gusta el estilo de tus fotos" },
  { type: 'sent', speaker: 'Brunella', content: "Gracias, me alegra. ¡Tus fotos en Huaraz están geniales!" },
  
  // Day (More chatter - Progress ~0.1)
  { type: 'blur_start', count: 10, content: 'Conversación de la mañana...' }, 
  { type: 'received_blur', count: 5 },
  { type: 'sent_blur', count: 5 },
  { type: 'blur_end' },

  // Mid-Day / Early Afternoon (Progress ~0.3)
  { type: 'timestamp', content: 'Hoy, 14:30' },
  { type: 'received', speaker: 'Manuel', content: "Me encantó Huaraz. Deberíamos ir juntos alguna vez." },
  { type: 'sent', speaker: 'Brunella', content: "¡Me apunto! ¿Qué tal un café mientras planeamos?" },
  
  // New Day Segment / Transition to Sunset (Progress ~0.5)
  { type: 'timestamp', content: 'Días después, 17:00 (Atardecer)' },
  { type: 'received', speaker: 'Manuel', content: "Vamos al cine? Hay una pelicula buenisima que esta nominada al Oscar" },
  { type: 'sent', speaker: 'Brunella', content: "Listo! Nos vemos ahí" },
  
  // Sunset (Progress ~0.7)
  { type: 'blur_start', count: 8, content: 'Chat durante la película...' }, 
  { type: 'received_blur', count: 4 },
  { type: 'sent_blur', count: 4 },
  { type: 'blur_end' },

  // Dusk / Night (Progress ~0.8)
  { type: 'timestamp', content: 'Hoy, 20:00 (Saliendo del cine)' },
  { type: 'sent', speaker: 'Brunella', content: "Aunque la pelicula fue mala jajaja me gusto poder tomar tu mano. Vamos a ver Dune?" },
  { type: 'received', speaker: 'Manuel', content: "Me encantaría, pero creo que necesito descansar. Ha sido un día largo y hermoso." },
  
  // Deep Night (Progress ~1.0)
  { type: 'timestamp', content: '23:30 (Noche profunda)' },
  { type: 'sent', speaker: 'Brunella', content: "Duerme bien. Hablamos mañana." },
  { type: 'received', speaker: 'Manuel', content: "Igualmente, Brunella. Soñaré con ese viaje a Huaraz." },
];

// --- COMPONENTES BASE: FRAME + TABS ---
const PixelFrame = ({ children }) => (
  <div className="relative mx-auto" style={{ width: '400px', height: '850px' }}>
    {/* Frame exterior */}
    <div className="absolute inset-0 bg-gray-800 rounded-xl p-2 shadow-[8px_8px_0_0_#EA580C,12px_12px_0_0_#9A3412]" style={{ borderRadius: '20px', zIndex: 10 }}>
      {/* Inner Screen Border */}
      <div className="absolute inset-0 bg-orange-300 p-2" style={{ border: '6px solid #4B5563', borderRadius: '16px', boxShadow: 'inset 0 0 0 4px #FB923C' }}>
        {/* Pantalla interna */}
        <div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">{children}</div>
      </div>

      {/* Botones laterales decorativos */}
      <div className="absolute -right-5 top-1/3 w-4 h-16 bg-gray-700 rounded-sm shadow-[4px_4px_0_0_#1F2937]" />
      <div className="absolute -left-5 top-1/4 w-4 h-10 bg-gray-700 rounded-sm shadow-[-4px_4px_0_0_#1F2937]" />
      <div className="absolute -left-5 top-[calc(1/4*100%+60px)] w-4 h-10 bg-gray-700 rounded-sm shadow-[-4px_4px_0_0_#1F2937]" />
    </div>

    {/* Notch */}
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
  </div>
);

const TabBar = ({ currentScene, setCurrentScene, isChatZoomed }) => {
  if (isChatZoomed) return null;
  const tabs = [
    { name: 'Match', icon: Heart, scene: 'MatchScene' },
    { name: 'Feed', icon: Zap, scene: 'FeedScene' },
    { name: 'Chat', icon: MessageSquare, scene: 'ChatScene' },
    { name: 'Perfil', icon: User, scene: 'ProfileScene' },
    { name: 'Ajustes', icon: Settings, scene: 'SettingsScene' },
  ];
  return (
    <div className="absolute bottom-0 w-full h-16 bg-white border-t border-orange-100 flex justify-around items-center z-30">
      {tabs.map((tab) => (
        <button
          key={tab.scene}
          onClick={() => setCurrentScene(tab.scene)}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            currentScene === tab.scene ? 'text-orange-500 font-bold' : 'text-gray-400 hover:text-orange-300'
          }`}
        >
          <tab.icon size={20} className="mb-0.5" />
          <span className="text-xs">{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

// --- ESCENA: MATCH ---
const MatchScene = ({ onNext }) => {
  const [showMatch, setShowMatch] = useState(false);
  const [cardSwipeStage, setCardSwipeStage] = useState(0); 
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matchedWith, setMatchedWith] = useState(null); 

  const currentProfile = profiles[currentProfileIndex];
  
  useEffect(() => {
    if (!showMatch && cardSwipeStage < 3) {
      const timer1 = setTimeout(() => setCardSwipeStage(1), 1500); 
      const timer2 = setTimeout(() => {
        setCardSwipeStage(2); 
        setMatchedWith(currentProfile.name); 
      }, 3000);
      const timer3 = setTimeout(() => {
        setShowMatch(true); 
      }, 4000); 
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    } else if (showMatch) {
      const resetTimer = setTimeout(() => {
        setShowMatch(false);
        setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % profiles.length); 
        setCardSwipeStage(0); 
        setMatchedWith(null);
      }, 7000); 
      return () => clearTimeout(resetTimer);
    }
  }, [cardSwipeStage, showMatch, currentProfileIndex, currentProfile.name]); 

  const handleLike = () => {
    if (cardSwipeStage < 2) {
      setCardSwipeStage(1); 
      setTimeout(() => {
        setCardSwipeStage(2); 
        setMatchedWith(currentProfile.name);
      }, 1500);
      setTimeout(() => { setShowMatch(true); }, 2500);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-orange-50">
      <div className="text-center py-4 bg-white border-b-2 border-orange-100">
        <Motion.h3 
          className="text-3xl font-black"
          style={{ 
            background: 'linear-gradient(90deg, #FF9966 0%, #FF6633 50%, #FF9966 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Pixelify Sans, sans-serif',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          tinder
        </Motion.h3>
      </div>

      <div className="flex-1 relative bg-orange-50">
        <AnimatePresence initial={false}>
          <Motion.div
            key={currentProfile.id}
            initial={{ x: -300, rotate: -25, opacity: 0 }} 
            animate={{
              x: cardSwipeStage === 2 ? 300 : 0, 
              rotate: cardSwipeStage === 2 ? 25 : 0,
              scale: cardSwipeStage === 2 ? 0.9 : 1,
              opacity: cardSwipeStage === 2 ? 0 : 1,
            }}
            exit={{ x: 300, rotate: 25, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="profile-card absolute inset-4 z-10 overflow-hidden shadow-2xl flex flex-col rounded-2xl bg-white"
          >
            <div className="flex-grow bg-orange-200 flex items-center justify-center relative">
              <img 
                src={currentProfile.image} 
                alt={currentProfile.name} 
                className="w-full h-full object-cover absolute inset-0" 
                onError={(e) => e.currentTarget.src = `https://placehold.co/400x400/FF6633/FFFFFF?text=${currentProfile.name}`}
              />
              
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

              {cardSwipeStage >= 2 && (
                <Motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-8 right-8 bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-xl border-4 border-white transform rotate-12 shadow-xl z-20"
                  style={{ backgroundColor: '#2ED573', textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}
                >
                  LIKE
                </Motion.div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-baseline space-x-2 mb-1">
                  <h4 className="text-3xl font-bold">{currentProfile.name}</h4>
                  <span className="text-3xl font-light">{currentProfile.age}</span>
                </div>
                <p className="text-base text-gray-100 leading-snug font-medium">{currentProfile.bio}</p>
              </div>
            </div>
          </Motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
          {showMatch && (
            <Motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center z-40"
              style={{ top: '-10%', bottom: '20%' }}
            >
              <div className="text-center relative">
                <Motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-6 relative z-10"
                >
                  <svg width="96" height="96" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="4" width="8" height="4" fill="#FF6633"/>
                    <rect x="8" y="8" width="16" height="4" fill="#FF6633"/>
                    <rect x="4" y="12" width="24" height="4" fill="#FF6633"/>
                    <rect x="8" y="16" width="16" height="4" fill="#FF6633"/>
                    <rect x="12" y="20" width="8" height="4" fill="#FF6633"/>
                    <rect x="16" y="24" width="4" height="4" fill="#FF6633"/>
                  </svg>
                </Motion.div>
                
                <Motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-8 relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-red-400"
                >
                  <h2 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"
                      style={{ fontFamily: 'Pixelify Sans, sans-serif', textShadow: '2px 2px 0px #8B4513' }}>
                    ¡MATCH!
                  </h2>
                  <Motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-xl text-gray-800 font-medium flex items-center justify-center space-x-2"
                  >
                    <span>A {matchedWith} también le gustas</span>
                    <PixelHeart size={28} color="#EA580C" /> 
                  </Motion.p>

                  <Motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-sm text-orange-600 mt-4 cursor-pointer hover:underline"
                    onClick={onNext}
                  >
                    Así comenzó nuestra pequeña historia juntos (Toca para ir al Chat)
                  </Motion.p>
                </Motion.div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white border-t border-orange-100 relative z-30">
        <div className="flex justify-center items-center space-x-6">
          <Motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-green-400/30 hover:shadow-green-400/50 transition-all"
            aria-label="Like"
            onClick={handleLike} 
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2ED573" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Motion.button>
        </div>
      </div>
    </div>
  );
};

// --- Mensajes de Chat (Bubble Component) ---
const ChatBubble = ({ message, progress }) => {
  const isNightMode = progress > 0.7; 

  if (message.type === 'timestamp') {
    return (
      <div className="text-center my-4">
        <span className={`text-xs px-3 py-1 rounded-full shadow-inner ${isNightMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {message.content}
        </span>
      </div>
    );
  }
  
  if (message.type.includes('blur')) {
    const isReceived = message.type === 'received_blur';
    return (
      <div className={`flex mb-2 ${isReceived ? 'justify-start' : 'justify-end'} opacity-40`}>
        <div 
          className={`max-w-[40%] px-4 py-2 rounded-xl shadow-inner`}
          style={{
            backgroundColor: isNightMode ? '#374151' : (isReceived ? '#E5E7EB' : '#FCD34D'), 
            color: isNightMode ? '#9CA3AF' : '#6B7280',
            fontFamily: 'Pixelify Sans, sans-serif',
            fontSize: '10px'
          }}
        >
          {isReceived ? 'Mensaje recibido...' : 'Mensaje enviado...'}
        </div>
      </div>
    );
  }

  const isSent = message.speaker === 'Brunella';
  const profile = isSent ? profiles.find(p => p.name === 'Brunella') : profiles.find(p => p.name === 'Manuel');

  return (
    <div className={`flex mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
      {!isSent && (
        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0 relative">
          <img 
            src={profile.image} 
            alt={profile.name} 
            className="w-full h-full object-cover" 
            onError={(e) => e.currentTarget.src = `https://placehold.co/32x32/FF6633/FFFFFF?text=${profile.name.charAt(0)}`}
          />
          <div className="absolute inset-0 border-2 border-gray-900 rounded-full shadow-inner"></div>
        </div>
      )}
      
      <Motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`max-w-xs px-4 py-3 rounded-xl shadow-md relative`}
        style={{
          backgroundColor: isNightMode ? (isSent ? '#7C3AED' : '#4B5563') : (isSent ? '#FEE2E2' : '#FFFFFF'), 
          borderColor: isNightMode ? (isSent ? '#C4B5FD' : '#9CA3AF') : (isSent ? '#FCA5A5' : '#D1D5DB'),
          borderWidth: '2px',
          borderStyle: 'solid',
          color: isNightMode ? '#FFFFFF' : '#374151'
        }}
      >
        <span className={`text-xs font-bold mb-1 block ${isSent ? 'text-red-700' : 'text-blue-700'}`}>
          {message.speaker}
        </span>
        <p className="text-sm leading-snug">{message.content}</p>
      </Motion.div>
      
      {isSent && <div className="w-8 h-8 ml-3 flex-shrink-0"></div>}
    </div>
  );
};

// --- ESCENA DE CHAT EN ZOOM (Controla el scroll y el progreso)
const ChatZoomScene = ({ onBack, onProgressChange, scrollProgress, onViaje }) => {
  const scrollRef = useRef(null); 
  const contentRef = useRef(null);
  const manualProfile = profiles.find(p => p.name === 'Manuel');

  const handleScroll = () => {
    if (!scrollRef.current || !contentRef.current) return;
    const { scrollTop, clientHeight } = scrollRef.current;
    const scrollHeight = contentRef.current.scrollHeight;
    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable > 0) {
      const progress = scrollTop / totalScrollable;
      onProgressChange(progress);
    } else {
      onProgressChange(0);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
      onProgressChange(0);
    }
  }, [onProgressChange]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 bg-white border-b-4 border-orange-500 shadow-md flex-shrink-0">
        <button onClick={onBack} className="text-gray-800 hover:text-orange-500 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center space-x-3 flex-1 ml-4">
          <div className="w-10 h-10 rounded-full overflow-hidden relative">
            <img src={manualProfile.image} alt={manualProfile.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = `https://placehold.co/40x40/FF6633/FFFFFF?text=${manualProfile.name.charAt(0)}`}/>
            <div className="absolute inset-0 border-2 border-green-500 rounded-full shadow-inner"></div> 
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800">{manualProfile.name}</h3>
            <p className="text-xs text-green-500 font-bold">Activo ahora</p>
          </div>
        </div>
        <Settings size={20} className="text-gray-400" />
      </div>

      {/* Chat Body */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto" 
        style={{ backgroundColor: 'transparent' }}
      >
        <div ref={contentRef} className="p-4 pt-8">
          {conversationData.map((msg, index) => (
            <ChatBubble key={index} message={msg} progress={scrollProgress} />
          ))}
          <div className="h-4"></div>
        </div>
      </div>

      {/* Input de chat */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center shadow-inner flex-shrink-0">
        <input 
          type="text" 
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-2 border-gray-300 focus:border-orange-500 focus:ring-0 text-sm"
        />
        <Motion.button 
          whileHover={{ scale: 1.05, rotate: 5, backgroundColor: '#F97316' }}
          whileTap={{ scale: 0.9, backgroundColor: '#EA580C' }}
          className="ml-2 p-3 bg-orange-500 rounded-full text-white shadow-lg transition-colors" 
          aria-label="Enviar"
          onClick={onViaje} /* ✅ Dispara el viaje a Huaraz */
        >
          <Send size={20} />
        </Motion.button>
      </div>
    </div>
  );
};

// (Otras escenas estáticas)
const ChatScene = ({ setCurrentScene, setChatZoomed }) => (
  <div className="h-full flex flex-col bg-white">
    <div className="text-center py-4 bg-white border-b-2 border-orange-100">
      <h3 className="text-2xl font-black text-gray-800">Mensajes</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-4 bg-orange-50">
      <h4 className="text-xl font-bold text-gray-700 mb-4">Nuevos Matches</h4>
      <div 
        className="p-3 bg-white rounded-lg shadow border border-green-400 flex items-center space-x-3 cursor-pointer hover:bg-green-50 transition-colors mb-6"
        onClick={() => setChatZoomed(true)} 
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 relative">
          <img src={profiles[1].image} alt={profiles[1].name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = `https://placehold.co/48x48/FF6633/FFFFFF?text=${profiles[1].name.charAt(0)}`}/>
          <div className="absolute inset-0 border-2 border-green-500 rounded-full shadow-inner"></div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{profiles[1].name}</p>
          <p className="text-sm text-gray-500">Duerme bien. Hablamos mañana.</p>
        </div>
        <span className="text-xs text-orange-500 font-semibold">Noche</span>
      </div>
      
      <h4 className="text-xl font-bold text-gray-700 mb-4">Chats</h4>
      <p className="text-center text-gray-600 mt-6 text-lg font-medium">
        <MessageSquare size={36} className="text-orange-400 mx-auto mb-3" />
        No hay más conversaciones.
      </p>
    </div>
  </div>
);

const ProfileScene = () => (
  <div className="h-full flex flex-col bg-white">
    <div className="text-center py-4 bg-white border-b-2 border-orange-100">
      <h3 className="text-2xl font-black text-gray-800">Mi Perfil</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-4 bg-orange-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200 mt-6">
        <User size={60} className="text-orange-500 mx-auto mb-4 p-2 bg-orange-100 rounded-full" />
        <h4 className="text-center text-2xl font-bold text-gray-800 mb-2">Usuario Actual</h4>
        <p className="text-center text-gray-600">Edad: 30 | Ocupación: Creador de Apps</p>
        <div className="mt-4 space-y-2">
          <button className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-md">
            Editar Información
          </button>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 mt-4">Nota: Esta es tu vista de edición.</p>
    </div>
  </div>
);

const FeedScene = () => (
  <div className="h-full flex flex-col bg-white">
    <div className="text-center py-4 bg-white border-b-2 border-orange-100">
      <h3 className="text-2xl font-black text-gray-800">Descubrimiento</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-4 bg-orange-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200 mt-6 text-center">
        <Zap size={48} className="text-yellow-500 mx-auto mb-4" fill="#FBBF24"/>
        <h4 className="text-xl font-bold text-gray-800 mb-2">¡Aquí es donde brillas!</h4>
        <p className="text-gray-600">Esta sección muestra perfiles que son Super Likes o que tienen intereses en común. Desliza para empezar a descubrir.</p>
      </div>
    </div>
  </div>
);

const SettingsScene = () => (
  <div className="h-full flex flex-col bg-white">
    <div className="text-center py-4 bg-white border-b-2 border-orange-100">
      <h3 className="text-2xl font-black text-gray-800">Configuración</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-4 bg-orange-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200 mt-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-700">Distancia Máxima (10km)</span>
          <input type="range" className="w-1/3 accent-orange-500" />
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-700">Modo Oscuro</span>
          <input type="checkbox" className="accent-orange-500 w-5 h-5" />
        </div>
        <button className="w-full py-3 mt-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-md">
          Guardar Cambios
        </button>
      </div>
      <p className="text-xs text-center text-gray-500 mt-4">Versión 1.0 PixelMatch</p>
    </div>
  </div>
);

// --- APP PRINCIPAL ---
const App = () => {
  const [currentScene, setCurrentScene] = useState('MatchScene'); 
  const [isChatZoomed, setChatZoomed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); 
  const [mostrarViaje, setMostrarViaje] = useState(false);
  const [mostrarRecuerdo, setMostrarRecuerdo] = useState(false);

  // Función para calcular el color HSL interpolado basado en el progreso
  const calculateBackgroundColor = (p) => {
    const H_DAY = 200; const S_DAY = 70; const L_DAY = 85;
    const H_SUN = 40;  const S_SUN = 90; const L_SUN = 65;
    const H_NIGHT = 240; const S_NIGHT = 50; const L_NIGHT = 15;

    const p1 = Math.min(1, p * 2);
    const hMix = H_DAY + (H_SUN - H_DAY) * p1;
    const sMix = S_DAY + (S_SUN - S_DAY) * p1;
    const lMix = L_DAY + (L_SUN - L_DAY) * p1;

    const p2 = Math.max(0, (p - 0.5) * 2);
    const hFinal = hMix + (H_NIGHT - hMix) * p2;
    const sFinal = sMix + (S_NIGHT - sMix) * p2;
    const lFinal = lMix + (L_NIGHT - lMix) * p2;

    const color1 = `hsl(${hFinal}, ${sFinal}%, ${lFinal}%)`;
    const color2 = `hsl(${hFinal}, ${sFinal}%, ${Math.min(100, lFinal * 1.5)}%)`; 
    const starOpacity = Math.max(0, (p - 0.7) * 3.3) * 0.8;
    const sunOpacity = 1 - p;

    return { background: `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`, starOpacity, sunOpacity };
  };
  
  const { background, starOpacity, sunOpacity } = calculateBackgroundColor(scrollProgress);

  // Ramas de render para Viaje y Recuerdo
  if (mostrarViaje) {
    return (
      <ViajeHuaraz
        onFinish={() => {
          setMostrarViaje(false);
          setMostrarRecuerdo(true);
        }}
      />
    );
  }

  if (mostrarRecuerdo) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-600 to-pink-600 text-white text-center p-10">
        <h1 className="text-5xl font-black mb-4">Recuerdo Especial</h1>
        <p className="text-lg max-w-md leading-relaxed">
          Aquella lluvia en la laguna fue más que un viaje... fue el comienzo de algo inolvidable.
        </p>
        <button
          onClick={() => setMostrarRecuerdo(false)}
          className="mt-8 px-6 py-3 bg-white/90 text-orange-700 font-bold rounded-lg shadow-lg"
        >
          Volver al chat ❤️
        </button>
      </div>
    );
  }

  const renderScene = () => {
    if (isChatZoomed) {
      return (
        <ChatZoomScene 
          onBack={() => { setChatZoomed(false); setScrollProgress(0); }}
          onProgressChange={setScrollProgress} 
          scrollProgress={scrollProgress}
          onViaje={() => setMostrarViaje(true)} /* ✅ integrar viaje */
        />
      );
    }

    switch (currentScene) {
      case 'MatchScene':
        return <MatchScene onNext={() => { setCurrentScene('ChatScene'); setChatZoomed(true); }} />;
      case 'ChatScene':
        return <ChatScene setCurrentScene={setCurrentScene} setChatZoomed={setChatZoomed} />;
      case 'ProfileScene':
        return <ProfileScene />;
      case 'FeedScene':
        return <FeedScene />;
      case 'SettingsScene':
        return <SettingsScene />;
      default:
        return <MatchScene onNext={() => { setCurrentScene('ChatScene'); setChatZoomed(true); }} />;
    }
  };

  return (
    <>
      {/* Estilos para el fondo dinámico y las estrellas */}
      <style>
        {`
          .stars-bg {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; opacity: ${starOpacity};
            background-image: 
              radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 0),
              radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0);
            background-size: 50px 50px, 150px 150px;
            background-position: 0 0, 15px 15px;
            transition: opacity 2s ease-in-out; z-index: 0;
          }
          .sun-glow {
            position: absolute; top: 15%; right: 15%; width: 150px; height: 150px; border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 204, 0, 0.8) 0%, rgba(255, 102, 0, 0.6) 20%, transparent 70%);
            opacity: ${sunOpacity}; transition: opacity 1s ease-out; pointer-events: none; filter: blur(20px); z-index: 1;
          }
        `}
      </style>

      {/* Fondo principal */}
      <div 
        className={`min-h-screen w-full pt-16 pb-8 flex flex-col items-center transition-all duration-700 relative`}
        style={{ background: background, color: scrollProgress > 0.7 ? 'white' : 'black' }}
      >
        <div className="stars-bg"></div>
        <div className="sun-glow"></div>

        {!isChatZoomed && (
          <div className="mb-8 mt-4 text-center relative z-20">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-800"
                style={{ textShadow: '3px 3px 0px #8B4513, 6px 6px 0px rgba(0,0,0,0.1)' }}>
              El Match
            </h1>
          </div>
        )}
        
        {/* Marco + Contenido */}
        <PixelFrame>
          <div className="h-full flex flex-col relative">
            <div className="flex justify-between items-center px-8 py-3 bg-white border-b border-orange-100 z-50">
              <span className="font-bold text-gray-900 text-sm">9:41</span>
            </div>

            <div className="flex-1 relative overflow-hidden" style={{ paddingBottom: isChatZoomed ? '0px' : '64px' }}>
              {renderScene()}
            </div>

            <TabBar currentScene={currentScene} setCurrentScene={setCurrentScene} isChatZoomed={isChatZoomed} />
          </div>
        </PixelFrame>
      </div>
    </>
  );
};

export default App;
