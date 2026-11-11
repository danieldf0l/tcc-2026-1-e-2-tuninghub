import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Abre o checkout do PIX num navegador dentro do app.
// No iOS a promessa só resolve quando a pessoa fecha o navegador (aí conferimos o pagamento).
// No Android ela resolve logo; a conferência acontece quando o app volta ao primeiro plano.
export async function abrirCheckout(url) {
  if (!url) return;
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}