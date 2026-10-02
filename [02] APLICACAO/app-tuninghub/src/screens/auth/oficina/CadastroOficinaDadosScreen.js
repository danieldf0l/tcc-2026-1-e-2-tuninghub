import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

export default function CadastroOficinaDadosScreen({ route, navigation }) {
  const { colors } = useTheme();
  const [nomeOficina, setNomeOficina] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);

  function handleProximo() {
    setErro('');
    const vazios = [];
    if (!nomeOficina) vazios.push('nomeOficina');
    if (!cnpj) vazios.push('cnpj');

    if (vazios.length > 0) {
      setErro('Preencha o nome da oficina e o CNPJ.');
      setCamposComErro(vazios);
      return;
    }

    setCamposComErro([]);
    navigation.navigate('CadastroOficinaEndereco', {
      ...route.params,
      nomeOficina,
      cnpj,
      telefone,
    });
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.etapa, { color: colors.primary }]}>Etapa 2 de 3</Text>
      <Text style={[styles.title, { color: colors.text }]}>Informações da Oficina</Text>

      <Input
        placeholder="Nome da Oficina"
        value={nomeOficina}
        onChangeText={setNomeOficina}
        error={camposComErro.includes('nomeOficina')}
      />
      <Input
        placeholder="CNPJ"
        value={cnpj}
        onChangeText={setCnpj}
        keyboardType="numeric"
        error={camposComErro.includes('cnpj')}
      />
      <Input
        placeholder="Telefone de Contato"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 12 }} />
      <Button title="Próximo" onPress={handleProximo} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  etapa: { fontSize: 12, fontWeight: '800', marginTop: 16, letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '800', marginTop: 4, marginBottom: 24 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});