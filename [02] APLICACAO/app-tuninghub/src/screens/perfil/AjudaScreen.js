import { useMemo, useState } from 'react';
import { View, Text, Pressable, LayoutAnimation, StyleSheet } from 'react-native';
import { ChevronDown, Search, SearchX, MessageSquareWarning } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { abrirEmailSuporte } from '../../utils/contato';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import QuickActionCard from '../../components/QuickActionCard';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';

const ESQUECI_SENHA = {
  pergunta: 'Esqueci minha senha, o que faço?',
  resposta:
    'Na tela de login, toque em "Esqueci minha senha". Enviamos um código de 6 dígitos para o seu e-mail e, com ele, você cria uma nova senha.',
};

const TROCAR_EMAIL = {
  pergunta: 'Como troco meu e-mail?',
  resposta:
    'Em Perfil > Meus dados. Por segurança, pedimos sua senha atual e enviamos um código para o novo e-mail. A troca só vale depois de confirmar o código.',
};

const PERGUNTAS_USUARIO = [
  {
    pergunta: 'Como crio um novo projeto?',
    resposta:
      'Na aba Projetos, toque em "Novo projeto", escolha a marca e o modelo do carro e depois um estilo. Se preferir montar a lista do zero, escolha "Do meu jeito".',
  },
  {
    pergunta: 'Quantos projetos posso ter?',
    resposta:
      'Até 3 projetos ativos e 3 arquivados. Ao atingir o limite, o app ajuda você a liberar uma vaga, arquivando ou excluindo um projeto.',
  },
  {
    pergunta: 'Como arquivo um projeto?',
    resposta:
      'Na lista de Projetos, arraste o projeto para a esquerda. Você também pode abrir o projeto e usar o menu "⋯". Dá para desfazer na hora ou desarquivar depois.',
  },
  {
    pergunta: 'Como removo um serviço da lista do projeto?',
    resposta: 'Dentro do projeto, arraste o serviço para a esquerda. Se tiver sido sem querer, toque em "Desfazer".',
  },
  {
    pergunta: 'Como encontro oficinas para o meu projeto?',
    resposta:
      'Abra o projeto e toque em "Encontrar oficinas", ou use "Oficinas para meu projeto" na tela inicial. Aparecem primeiro as oficinas que fazem mais serviços da sua lista.',
  },
  {
    pergunta: 'Por que algumas oficinas não têm botão de WhatsApp?',
    resposta:
      'O contato direto pelo app é um recurso das oficinas com plano Pro. As demais continuam na busca, e você pode visitá-las pelo endereço.',
  },
  ESQUECI_SENHA,
  TROCAR_EMAIL,
];

const PERGUNTAS_OFICINA = [
  {
    pergunta: 'Como os Entusiastas encontram minha oficina?',
    resposta:
      'Pela busca por proximidade e pela busca por projeto, que mostra as oficinas que fazem os serviços que o Entusiasta precisa. Mantenha a aba "Serviços" sempre atualizada.',
  },
  {
    pergunta: 'O que o plano Pro oferece?',
    resposta:
      'Sua logo, até 6 fotos na galeria e o botão de WhatsApp no perfil da oficina. Sem o Pro, sua oficina continua aparecendo nas buscas.',
  },
  {
    pergunta: 'O que acontece quando o plano Pro vence?',
    resposta:
      'Logo, fotos e WhatsApp ficam ocultos, mas nada é apagado. Ao renovar em Perfil > Meu plano, tudo volta a aparecer.',
  },
  {
    pergunta: 'Como pago o plano?',
    resposta:
      'Via PIX, aqui mesmo no app. Depois de pagar, o plano é ativado automaticamente. Se demorar, use "Já paguei, verificar" em Perfil > Meu plano.',
  },
  {
    pergunta: 'Como atualizo minha faixa de preço?',
    resposta: 'Em Perfil > Meus dados. Escolha a faixa ($ a $$$) que melhor representa o custo médio dos seus serviços.',
  },
  {
    pergunta: 'Posso mudar o endereço da oficina?',
    resposta: 'Sim, em Perfil > Endereço. O novo endereço precisa estar a até 4 km do SENAC Nações Unidas.',
  },
  ESQUECI_SENHA,
  TROCAR_EMAIL,
];

const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function FaqItem({ pergunta, resposta }) {
  const { colors, typography, fonts, radius } = useTheme();
  const [aberto, setAberto] = useState(false);

  function alternar() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAberto((v) => !v);
  }

  return (
    <Pressable
      onPress={alternar}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberto }}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
          borderColor: aberto ? colors.primary : colors.border,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={styles.itemTopo}>
        <Text style={[typography.bodyStrong, styles.pergunta, { color: colors.text }]}>{pergunta}</Text>
        <ChevronDown
          size={18}
          color={aberto ? colors.primary : colors.textSecondary}
          style={{ transform: [{ rotate: aberto ? '180deg' : '0deg' }] }}
        />
      </View>
      {aberto ? (
        <Text style={[typography.body, styles.resposta, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          {resposta}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function AjudaScreen({ navigation }) {
  const { tipoConta } = useAuth();
  const [busca, setBusca] = useState('');

  const perguntas = tipoConta === 'oficina' ? PERGUNTAS_OFICINA : PERGUNTAS_USUARIO;

  const filtradas = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) return perguntas;
    return perguntas.filter((p) => normalizar(`${p.pergunta} ${p.resposta}`).includes(termo));
  }, [busca, perguntas]);

  return (
    <ScreenContainer>
      <ScreenHeader onVoltar={() => navigation.goBack()} titulo="Dúvidas frequentes" />

      <Input
        Icone={Search}
        placeholder="Buscar uma dúvida"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
      />

      {filtradas.length === 0 ? (
        <EmptyState compacto Icone={SearchX} titulo="Nada encontrado" descricao={`Nenhuma dúvida sobre "${busca}".`} />
      ) : (
        filtradas.map((item) => <FaqItem key={item.pergunta} {...item} />)
      )}

      <View style={styles.contato}>
        <QuickActionCard
          Icone={MessageSquareWarning}
          titulo="Não achou o que procurava?"
          subtitulo="Fale com a nossa equipe por e-mail"
          onPress={() => abrirEmailSuporte('Dúvida sobre o app TuningHub')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  item: { borderWidth: 1, padding: 16, marginBottom: 10 },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pergunta: { flex: 1, marginRight: 12 },
  resposta: { marginTop: 10 },
  contato: { marginTop: 16 },
});