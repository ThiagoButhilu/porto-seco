'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LIMITS, loginSchema, type LoginInput } from '@/domain/validation/schemas';
import { Alert, Button, TextField } from '@/shared/ui';
import { useLogin } from '../hooks/useLogin';
import styles from './LoginForm.module.scss';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit((data) => login.mutate(data))} noValidate>
      {login.isError && (
        <Alert tone="danger" title="Não foi possível entrar">
          {login.error.message}
        </Alert>
      )}

      <TextField
        label="E-mail"
        type="email"
        icon="mail"
        placeholder="nome@empresa.com.br"
        autoComplete="email"
        inputMode="email"
        maxLength={LIMITS.EMAIL}
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        icon="lock"
        placeholder="Mínimo de 6 caracteres"
        autoComplete="current-password"
        maxLength={LIMITS.PASSWORD_MAX}
        showCounter
        required
        error={errors.password?.message}
        endSlot={
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        {...register('password')}
      />

      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        {login.isPending ? 'Entrando…' : 'Entrar'}
      </Button>

      <p className={styles.demo}>
        Ambiente de demonstração: qualquer e-mail válido e senha com 6+ caracteres.
      </p>
    </form>
  );
}
