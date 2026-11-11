import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../theme/ThemeContext';

// Tiles do OpenStreetMap (sem chave). No tema escuro, um filtro CSS inverte as cores
// das ruas; o marcador fica numa camada separada e mantém o vermelho da marca.
function montarHtml(lat, lng, escuro, fundo, corMarcador) {
  const filtroEscuro = escuro
    ? '.leaflet-tile-pane{filter:invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)}'
    : '';

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#m{height:100%;margin:0;background:${fundo}}
  ${filtroEscuro}
  .leaflet-control-attribution{font-size:9px}
</style></head>
<body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('m',{zoomControl:false,dragging:false,scrollWheelZoom:false,touchZoom:false,doubleClickZoom:false}).setView([${lat},${lng}],16);
map.attributionControl.setPrefix(false);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
L.circleMarker([${lat},${lng}],{radius:10,color:'#FEFEFE',weight:3,fillColor:'${corMarcador}',fillOpacity:1}).addTo(map);
</script></body></html>`;
}

export default function MiniMapa({ latitude, longitude, height = 180 }) {
  const { colors, isDark, radius } = useTheme();
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!lat || !lng) return null;

  return (
    <View
      style={[styles.box, { height, borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface }]}
      pointerEvents="none"
    >
      <WebView
        key={isDark ? 'escuro' : 'claro'}
        originWhitelist={['*']}
        source={{
          html: montarHtml(lat, lng, isDark, colors.surface, colors.primary),
          baseUrl: 'https://tuninghub.net.br', // o OSM exige Referer identificável
        }}
        scrollEnabled={false}
        style={{ flex: 1, backgroundColor: colors.surface }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', borderWidth: 1 },
});