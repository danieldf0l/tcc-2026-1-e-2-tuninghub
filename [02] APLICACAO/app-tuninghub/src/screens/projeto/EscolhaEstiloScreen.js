import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ESTILOS, TIPO_CUSTOMIZACAO } from '../../constants/estilos';
import { criarProjeto } from '../../api/projeto.api';
import { getErrorMessage } from '../../utils/errorHandler';
import SelectableCard from '../../components/SelectableCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function EscolhaEstiloScreen({ route, navigation }) {
  const { idModelo, nomeCarro } = route.params;
  const { colors } = useTheme();

  const [nomeProjeto, setNomeProjeto] = useState('');
  const [estiloSelecionado, setEstiloSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function confirmar(tipoCustomizacao, estilo) {
    setErro('');
    setLoading(true);
    try {
      const projeto = await criarProjeto({
        idModelo,
        descricao: nomeProjeto.trim() || null,
        tipoCustomizacao,
        estilo,
      });
      navigation.replace('ProjetoDetalhe', {
        idProjeto: projeto.id ?? projeto.IdProjeto,
        nomeCarro,
      });
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Escolha o estilo</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{nomeCarro}</Text>

      <Input
        placeholder="Dê um nome ao projeto (opcional)"
        value={nomeProjeto}
        onChangeText={setNomeProjeto}
      />

      {ESTILOS.map((estilo) => (
        <SelectableCard
          key={estilo.valor}
          title={estilo.rotulo}
          subtitle={estilo.descricao}
          selected={estiloSelecionado === estilo.valor}
          onPress={() => setEstiloSelecionado(estilo.valor)}
        />
      ))}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 12 }} />
      <Button
        title="Confirmar estilo"
        onPress={() => confirmar(TIPO_CUSTOMIZACAO.ESTILO, estiloSelecionado)}
        loading={loading}
        disabled={!estiloSelecionado || loading}
      />

      <View style={{ height: 12 }} />
      <Button
        title="Personalizar do meu jeito"
        variant="outline"
        onPress={() => confirmar(TIPO_CUSTOMIZACAO.PERSONALIZADA, null)}
        loading={loading}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
}); 