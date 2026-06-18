import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Globe,
  MoreHorizontal,
  X,
  Smile,
  Camera,
  Image,
  Send,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { Comment, PostState, ReactionType } from "../types";
import ReactionFlyout from "./ReactionFlyout";
import { getOrCreateVisitorProfile, getRandomFakeProfile } from "../utils/visitor";

interface PostCardProps {
  postState: PostState;
  setPostState: React.Dispatch<React.SetStateAction<PostState>>;
  onImageClick?: () => void;
  isCompact?: boolean;
}

const REACTION_EMOJIS: Record<string, string> = {
  like: "👍",
  love: "❤️",
  care: "🥰",
  haha: "😆",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

const REACTION_LABELS: Record<string, string> = {
  like: "Curtir",
  love: "Amei",
  care: "Força",
  haha: "Haha",
  wow: "Uau",
  sad: "Triste",
  angry: "Raiva",
};

const REACTION_COLORS: Record<string, string> = {
  like: "text-[#1877f2] font-semibold",
  love: "text-[#f33e5b] font-semibold",
  care: "text-[#f5c33b] font-semibold",
  haha: "text-[#f5c33b] font-semibold",
  wow: "text-[#f5c33b] font-semibold",
  sad: "text-[#f5c33b] font-semibold",
  angry: "text-[#e96630] font-semibold",
};

export default function PostCard({ postState, setPostState, onImageClick, isCompact = false }: PostCardProps) {
  const [visitor] = useState(() => getOrCreateVisitorProfile());
  const [showReactionFlyout, setShowReactionFlyout] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [activeReplyToId, setActiveReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLikeClick = () => {
    if (postState.currentUserReaction) {
      // Remove reaction
      const prevReaction = postState.currentUserReaction;
      setPostState((prev) => {
        const nextReactionsCount = { ...prev.reactionsCount };
        nextReactionsCount[prevReaction] = Math.max(0, nextReactionsCount[prevReaction] - 1);
        return {
          ...prev,
          currentUserReaction: null,
          likesCount: prev.likesCount - 1,
          reactionsCount: nextReactionsCount,
        };
      });
    } else {
      // Add standard like
      setPostState((prev) => {
        const nextReactionsCount = { ...prev.reactionsCount };
        nextReactionsCount.like += 1;
        return {
          ...prev,
          currentUserReaction: "like",
          likesCount: prev.likesCount + 1,
          reactionsCount: nextReactionsCount,
        };
      });
    }
  };

  const handleSelectReaction = (rxType: ReactionType) => {
    setShowReactionFlyout(false);
    if (!rxType) return;

    setPostState((prev) => {
      const nextReactionsCount = { ...prev.reactionsCount };
      let delta = 0;

      // Deduct old reaction
      if (prev.currentUserReaction) {
        nextReactionsCount[prev.currentUserReaction] = Math.max(0, nextReactionsCount[prev.currentUserReaction] - 1);
      } else {
        delta = 1; // standard count increment
      }

      // Add new reaction
      nextReactionsCount[rxType] = (nextReactionsCount[rxType] || 0) + 1;

      return {
        ...prev,
        currentUserReaction: rxType,
        likesCount: prev.likesCount + delta,
        reactionsCount: nextReactionsCount,
      };
    });
  };

  // Helper to generate a new comment object
  const createNewCommentObj = (text: string, isPageOwner = false): Comment => {
    const fakeProfile = getRandomFakeProfile();
    return {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorName: isPageOwner ? postState.pageName : fakeProfile.name,
      authorAvatar: isPageOwner
        ? postState.pageAvatar
        : fakeProfile.avatar,
      content: text,
      timestamp: "1 seg",
      likesCount: 0,
      hasLiked: false,
      replies: [],
      isPageOwner,
    };
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const freshComment = createNewCommentObj(newCommentText, false);
    setPostState((prev) => ({
      ...prev,
      comments: [freshComment, ...prev.comments],
    }));

    setNewCommentText("");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;

    setPostState((prev) => {
      const updatedComments = prev.comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), createNewCommentObj(replyText, false)],
          };
        }
        return c;
      });

      return {
        ...prev,
        comments: updatedComments,
      };
    });

    setReplyText("");
    setActiveReplyToId(null);
  };

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    setPostState((prev) => {
      const updatedComments = prev.comments.map((c) => {
        if (!isReply && c.id === commentId) {
          return {
            ...c,
            likesCount: c.hasLiked ? c.likesCount - 1 : c.likesCount + 1,
            hasLiked: !c.hasLiked,
          };
        }
        if (isReply && c.id === parentId) {
          const updatedReplies = (c.replies || []).map((r) => {
            if (r.id === commentId) {
              return {
                ...r,
                likesCount: r.hasLiked ? r.likesCount - 1 : r.likesCount + 1,
                hasLiked: !r.hasLiked,
              };
            }
            return r;
          });
          return { ...c, replies: updatedReplies };
        }
        return c;
      });

      return { ...prev, comments: updatedComments };
    });
  };

  const handleShareClick = () => {
    setShowShareSuccess(true);
    setPostState((prev) => ({
      ...prev,
      sharesCount: prev.sharesCount + 1,
    }));
    setTimeout(() => {
      setShowShareSuccess(false);
    }, 2500);
  };

  const handleMouseEnterLike = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowReactionFlyout(true);
  };

  const handleMouseLeaveLike = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionFlyout(false);
    }, 4000);
  };

  // Compute standard reaction statistics
  const sortedReactions = Object.entries(postState.reactionsCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);

  return (
    <div id="facebook-post-card" className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 1. CABEÇALHO DO POST */}
      <div id="postcard-header" className="flex items-center justify-between p-3 pb-2.5">
        <div className="flex items-center gap-2">
          {/* Avatar com efeito de hover circular do Facebook */}
          <div className="relative group cursor-pointer">
            <img
              id="page-avatar-img"
              src={postState.pageAvatar}
              alt={postState.pageName}
              loading="lazy"
              className="w-10 h-10 rounded-full border border-gray-100 hover:brightness-95 transition"
            />
            <div className="absolute right-0 bottom-0 bg-[#31a24c] border-[1.5px] border-white w-2.5 h-2.5 rounded-full" />
          </div>

          <div>
            {/* Nome da página com selo azul verificado */}
            <div className="flex items-center gap-1">
              <span id="page-name-display" className="font-semibold text-[15px] text-[#050505] hover:underline cursor-pointer">
                {postState.pageName}
              </span>
              <span id="verified-badge-wrap" className="text-[#1877f2]" title="Página verificada oficial">
                <CheckCircle className="w-[14px] h-[14px] fill-current text-white bg-[#1877f2] rounded-full" />
              </span>
            </div>

            {/* Sub-header com hora e privacidade */}
            <div className="flex items-center gap-1.5 text-xs text-[#65676b] font-normal">
              <span className="hover:underline cursor-pointer">{postState.postTimeFormatted}</span>
              <span>·</span>
              <span title="Público" className="cursor-pointer">
                <Globe className="w-3 h-3 text-[#65676b]" />
              </span>
            </div>
          </div>
        </div>

        {/* Canto direito superior com opções */}
        <div className="flex items-center gap-1 text-[#65676b]">
          <button id="post-options-btn" className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
            <MoreHorizontal className="w-5 h-5 text-[#65676b]" />
          </button>
          <button id="post-close-btn" className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
            <X className="w-5 h-5 text-[#65676b]" />
          </button>
        </div>
      </div>

      {/* 2. CORPO DO TEXTO */}
      <div id="postcard-body" className="px-3 pb-3 text-[15px] text-[#050505] leading-relaxed whitespace-pre-wrap">
        📢 <strong>AVISO IMPORTANTE E NOVIDADE!</strong> 💕<br /><br />
        Queridos clientes e amigos da <strong>Magig Presentes</strong>, <br />
        Temos um comunicado super especial para compartilhar com vocês! Estamos encerrando nossas atividades na unidade da <strong>Rodoviária de Lençóis Paulista</strong> para dar início a um novo capítulo maravilhoso. 🚌✨<br /><br />
        🚀 <strong>Nossa nova loja oficial será em Paulistânia/SP!</strong> <br />
        Estamos preparando um espaço incrível, aconchegante e recheado com aquela maravilhosa coleção de novidades, mimos e opções exclusivas de presentes que vocês já amam e conhecem. Vamos trazer ainda mais carinho e posts recheados de novidades para vocês! 🎁❤️<br /><br />
        Agradecemos de coração a cada cliente de Lençóis Paulista pelos momentos maravilhosos que passamos juntos, e convidamos a todos a nos visitarem em Paulistânia! O nosso coquetel de inauguração será no próximo sábado. Esperamos vocês de braços abertos!<br /><br />
        <span className="text-[#1877f2] font-normal cursor-pointer hover:underline">#MagigPresentes</span>{" "}
        <span className="text-[#1877f2] font-normal cursor-pointer hover:underline">#NovaFase</span>{" "}
        <span className="text-[#1877f2] font-normal cursor-pointer hover:underline">#PaulistaniaSP</span>{" "}
        <span className="text-[#1877f2] font-normal cursor-pointer hover:underline">#Inauguracao</span>{" "}
        <span className="text-[#1877f2] font-normal cursor-pointer hover:underline">#PresentesComAmor</span>
      </div>

      {/* 3. ÁREA DA MÍDIA (FOTO OFICIAL) */}
      <div id="postcard-media" className="relative group overflow-hidden bg-gray-50 border-y border-gray-100">
        <img
          id="postcard-official-image"
          src="https://res.cloudinary.com/dujniwlkm/image/upload/v1781803463/MAGIG_uu6ich.png"
          alt="Foto Oficial da Inauguração"
          loading="lazy"
          className="w-full h-auto max-h-[500px] object-cover hover:brightness-[0.98] transition duration-150 cursor-zoom-in"
          onClick={onImageClick}
        />
        <div 
          onClick={onImageClick}
          className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-150 cursor-zoom-in flex items-center justify-center"
        >
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">
            Clique para ampliar 🔎
          </span>
        </div>
      </div>

      {/* 4. BARRA DE ENGAJAMENTO (CONTADORES DE REAÇÕES) */}
      <div id="postcard-engagement-row" className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 text-[#65676b] text-[13px] sm:text-sm select-none">
        {/* Reações no estilo original do Facebook overlapping */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="flex -space-x-1 items-center">
            {sortedReactions.slice(0, 3).map((type, i) => (
              <div
                key={type}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs border border-white relative"
                style={{ zIndex: 10 - i }}
              >
                <span className="text-[14px] leading-none select-none">{REACTION_EMOJIS[type]}</span>
              </div>
            ))}
            {sortedReactions.length === 0 && (
              <div className="w-5 h-5 rounded-full bg-[#1877f2] flex items-center justify-center text-white text-[10px]">
                👍
              </div>
            )}
          </div>
          <span id="postcard-engagement-reaction-text" className="text-[#65676b]">
            {postState.currentUserReaction ? (
              <>
                Você e outras{" "}
                <strong className="font-semibold text-[#050505]">
                  {(postState.likesCount - 1).toLocaleString()} pessoas
                </strong>
              </>
            ) : (
              <>
                <strong className="font-semibold text-[#050505]">
                  {postState.likesCount.toLocaleString()}
                </strong>
              </>
            )}
          </span>
        </div>

        {/* Quantidade de Comentários e Compartilhamentos */}
        <div id="postcard-engagement-counters-right" className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">
            {postState.comments.length +
              postState.comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)}{" "}
            comentários
          </span>
          <span className="hover:underline cursor-pointer">
            {postState.sharesCount} compartilhamentos
          </span>
        </div>
      </div>

      {/* 5. BARRA DE AÇÕES (BOTÕES DE CURTIR, COMENTAR, COMPARTILHAR) */}
      <div id="postcard-actions-bar" className="relative flex items-center justify-between px-2 py-1 border-b border-gray-200">
        {/* Botão de Curtir com Hover Flyout */}
        <div
          className="relative flex-1"
          onMouseEnter={handleMouseEnterLike}
          onMouseLeave={handleMouseLeaveLike}
        >
          <button
            id="action-like-trigger-btn"
            type="button"
            onClick={handleLikeClick}
            className={`w-full py-2 hover:bg-gray-100 rounded-md transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer text-sm sm:text-base ${
              postState.currentUserReaction ? REACTION_COLORS[postState.currentUserReaction] : "text-[#65676b] font-medium"
            }`}
          >
            {postState.currentUserReaction ? (
              <span className="text-lg filter drop-shadow-xs transform active:scale-90 animate-pop">
                {REACTION_EMOJIS[postState.currentUserReaction]}
              </span>
            ) : (
              <ThumbsUp className="w-5 h-5 text-[#65676b] transform active:scale-90" />
            )}
            <span>
              {postState.currentUserReaction ? REACTION_LABELS[postState.currentUserReaction] : "Curtir"}
            </span>
          </button>

          {/* BALOON COM REAÇÕES ADICIONAIS */}
          <AnimatePresence>
            {showReactionFlyout && (
              <ReactionFlyout
                onSelectReaction={handleSelectReaction}
                onMouseLeave={() => setShowReactionFlyout(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Botão de Comentar */}
        <button
          id="action-comment-trigger-btn"
          type="button"
          onClick={() => commentInputRef.current?.focus()}
          className="flex-1 py-2 hover:bg-gray-100 rounded-md transition duration-150 flex items-center justify-center gap-1.5 text-[#65676b] font-medium cursor-pointer text-sm sm:text-base"
        >
          <MessageCircle className="w-5 h-5 text-[#65676b]" />
          <span>Comentar</span>
        </button>

        {/* Botão de Compartilhar */}
        <button
          id="action-share-trigger-btn"
          type="button"
          onClick={handleShareClick}
          className="flex-1 py-2 hover:bg-gray-100 rounded-md transition duration-150 flex items-center justify-center gap-1.5 text-[#65676b] font-medium cursor-pointer text-sm sm:text-base"
        >
          <Share2 className="w-5 h-5 text-[#65676b]" />
          <span>Compartilhar</span>
        </button>

        {/* Toast Flutuante de Compartilhamento Realizado com Sucesso */}
        <AnimatePresence>
          {showShareSuccess && (
            <motion.div
              id="share-success-toast"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -50, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.95 }}
              className="absolute left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 z-50 pointer-events-none"
            >
              <CheckCircle className="w-4 h-4 text-[#31a24c] fill-current text-white" />
              <span>Compartilhado no seu perfil!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 6. SEÇÃO DE COMENTÁRIOS */}
      <div id="postcard-comments-section" className="p-3 bg-[#ffffff] rounded-b-lg">
        {/* Dropdown de Classificação */}
        <div className="flex items-center justify-between pb-3 text-xs text-[#65676b] font-semibold">
          <div className="flex items-center gap-1 hover:underline cursor-pointer">
            <span>Mais relevantes</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* Form para dicionar novo comentário (Visitante) */}
        <form id="postcard-add-comment-form" onSubmit={handleAddComment} className="flex gap-2 items-start pb-4">
          <img
            src={visitor.avatar}
            alt="Seu Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
          />
          <div className="flex-1 relative flex items-center bg-[#f0f2f5] rounded-2xl px-3 py-1.5 border border-transparent focus-within:border-gray-300">
            <input
              id="postcard-comment-input"
              ref={commentInputRef}
              type="text"
              placeholder="Escreva um comentário..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full bg-transparent text-sm text-[#050505] placeholder-[#65676b] outline-none focus:ring-0 pr-16 border-none py-0.5"
            />
            {/* Ícones de suporte no input (Emoji, Câmera, Enviar) */}
            <div className="absolute right-2.5 flex items-center gap-1.5 text-[#65676b]">
              <button
                type="button"
                title="Inserir um emoji"
                className="p-1 hover:bg-gray-200 rounded-full transition cursor-pointer"
              >
                <Smile className="w-4 h-4 text-[#65676b]" />
              </button>
              <button
                type="button"
                title="Inserir uma foto"
                className="p-1 hover:bg-gray-200 rounded-full transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#65676b]" />
              </button>
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                title="Enviar comentário"
                className={`p-1 rounded-full transition cursor-pointer ${
                  newCommentText.trim() ? "text-[#1877f2] hover:bg-gray-200" : "text-gray-300 pointer-events-none"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* LISTA DE COMENTÁRIOS */}
        <div id="comments-list-wrapper" className="space-y-3 pt-1">
          {postState.comments.map((comment) => (
            <div key={comment.id} id={`comment-container-${comment.id}`} className="space-y-1.5">
              {/* Comentário Principal */}
              <div className="flex gap-2 items-start text-sm">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full border border-gray-100 object-cover mt-0.5"
                />
                <div className="flex-1">
                  {/* Balão de comentário */}
                  <div className="inline-block bg-[#f0f2f5] rounded-2xl px-3 py-2 max-w-[95%]">
                    <span className="font-semibold text-[#050505] hover:underline cursor-pointer mr-1.5 text-xs sm:text-sm">
                      {comment.authorName}
                    </span>
                    {comment.isPageOwner && (
                      <span className="bg-[#1877f2]/10 text-[#1877f2] text-[10px] px-1.5 py-0.5 rounded-md font-semibold inline-block mr-1.5">
                        Autor
                      </span>
                    )}
                    <p className="text-[#050505] leading-relaxed break-words text-xs sm:text-sm mt-0.5">
                      {comment.content}
                    </p>

                    {/* Contador de likes no canto inferior direito do balão se houver mais de 0 */}
                    {comment.likesCount > 0 && (
                      <div className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-100 shadow-xs rounded-full px-1 py-0.5 absolute -bottom-1 -right-2 whitespace-nowrap z-10 scale-90">
                        <span className="text-[10px]">👍</span>
                        <span className="text-[10px] text-[#65676b] font-medium">{comment.likesCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações do comentário */}
                  <div className="flex items-center gap-3 text-xs font-bold text-[#65676b] mt-1 ml-2.5">
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`hover:underline cursor-pointer ${comment.hasLiked ? "text-[#1877f2]" : ""}`}
                    >
                      Curtir
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setActiveReplyToId(activeReplyToId === comment.id ? null : comment.id)}
                      className="hover:underline cursor-pointer"
                    >
                      Responder
                    </button>
                    <span>·</span>
                    <span className="font-normal text-[#65676b]" title="Tempo de publicação">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* REPOSTAS NESTE COMENTÁRIO (REPLIES) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-10 space-y-3 border-l-2 border-gray-200/50 ml-4 pt-1.5">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} id={`reply-container-${reply.id}`} className="flex gap-2 items-start text-sm">
                      <img
                        src={reply.authorAvatar}
                        alt={reply.authorName}
                        className="w-6 h-6 rounded-full border border-gray-100 object-cover mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="inline-block bg-[#f0f2f5] rounded-2xl px-3 py-1.5 max-w-[95%]">
                          <span className="font-semibold text-[#050505] hover:underline cursor-pointer mr-1.5 text-xs sm:text-sm">
                            {reply.authorName}
                          </span>
                          {reply.isPageOwner && (
                            <span className="bg-[#1877f2]/10 text-[#1877f2] text-[10px] px-1.5 py-0.5 rounded-md font-semibold inline-block mr-1.5">
                              Autor
                            </span>
                          )}
                          <p className="text-[#050505] leading-relaxed break-words text-xs sm:text-sm mt-0.5">
                            {reply.content}
                          </p>

                          {reply.likesCount > 0 && (
                            <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-xs rounded-full px-1 py-0.5 absolute -bottom-1 -right-2 whitespace-nowrap scale-75">
                              <span className="text-[10px]">👍</span>
                              <span className="text-[10px] text-[#65676b] font-medium">{reply.likesCount}</span>
                            </div>
                          )}
                        </div>

                        {/* Ações da resposta */}
                        <div className="flex items-center gap-3 text-xs font-bold text-[#65676b] mt-1 ml-2.5">
                          <button
                            type="button"
                            onClick={() => handleLikeComment(reply.id, true, comment.id)}
                            className={`hover:underline cursor-pointer ${reply.hasLiked ? "text-[#1877f2]" : ""}`}
                          >
                            Curtir
                          </button>
                          <span>·</span>
                          <span className="font-normal text-[#65676b]">{reply.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT DE RESPOSTA ATIVO */}
              {activeReplyToId === comment.id && (
                <div className="pl-10 ml-4 pt-1 flex gap-2 items-center">
                  <img
                    src={visitor.avatar}
                    alt="Seu Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1 relative flex items-center bg-[#f0f2f5] rounded-full px-3 py-1 border border-transparent focus-within:border-gray-300">
                    <input
                      id={`reply-input-${comment.id}`}
                      type="text"
                      placeholder={`Responder a ${comment.authorName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter") {
                          handleAddReply(comment.id);
                        }
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm text-[#050505] placeholder-[#65676b] outline-none border-none py-0.5 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="absolute right-2 p-0.5 text-[#1877f2] disabled:text-gray-300 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
