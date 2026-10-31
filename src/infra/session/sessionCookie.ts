/** Cookie lido pelo middleware do Next para proteger as rotas autenticadas. */
export const SESSION_COOKIE = 'ps_session';
const OITO_HORAS = 60 * 60 * 8; // um expediente

export const sessionCookie = {
  set(token: string) {
    document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${OITO_HORAS}; samesite=lax`;
  },
  clear() {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
  },
};
