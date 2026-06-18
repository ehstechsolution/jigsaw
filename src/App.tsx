import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Home,
  Tv,
  Store,
  Users2,
  Gamepad,
  Search,
  Grid,
  MessageCircle,
  Bell,
  ChevronDown,
  Plus,
  Compass,
  CheckCircle,
  Globe,
  CircleAlert
} from "lucide-react";
import { PostState, ReactionType } from "./types";
import PostCard from "./components/PostCard";
import Lightbox from "./components/Lightbox";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDocFromCache } from "firebase/firestore";
import { getOrCreateVisitorProfile, VisitorProfile } from "./utils/visitor";

const DEFAULT_STATE: PostState = {
  likesCount: 342,
  reactionsCount: {
    like: 210,
    love: 104,
    care: 16,
    haha: 0,
    wow: 12,
    sad: 0,
    angry: 0,
  },
  currentUserReaction: null,
  sharesCount: 28,
  pageName: "Magig Presentes",
  pageAvatar: "https://res.cloudinary.com/dujniwlkm/image/upload/v1781804507/motociclo_transparente_irgpsb.png",
  postTimeFormatted: "15 de junho às 10:00",
  comments: [
    {
      id: "c1",
      authorName: "Mariana Silva",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
      content: "Que legal! Estava ansiosa para ver as novidades da loja física. Vou levar toda a família no sábado! 😍🎁 Já estava com saudades do atendimento sensacional de vocês!",
      timestamp: "2 h",
      likesCount: 14,
      hasLiked: false,
      replies: [
        {
          id: "r1",
          authorName: "Magig Presentes",
          authorAvatar: "https://res.cloudinary.com/dujniwlkm/image/upload/v1781804507/motociclo_transparente_irgpsb.png",
          content: "Uhul! Ficaremos lisonjeados em receber todos vocês, Mariana! Preparamos uma surpresa linda e muitas opções incríveis de presentes! 🎁✨",
          timestamp: "1 h",
          likesCount: 4,
          hasLiked: false,
          isPageOwner: true,
        },
      ],
    },
    {
      id: "c2",
      authorName: "Rodrigo Santos",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
      content: "Qual será o novo endereço de vocês em Paulistânia? Tem um ponto de referência?",
      timestamp: "3 h",
      likesCount: 2,
      hasLiked: false,
      replies: [
        {
          id: "r2",
          authorName: "Magig Presentes",
          authorAvatar: "https://res.cloudinary.com/dujniwlkm/image/upload/v1781804507/motociclo_transparente_irgpsb.png",
          content: "Olá Rodrigo! Nosso novo espaço será na própria rodoviária de Paulistânia/SP. Super fácil de encontrar! Teremos muitas opções lindas esperando por você. Esperamos sua visita! 🗺️🎁✨",
          timestamp: "2 h",
          likesCount: 5,
          hasLiked: false,
          isPageOwner: true,
        },
      ],
    },
    {
      id: "c3",
      authorName: "Beatriz Souza",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
      content: "A melhor loja de presentes agora em Paulistânia/SP! Já quero ir visitar na rodoviária. Desejo todo o sucesso do mundo para vocês nessa nova fase! ❤️🥰",
      timestamp: "4 h",
      likesCount: 24,
      hasLiked: false,
      replies: [],
    },
  ],
};

const shortcuts = [
  { label: "Amigos", icon: "👥" },
  { label: "Grupos", icon: "💬", badge: "9+" },
  { label: "Marketplace", icon: "🛒" },
  { label: "Watch", icon: "📺" },
  { label: "Lembranças", icon: "⌛" },
  { label: "Salvos", icon: "🔰" },
  { label: "Páginas", icon: "🏳️" },
  { label: "Eventos", icon: "📅" },
];

