import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LoginInput } from '@/domain/validation/schemas';
import { repositories } from '@/infra/container';
import { useSessionStore } from '../sessionStore';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useSessionStore((state) => state.signIn);

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => repositories.auth.login(email, password),
    onSuccess: ({ user, token }) => {
      signIn(user, token);
      const redirect = searchParams.get('redirect');
      // Only internal paths are accepted, to prevent open redirects
      router.replace(redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard');
    },
  });
}
