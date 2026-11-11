import * as Haptics from 'expo-haptics';

// Aparelhos sem motor de vibração (ou com a vibração desligada) simplesmente ignoram
function seguro(acao) {
  try {
    acao()?.catch?.(() => {});
  } catch {
    // nada a fazer
  }
}

export const toqueSelecao = () => seguro(() => Haptics.selectionAsync());
export const toqueImpacto = () => seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const toqueSucesso = () => seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const toqueErro = () => seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));