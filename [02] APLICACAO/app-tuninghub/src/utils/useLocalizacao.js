import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocalizacao() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('carregando'); // carregando | concedida | negada | erro
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function pedirPermissao() {
      try {
        const { status: statusPermissao } = await Location.requestForegroundPermissionsAsync();

        if (statusPermissao !== 'granted') {
          setStatus('negada');
          return;
        }

        const posicao = await Location.getCurrentPositionAsync({});
        setCoords({ lat: posicao.coords.latitude, lng: posicao.coords.longitude });
        setStatus('concedida');
      } catch (e) {
        setErro('Não foi possível obter sua localização.');
        setStatus('erro');
      }
    }

    pedirPermissao();
  }, []);

  return { coords, status, erro };
}