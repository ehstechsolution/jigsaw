export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | null;

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likesCount: number;
  hasLiked: boolean;
  replies?: Comment[];
  isPageOwner?: boolean;
}

export interface PostState {
  likesCount: number;
  reactionsCount: {
    like: number;
    love: number;
    care: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  currentUserReaction: ReactionType;
  sharesCount: number;
  comments: Comment[];
  pageName: string;
  pageAvatar: string;
  postTimeFormatted: string;
}
