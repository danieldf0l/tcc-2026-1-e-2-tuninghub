import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi } from '../api/auth.api';

const TOKEN_KEY = 'tuninghub_token';
const USUARIO_KEY = 'tuninghub_usuario';
const TIPO_CONTA_KEY = 'tuninghub_tipo_conta';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [tipoConta, setTipoConta] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const [tokenSalvo, usuarioSalvo, tipoSalvo] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USUARIO_KEY),
          SecureStore.getItemAsync(TIPO_CONTA_KEY),
        ]);
        if (tokenSalvo && usuarioSalvo) {
          setToken(tokenSalvo);
          setUsuario(JSON.parse(usuarioSalvo));
          setTipoConta(tipoSalvo || 'usuario');
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
    await SecureStore.setItemAsync(TIPO_CONTA_KEY, tipo);
    setToken(resposta.token);
    setUsuario(resposta.usuario);
    setTipoConta(tipo);
  }

  async function sair() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USUARIO_KEY);
    await SecureStore.deleteItemAsync(TIPO_CONTA_KEY);
    setToken(null);
    setUsuario(null);
    setTipoConta(null);
  }

  function atualizarAceiteTermos() {
    setUsuario((prev) => {
      const atualizado = { ...prev, TermosAceitos: 1 };
      SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(atualizado));
      return atualizado;
    });
  }

  function atualizarUsuario(camposNovos) {
    setUsuario((prev) => {
      const atualizado = { ...prev, ...camposNovos };
      SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(atualizado));
      return atualizado;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        tipoConta,
        carregando,
        autenticado: !!token,
        entrar,
        sair,
        atualizarAceiteTermos,
        atualizarUsuario,
      }}
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