const onlineContacts = [
  { name: "Carlos Eduardo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80" },
  { name: "Luciana Costa", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" },
  { name: "Gabriel Mendes", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
  { name: "Fernanda Lima", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80" },
  { name: "Vinícius Souza", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&q=80" },
];

export default function App() {
  const [visitor] = useState<VisitorProfile>(() => getOrCreateVisitorProfile());
  const [localReaction, setLocalReaction] = useState<ReactionType>(() => {
    try {
      const stored = localStorage.getItem("fb_local_reaction");
      return stored ? (JSON.parse(stored) as ReactionType) : null;
    } catch (e) {
      return null;
    }
  });

  const [dbPostState, setDbPostState] = useState<PostState>(DEFAULT_STATE);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // 1. Listen to real-time updates from Firestore
  useEffect(() => {
    const postRef = doc(db, "post", "main");

    const unsubscribe = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<PostState, 'currentUserReaction'>;
        
        // Force upgrade database items to new name & avatar or if they still have old comment contents
        const dbCommentsStr = data.comments ? JSON.stringify(data.comments) : "";
        const hasOldContent = !data.comments || 
          dbCommentsStr.includes("pistache") || 
          dbCommentsStr.includes("Rua das Acácias") || 
          dbCommentsStr.includes("Praça Central") ||
          data.pageName !== "Magig Presentes";

        if (hasOldContent) {
          const updated = {
            ...data,
            pageName: "Magig Presentes",
            pageAvatar: "https://res.cloudinary.com/dujniwlkm/image/upload/v1781804507/motociclo_transparente_irgpsb.png",
            comments: DEFAULT_STATE.comments
          };
          setDoc(postRef, updated).catch((err) => console.error("Error migrating branding:", err));
          setDbPostState({
            ...DEFAULT_STATE,
            ...updated,
            currentUserReaction: localReaction
          });
        } else {
          setDbPostState({
            ...DEFAULT_STATE,
            ...data,
            currentUserReaction: localReaction
          });
        }
      } else {
        // Seed default post state if missing
        setDoc(postRef, {
          likesCount: DEFAULT_STATE.likesCount,
          reactionsCount: DEFAULT_STATE.reactionsCount,
          sharesCount: DEFAULT_STATE.sharesCount,
          comments: DEFAULT_STATE.comments,
          pageName: DEFAULT_STATE.pageName,
          pageAvatar: DEFAULT_STATE.pageAvatar,
          postTimeFormatted: DEFAULT_STATE.postTimeFormatted
        }).catch((err) => console.error("Error seeding default post:", err));
        
        setDbPostState(DEFAULT_STATE);
      }
    }, (error) => {
      console.error("Firestore read error:", error);
    });

    return () => unsubscribe();
  }, [localReaction]);

  // Combined state
  const postState: PostState = {
    ...dbPostState,
    currentUserReaction: localReaction
  };

  // Custom setPostState that updates both localStorage (for user specific reaction) and Firestore (for global variables)
  const customSetPostState = async (valueOrUpdater: React.SetStateAction<PostState>) => {
    let nextUnifiedState: PostState;
    if (typeof valueOrUpdater === "function") {
      nextUnifiedState = valueOrUpdater(postState);
    } else {
      nextUnifiedState = valueOrUpdater;
    }

    // Save reaction to local storage
    const nextReaction = nextUnifiedState.currentUserReaction;
    if (nextReaction !== localReaction) {
      setLocalReaction(nextReaction);
      localStorage.setItem("fb_local_reaction", JSON.stringify(nextReaction));
    }

    // Save back to Firestore
    const postRef = doc(db, "post", "main");
    try {
      await setDoc(postRef, {
        likesCount: nextUnifiedState.likesCount,
        reactionsCount: nextUnifiedState.reactionsCount,
        sharesCount: nextUnifiedState.sharesCount,
        comments: nextUnifiedState.comments,
        pageName: nextUnifiedState.pageName,
        pageAvatar: nextUnifiedState.pageAvatar,
        postTimeFormatted: nextUnifiedState.postTimeFormatted
      });
    } catch (err) {
      console.error("Error saving post to Firestore:", err);
    }
  };

  // Close lightbox with Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div id="facebook-root" className="bg-[#f0f2f5] min-h-screen text-[#050505] font-sans antialiased">
      
      {/* 1. TOP HEADER (DESKTOP VERSION) */}
      <header id="fb-header" className="hidden md:flex sticky top-0 bg-white h-14 border-b border-gray-200 px-4 items-center justify-between z-40 shadow-xs">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2 flex-1 max-w-[320px]">
          <div className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center text-white font-black text-3xl tracking-tighter select-none cursor-pointer">
            f
          </div>
          <div className="flex items-center bg-[#f0f2f5] rounded-full px-3 py-2 w-full max-w-[240px] border border-transparent focus-within:border-gray-200 transition">
            <Search className="w-4.5 h-4.5 text-[#65676b] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar no Facebook"
              className="bg-transparent text-[14px] text-[#050505] placeholder-[#65676b] outline-none w-full border-none"
            />
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center h-full flex-1 max-w-[680px] justify-center">
          <button className="flex items-center justify-center h-full px-12 border-b-4 border-[#1877f2] text-[#1877f2] cursor-pointer">
            <Home className="w-6.5 h-6.5" />
          </button>
          <button className="flex items-center justify-center h-full px-12 border-b-4 border-transparent text-[#65676b] hover:bg-gray-100 rounded-md my-1 h-[48px] cursor-pointer">
            <Tv className="w-6.5 h-6.5" />
          </button>
          <button className="flex items-center justify-center h-full px-12 border-b-4 border-transparent text-[#65676b] hover:bg-gray-100 rounded-md my-1 h-[48px] cursor-pointer">
            <Store className="w-6.5 h-6.5" />
          </button>
          <button className="flex items-center justify-center h-full px-12 border-b-4 border-transparent text-[#65676b] hover:bg-gray-100 rounded-md my-1 h-[48px] cursor-pointer">
            <Users2 className="w-6.5 h-6.5" />
          </button>
          <button className="flex items-center justify-center h-full px-12 border-b-4 border-transparent text-[#65676b] hover:bg-gray-100 rounded-md my-1 h-[48px] cursor-pointer">
            <Gamepad className="w-6.5 h-6.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-1 justify-end max-w-[320px]">
          <button className="p-2.5 bg-[#e4e6eb] hover:bg-[#d8dadf] rounded-full transition cursor-pointer" title="Menu">
            <Grid className="w-5 h-5 text-black" />
          </button>
          <button className="p-2.5 bg-[#e4e6eb] hover:bg-[#d8dadf] rounded-full transition cursor-pointer relative" title="Messenger">
            <MessageCircle className="w-5 h-5 text-black" />
            <span className="absolute -top-1.5 -right-1 bg-[#e41e3f] text-white text-[11px] font-bold px-1.5 rounded-full">
              4
            </span>
          </button>
          <button className="p-2.5 bg-[#e4e6eb] hover:bg-[#d8dadf] rounded-full transition cursor-pointer relative" title="Notificações">
            <Bell className="w-5 h-5 text-black" />
            <span className="absolute -top-1.5 -right-1 bg-[#e41e3f] text-white text-[11px] font-bold px-1.5 rounded-full">
              2
            </span>
          </button>

          <div className="flex items-center ml-1 border-l border-gray-300 pl-3 gap-1.5 cursor-pointer hover:opacity-95 select-none" title={`Perfil de ${visitor.name}`}>
            <img
              src={visitor.avatar}
              alt="Seu Perfil"
              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            />
            <ChevronDown className="w-4 h-4 text-[#65676b]" />
          </div>
        </div>
      </header>

      {/* 1. TOP HEADER (MOBILE VERSION) */}
      <header id="fb-header-mobile" className="flex md:hidden bg-white px-4 py-2.5 items-center justify-between sticky top-0 z-45 border-b border-gray-200 shadow-xs">
        <span className="text-[#1877f2] font-extrabold text-2xl tracking-tight select-none">
          facebook
        </span>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-[#f0f2f5] hover:bg-gray-200 rounded-full transition cursor-pointer">
            <Plus className="w-5 h-5 text-black" />
          </button>
          <button className="p-2 bg-[#f0f2f5] hover:bg-[#e4e6eb] rounded-full transition cursor-pointer">
            <Search className="w-5 h-5 text-black" />
          </button>
          <button className="p-2 bg-[#f0f2f5] hover:bg-[#e4e6eb] rounded-full transition relative cursor-pointer">
            <MessageCircle className="w-5 h-5 text-black" />
            <span className="absolute -top-1.5 -right-1 bg-red-600 text-white font-bold text-[9px] rounded-full px-1.5">
              4
            </span>
          </button>
        </div>
      </header>

      {/* 2. MAIN FEED GRID COVERS RESPONSIVELY */}
      <div id="main-content-layout" className="max-w-[1250px] xl:max-w-[1380px] mx-auto flex gap-6 px-0 md:px-4">
        
        {/* LEFT SIDEBAR (DESKTOP ONLY) */}
        <aside id="left-sidebar" className="hidden lg:flex flex-col w-[240px] xl:w-[260px] shrink-0 pt-4 max-h-[calc(100vh-56px)] overflow-y-auto sticky top-14 space-y-1">
          <div className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg cursor-pointer transition select-none">
            <img
              src={visitor.avatar}
              alt="Seu Perfil"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
            <span className="font-semibold text-sm">Você ({visitor.name})</span>
          </div>

          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-2.5 hover:bg-gray-200 rounded-lg cursor-pointer transition select-none text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="text-xl w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center select-none">{sc.icon}</span>
                <span>{sc.label}</span>
              </div>
              {sc.badge && (
                <span className="bg-[#1877f2] text-white text-[11px] font-bold px-1.5 rounded-md">
                  {sc.badge}
                </span>
              )}
            </div>
          ))}

          <div className="h-[1px] bg-gray-300 my-2 mx-2" />
          <div className="px-2 pb-1 text-xs font-semibold text-[#65676b]">Seus atalhos</div>
          <div className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg cursor-pointer transition select-none">
            <img src={postState.pageAvatar} className="w-9 h-9 rounded-md object-cover" alt={postState.pageName} />
            <span className="font-medium text-xs sm:text-sm truncate">{postState.pageName}</span>
          </div>
        </aside>

        {/* MIDDLE COLUMN: THE ESSENTIAL SINGLE POST */}
        <main id="center-main-feed" className="flex-1 max-w-[590px] w-full mx-auto pt-2 md:pt-4 pb-12 flex flex-col gap-4">
          
          {/* USER INTERACTION BAR (DESKTOP ONLY AS QUICK FILLER) */}
          <div className="hidden md:block bg-white rounded-lg p-3 shadow-xs border border-gray-200 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={visitor.avatar}
                alt="Seu avatar"
                className="w-10 h-10 rounded-full border border-gray-100 object-cover"
              />
              <button
                type="button"
                className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6eb] text-left rounded-full px-4 py-2.5 text-sm text-[#65676b] font-normal transition select-none cursor-pointer"
              >
                No que você está pensando?
              </button>
            </div>
            <div className="h-[1px] bg-gray-200" />
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#65676b] font-semibold select-none pt-0.5">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg flex-1 cursor-pointer justify-center transition">
                <span className="text-xl">📹</span>
                <span>Vídeo ao vivo</span>
              </button>
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg flex-1 cursor-pointer justify-center transition">
                <span className="text-xl">📷</span>
                <span>Foto/vídeo</span>
              </button>
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg flex-1 cursor-pointer justify-center transition">
                <span className="text-xl">💛</span>
                <span>Sentimento</span>
              </button>
            </div>
          </div>



          {/* O CARTE POST PRINCIPAL */}
          <div className="mx-2 md:mx-0">
            <PostCard
              postState={postState}
              setPostState={customSetPostState}
              onImageClick={() => setIsLightboxOpen(true)}
            />
          </div>

          {/* FEED FOOTER SIMULATING BOTTOM */}
          <div className="p-8 text-center text-xs text-gray-400 font-medium">
            Fim das publicações recentes de Magig Presentes
          </div>
        </main>

        {/* RIGHT SIDEBAR (DESKTOP ONLY) */}
        <aside id="right-sidebar" className="hidden xl:flex flex-col w-[260px] pt-4 space-y-4">
          <div>
            <span className="text-[#65676b] font-semibold text-[15px] select-none pl-2">Patrocinado</span>
            <div className="space-y-3 mt-2">
              <a href="#" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition">
                <img
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop&q=80"
                  alt="Anúncio Cafés"
                  className="w-24 h-16 rounded-md object-cover"
                />
                <div>
                  <div className="font-semibold text-xs leading-tight">Cafés Gourmet 100% Arábica</div>
                  <div className="text-[11px] text-[#65676b] mt-0.5">cafebrasileiro.com.br</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition">
                <img
                  src="https://images.unsplash.com/photo-1511018556340-d16986a1c194?w=150&h=150&fit=crop&q=80"
                  alt="Propaganda Panificadora"
                  className="w-24 h-16 rounded-md object-cover"
                />
                <div>
                  <div className="font-semibold text-xs leading-tight">Curso Confeitaria Fina</div>
                  <div className="text-[11px] text-[#65676b] mt-0.5">escolaartesabor.com</div>
                </div>
              </a>
            </div>
          </div>

          <div className="h-[1px] bg-gray-300" />

          {/* Contatos Online */}
          <div className="flex flex-col">
            <span className="text-[#65676b] font-semibold text-[15px] select-none pl-2">Contatos</span>
            <div className="space-y-1 mt-2">
              {onlineContacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-200 rounded-lg cursor-pointer transition select-none">
                  <div className="relative">
                    <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full border border-gray-200 animate-pulse-slow" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#31a24c] border-[1.5px] border-white rounded-full" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* FULLSTAGE LIGHTBOX DIALOG */}
      <AnimatePresence>
        {isLightboxOpen && (
          <Lightbox
            postState={postState}
            setPostState={customSetPostState}
            onClose={() => setIsLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
