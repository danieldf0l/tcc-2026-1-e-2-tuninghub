import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import BackButton from '../../components/BackButton';

const PERGUNTAS = [
  {
    pergunta: 'Como crio um novo projeto?',
    resposta: 'Na aba Projetos, toque em "+ Novo Projeto", escolha a marca e o modelo do seu carro e depois selecione um estilo de customização ou personalize do seu jeito.',
  },
  {
    pergunta: 'Qual o limite de projetos que posso ter?',
    resposta: 'Você pode ter até 3 projetos ativos ao mesmo tempo.',
  },
  {
    pergunta: 'Como encontro oficinas próximas?',
    resposta: 'Na aba Oficinas, o app usa sua localização (com sua permissão) para mostrar as oficinas mais próximas, ordenadas por distância.',
  },
  {
    pergunta: 'Esqueci minha senha, o que faço?',
    resposta: 'Essa funcionalidade está em desenvolvimento. Por enquanto, entre em contato pela opção "Sugestões e problemas".',
  },
];

function FaqItem({ pergunta, resposta }) {
  const { colors } = useTheme();
  const [aberto, setAberto] = useState(false);

  return (
    <Pressable
      onPress={() => setAberto((v) => !v)}
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.pergunta, { color: colors.text }]}>{pergunta}</Text>
        <ChevronDown
          size={18}
          color={colors.textSecondary}
          style={{ transform: [{ rotate: aberto ? '180deg' : '0deg' }] }}
        />
      </View>
      {aberto ? <Text style={[styles.resposta, { color: colors.textSecondary }]}>{resposta}</Text> : null}
    </Pressable>
  );
}

export default function AjudaScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Dúvidas frequentes</Text>

      {PERGUNTAS.map((item) => (
        <FaqItem key={item.pergunta} {...item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 20 },
  item: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pergunta: { fontSize: 14.5, fontWeight: '700', flex: 1, marginRight: 12 },
  resposta: { fontSize: 13, marginTop: 10, lineHeight: 19 },
});