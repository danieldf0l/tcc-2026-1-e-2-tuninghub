import { Linking, Platform, Share } from 'react-native';

// contextoProjeto (opcional): { montadora, modelo, servicos: ['Película', 'Som'] }
export function abrirWhatsApp(telefone, nomeOficina, contextoProjeto) {
  let numero = String(telefone || '').replace(/\D/g, '');
  if (!numero) return Promise.reject(new Error('Telefone indisponível'));
  if (numero.length <= 11) numero = `55${numero}`;

  const servicos = contextoProjeto?.servicos || [];
  const carro = [contextoProjeto?.montadora, contextoProjeto?.modelo].filter(Boolean).join(' ');

  let mensagem;
  if (servicos.length > 0) {
    const lista = servicos.map((s) => `• ${s}`).join('\n');
    const abertura = carro ? `Tenho um projeto para o meu ${carro} e gostaria` : 'Tenho um projeto e gostaria';
    mensagem = `Olá! Encontrei a ${nomeOficina} pelo TuningHub.\n${abertura} de um orçamento para:\n${lista}\n\nPodemos conversar?`;
  } else {
    mensagem = `Olá! Encontrei a ${nomeOficina} pelo TuningHub e gostaria de saber mais sobre os serviços.`;
  }

  return Linking.openURL(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`);
}

// Abre o app de mapas nativo (Apple Maps no iOS, seletor de apps no Android).
// Se não conseguir, cai no Google Maps pelo navegador.
export function abrirNoMapa(latitude, longitude, nome) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const rotulo = encodeURIComponent(nome || 'Oficina');
  const google = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const url = Platform.select({
    ios: `https://maps.apple.com/?ll=${lat},${lng}&q=${rotulo}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${rotulo})`,
    default: google,
  });

  return Linking.openURL(url).catch(() => Linking.openURL(google));
}

// Menu nativo de compartilhar (WhatsApp, Instagram, copiar...)
export function compartilharOficina({ nome, endereco }) {
  const linhas = [`${nome} — encontrei pelo TuningHub.`, endereco ? `📍 ${endereco}` : null].filter(Boolean);
  return Share.share({ message: linhas.join('\n') });
}