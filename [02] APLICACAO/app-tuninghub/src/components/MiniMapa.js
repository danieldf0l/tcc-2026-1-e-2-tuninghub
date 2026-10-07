import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

function montarHtml(lat, lng) {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#m{height:100%;margin:0}</style></head>
<body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('m',{zoomControl:false,dragging:false,scrollWheelZoom:false,touchZoom:false,doubleClickZoom:false}).setView([${lat},${lng}],16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
L.circleMarker([${lat},${lng}],{radius:10,color:'#FEFEFE',weight:3,fillColor:'#E9302E',fillOpacity:1}).addTo(map);
</script></body></html>`;
}

export default function MiniMapa({ latitude, longitude, height = 180 }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!lat || !lng) return null;

  return (
    <View style={[styles.box, { height }]} pointerEvents="none">
      <WebView
        originWhitelist={['*']}
        source={{ html: montarHtml(lat, lng), baseUrl: 'https://tuninghub.net.br' }}
        scrollEnabled={false}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 16, overflow: 'hidden' },
});