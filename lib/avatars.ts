// Avatar configuration mapping
export type AvatarEmotion = 'closed' | 'happy' | 'open' | 'surprised';
export type AvatarKey = 'paula' | 'tymon';

export const AVATARS: Record<AvatarKey, Record<AvatarEmotion, string>> = {
  paula: {
    closed: '/avatars/avatar-paula-closed.png',
    happy: '/avatars/avatar-paula-happy.png',
    open: '/avatars/avatar-paula-open.png',
    surprised: '/avatars/avatar-paula-suprised.png',
  },
  tymon: {
    closed: '/avatars/avatar-tymon-closed.png',
    happy: '/avatars/avatar-tymon-happy.png',
    open: '/avatars/avatar-tymon-open.png',
    surprised: '/avatars/avatar-tymon-suprised.png',
  },
};

export const AVATAR_DISPLAY_NAMES: Record<AvatarKey, string> = {
  paula: 'Paula',
  tymon: 'Tymon',
};
