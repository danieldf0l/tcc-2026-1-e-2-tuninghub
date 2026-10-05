import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi } from '../api/auth.api';
import { buscarMinhaAssinatura } from '../api/assinatura.api';

const TOKEN_KEY = 'tuninghub_token';
const USUARIO_KEY = 'tuninghub_usuario';
const TIPO_CONTA_KEY = 'tuninghub_tipo_conta';

const AuthContext = createContext(null);

async function buscarAssinaturaSegura() {
  try {
    return await buscarMinhaAssinatura();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [tipoConta, setTipoConta] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
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
          const tipo = tipoSalvo || 'usuario';
          if (tipo === 'oficina') {
            setAssinatura(await buscarAssinaturaSegura());
          }
          setToken(tokenSalvo);
          setUsuario(JSON.parse(usuarioSalvo));
          setTipoConta(tipo);
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

    // O interceptor do axios lê o token do SecureStore, então já dá para consultar a assinatura aqui
    const assinaturaAtual = tipo === 'oficina' ? await buscarAssinaturaSegura() : null;

    setAssinatura(assinaturaAtual);
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
    setAssinatura(null);
  }

  async function verificarAssinatura() {
    const atual = await buscarAssinaturaSegura();
    setAssinatura(atual);
    return atual;
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
        assinatura,
        carregando,
        autenticado: !!token,
        entrar,
        sair,
        verificarAssinatura,
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