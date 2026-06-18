import React from "react";
import { motion } from "motion/react";
import { X, Globe, CheckCircle } from "lucide-react";
import { PostState } from "../types";
import PostCard from "./PostCard";

interface LightboxProps {
  postState: PostState;
  setPostState: React.Dispatch<React.SetStateAction<PostState>>;
  onClose: () => void;
}

export default function Lightbox({ postState, setPostState, onClose }: LightboxProps) {
  return (
    <motion.div
      id="fb-theater-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col lg:flex-row select-none"
    >
      {/* SEÇÃO DA IMAGEM (ESQUERDA - TELA CHEIA CINEMÁTICA) */}
      <div id="lightbox-left-pane" className="relative flex-1 bg-black flex items-center justify-center p-4 lg:p-12">
        {/* Botão para fechar no canto superior esquerdo */}
        <button
          id="lightbox-close-header-btn"
          onClick={onClose}
          className="absolute top-4 left-4 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full p-2.5 transition z-50 flex items-center justify-center cursor-pointer"
          title="Fechar tela cheia (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Imagem em tamanho real, preenchendo adequadamente */}
        <motion.img
          id="lightbox-theater-img"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25 }}
          src="https://res.cloudinary.com/dujniwlkm/image/upload/v1781803463/MAGIG_uu6ich.png"
          alt="Foto Expandida"
          className="max-w-full max-h-[85vh] lg:max-h-[92vh] object-contain rounded-sm shadow-2xlSelectNone"
        />

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-gray-300 text-xs px-3 py-1 rounded-full font-medium">
          Modo Teatro do Facebook · Foto Oficial
        </div>
      </div>

      {/* SEÇÃO DO CONTEÚDO E COMENTÁRIOS (DIREITA - BARRA INTERATIVA BRANCA) */}
      <div
        id="lightbox-right-pane"
        className="w-full lg:w-[440px] xl:w-[480px] bg-white h-full overflow-y-auto flex flex-col border-l border-gray-200"
      >
        {/* Cabeçalho do painel de comentários no Lightbox */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <img
              src={postState.pageAvatar}
              alt={postState.pageName}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm hover:underline cursor-pointer">
                  {postState.pageName}
                </span>
                <span className="text-[#1877f2]" title="Página verificada oficial">
                  <CheckCircle className="w-3.5 h-3.5 fill-current text-white bg-[#1877f2] rounded-full" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#65676b]">
                <span>{postState.postTimeFormatted}</span>
                <span>·</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-full transition text-[#65676b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card embutido com rolagem integral sincronizada para ações perfeitas */}
        <div className="flex-1 p-2 bg-gray-50 overflow-y-auto">
          <PostCard
            postState={postState}
            setPostState={setPostState}
            isCompact={true}
          />
        </div>
      </div>
    </motion.div>
  );
}
