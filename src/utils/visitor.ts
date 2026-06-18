const RANDOM_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1489424888204-c1530937446d?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&q=80"
];

const RANDOM_NAMES = [
  "Lucas Oliveira",
  "Mariana Silva",
  "Gabriel Santos",
  "Beatriz Costa",
  "Rodrigo Pereira",
  "Ana Paula Souza",
  "Felipe Melo",
  "Amanda Rodrigues",
  "Juliana Barbosa",
  "Thiago Martins",
  "Camila Gomes",
  "Pedro Henrique"
];

export interface VisitorProfile {
  name: string;
  avatar: string;
}

export function getOrCreateVisitorProfile(): VisitorProfile {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("fb_visitor_profile");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }

    const randomAvatar = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const profile = { name: randomName, avatar: randomAvatar };
    
    localStorage.setItem("fb_visitor_profile", JSON.stringify(profile));
    return profile;
  }

  return {
    name: "Você (Visitante)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&q=80"
  };
}

export function randomizeVisitorProfile(): VisitorProfile {
  const randomAvatar = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
  const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const profile = { name: randomName, avatar: randomAvatar };
  
  if (typeof window !== "undefined") {
    localStorage.setItem("fb_visitor_profile", JSON.stringify(profile));
  }
  return profile;
}

export function getRandomFakeProfile(): VisitorProfile {
  const randomAvatar = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
  const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  return { name: randomName, avatar: randomAvatar };
}
