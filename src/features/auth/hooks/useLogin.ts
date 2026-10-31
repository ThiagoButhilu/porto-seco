import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LoginInput } from '@/domain/validation/schemas';
import { repositories } from '@/infra/container';
import { useSessionStore } from '../sessionStore';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entrar = useSessionStore((state) => state.entrar);

  return useMutation({
    mutationFn: ({ email, senha }: LoginInput) => repositories.auth.login(email, senha),
    onSuccess: ({ usuario, token }) => {
      entrar(usuario, token);
      const redirect = searchParams.get('redirect');
      // Só aceita caminhos internos para evitar open redirect
      router.replace(redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard');
    },
  });
}
