'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LIMITES, loginSchema, type LoginInput } from '@/domain/validation/schemas';
import { Alert, Button, TextField } from '@/shared/ui';
import { useLogin } from '../hooks/useLogin';
import styles from './LoginForm.module.scss';

export function LoginForm() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', senha: '' },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit((dados) => login.mutate(dados))} noValidate>
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
        maxLength={LIMITES.EMAIL}
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label="Senha"
        type={mostrarSenha ? 'text' : 'password'}
        icon="lock"
        placeholder="Mínimo de 6 caracteres"
        autoComplete="current-password"
        maxLength={LIMITES.SENHA_MAX}
        showCounter
        required
        error={errors.senha?.message}
        endSlot={
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setMostrarSenha((v) => !v)}
            aria-pressed={mostrarSenha}
          >
            {mostrarSenha ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        {...register('senha')}
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
