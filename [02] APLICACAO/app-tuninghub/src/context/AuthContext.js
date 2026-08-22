import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi } from '../api/auth.api';

const TOKEN_KEY = 'tuninghub_token';
const USUARIO_KEY = 'tuninghub_usuario';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const [tokenSalvo, usuarioSalvo] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USUARIO_KEY),
        ]);
        if (tokenSalvo && usuarioSalvo) {
          setToken(tokenSalvo);
          setUsuario(JSON.parse(usuarioSalvo));
        }
      } finally {
        setCarregando(false);
      }
    }
    restaurarSessao();
  }, []);

  async function entrar(tipo, email, senha) {
    const resposta = await loginApi(tipo, email, senha);
    await SecureStore.setItemAsync(TOKEN_KEY, resposta.token);
    await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(resposta.usuario));
    setToken(resposta.token);
    setUsuario(resposta.usuario);
  }

  async function sair() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, carregando, autenticado: !!token, entrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}