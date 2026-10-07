import { Linking } from 'react-native';

export function abrirWhatsApp(telefone, nomeOficina) {
  let numero = String(telefone || '').replace(/\D/g, '');
  if (!numero) return Promise.reject(new Error('Telefone indisponível'));
  if (numero.length <= 11) numero = `55${numero}`;

  const mensagem = `Olá! Encontrei a ${nomeOficina} pelo TuningHub e gostaria de saber mais sobre os serviços.`;
  return Linking.openURL(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`);
}

export function abrirNoMapa(latitude, longitude) {
  return Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  );
}   