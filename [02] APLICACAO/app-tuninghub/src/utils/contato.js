import { Linking } from 'react-native';

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

export function abrirNoMapa(latitude, longitude) {
  return Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  );
}