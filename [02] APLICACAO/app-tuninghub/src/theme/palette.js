import { brand } from './colors';

export const darkPalette = {
  // Fundos (3 níveis de profundidade)
  background: brand.preto,
  surface: brand.cinza,
  surfaceElevated: '#1C1D1F',

  // Linhas
  border: '#2A2B2D',
  divider: '#1F2022',

  // Texto
  text: brand.branco,
  textSecondary: brand.cinzaClaro,
  placeholder: '#7A7674',
  textOnPrimary: brand.branco, // texto sobre botão/fundo vermelho

  // Marca
  primary: brand.vermelhoVivo,
  primaryPressed: '#C22624',
  primarySoft: 'rgba(233, 48, 46, 0.14)', // fundo de chip/badge selecionado
  secondary: brand.vermelho,

  // Estados
  danger: brand.vermelhoVivo,
  dangerSoft: 'rgba(233, 48, 46, 0.14)',
  success: '#2FBF71',
  successSoft: 'rgba(47, 191, 113, 0.14)',
  warning: '#F5A524',
  warningSoft: 'rgba(245, 165, 36, 0.14)',

  // Utilitários
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1C1D1F',
};

export const lightPalette = {
  background: brand.branco,
  surface: '#F4F3F2',
  surfaceElevated: brand.branco,

  border: '#E3E0DE',
  divider: '#EEECEA',

  text: brand.preto,
  textSecondary: '#5C5957',
  placeholder: '#9B9795',
  textOnPrimary: brand.branco,

  primary: brand.vermelhoVivo,
  primaryPressed: '#C22624',
  primarySoft: 'rgba(233, 48, 46, 0.10)',
  secondary: brand.vermelho,

  danger: brand.vermelhoVivo,
  dangerSoft: 'rgba(233, 48, 46, 0.10)',
  success: '#1E9E5A',
  successSoft: 'rgba(30, 158, 90, 0.10)',
  warning: '#C77C02',
  warningSoft: 'rgba(199, 124, 2, 0.10)',

  overlay: 'rgba(0, 0, 0, 0.45)',
  skeleton: '#ECEAE8',
};