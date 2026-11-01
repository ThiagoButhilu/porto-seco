/** Cookie read by the Next middleware to protect authenticated routes. */
export const SESSION_COOKIE = 'ps_session';
const EIGHT_HOURS = 60 * 60 * 8; // one work shift

export const sessionCookie = {
  set(token: string) {
    document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${EIGHT_HOURS}; samesite=lax`;
  },
  clear() {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
  },
};
