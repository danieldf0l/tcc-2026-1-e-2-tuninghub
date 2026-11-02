import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi, verificarEmail as verificarEmailApi } from '../api/auth.api';
import { buscarMinhaAssinatura } from '../api/assinatura.api';
import { setSessaoInvalidaHandler } from '../api/client';

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

  // Evita vários alertas quando várias requisições falham ao mesmo tempo
  const encerrandoRef = useRef(false);

  // Servidor recusou a sessão (401 / conta desativada): limpa tudo e volta ao login
  useEffect(() => {
    setSessaoInvalidaHandler(async (mensagem) => {
      if (encerrandoRef.current) return;
      encerrandoRef.current = true;
      await sair();
      Alert.alert('Sessão encerrada', mensagem);
    });
    return () => setSessaoInvalidaHandler(null);
  }, []);

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
          const assinaturaSalva = tipo === 'oficina' ? await buscarAssinaturaSegura() : null;
          // Se o servidor recusou o token durante a restauração, a sessão já foi encerrada
          if (encerrandoRef.current) return;
          setAssinatura(assinaturaSalva);
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

  // Grava e ativa a sessão (resposta = { usuario, token })
  async function iniciarSessao(tipo, resposta) {
    await SecureStore.setItemAsync(TOKEN_KEY, resposta.token);
    await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(resposta.usuario));
    await SecureStore.setItemAsync(TIPO_CONTA_KEY, tipo);
    encerrandoRef.current = false;

    // O interceptor do axios lê o token do SecureStore, então já dá para consultar a assinatura aqui
    const assinaturaAtual = tipo === 'oficina' ? await buscarAssinaturaSegura() : null;

    setAssinatura(assinaturaAtual);
    setToken(resposta.token);
    setUsuario(resposta.usuario);
    setTipoConta(tipo);
  }

  async function entrar(tipo, email, senha) {
    const resposta = await loginApi(tipo, email, senha);
    await iniciarSessao(tipo, resposta);
  }

  // Confirma o e-mail do cadastro com o código e já entra no app
  async function confirmarEmail(tipo, email, senha, codigo) {
    const resposta = await verificarEmailApi({ email, tipo, senha, codigo });
    await iniciarSessao(tipo, resposta);
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
        confirmarEmail,
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