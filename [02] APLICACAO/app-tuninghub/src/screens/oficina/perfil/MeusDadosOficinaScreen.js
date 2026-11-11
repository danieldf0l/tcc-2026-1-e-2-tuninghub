import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Store, Building2, User, Phone, Mail, Lock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { atualizarMinhaFaixaPreco } from '../../../api/oficina.api';
import { atualizarMeusDados } from '../../../api/conta.api';
import { getErrorMessage } from '../../../utils/errorHandler';
import { mascaraCnpj, mascaraTelefone, somenteDigitos } from '../../../utils/formatters';
import { emailValido } from '../../../utils/validadores';
import { descreverFaixaPreco } from '../../../utils/faixaPreco';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import FaixaPrecoSelector from '../../../components/FaixaPrecoSelector';
import AvisoInline from '../../../components/AvisoInline';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const CAMPOS = ['nomeOficina', 'nomeProprietario', 'telefone', 'email'];

// Telefone compara/envia só os números; o resto, sem espaços nas pontas
const normalizar = (campo, valor) => (campo === 'telefone' ? somenteDigitos(valor) : (valor || '').trim());

function formDoUsuario(usuario) {
  return {
    nomeOficina: usuario?.NomeOficina || '',
    nomeProprietario: usuario?.NomeProprietario || '',
    telefone: mascaraTelefone(usuario?.Telefone || ''),
    email: usuario?.Email || '',
  };
}

export default function MeusDadosOficinaScreen({ navigation }) {
  const { colors, fonts, typography, radius } = useTheme();
  const { usuario, atualizarUsuario } = useAuth();
  const { mostrar } = useToast();

  const atual = formDoUsuario(usuario);

  const [form, setForm] = useState(atual);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [erroDados, setErroDados] = useState('');
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [faixaPreco, setFaixaPreco] = useState(usuario?.FaixaPreco || null);
  const [salvandoFaixa, setSalvandoFaixa] = useState(false);

  // Sincroniza o formulário quando o contexto muda (salvar ou confirmar novo e-mail)
  useEffect(() => {
    setForm(formDoUsuario(usuario));
  }, [usuario?.NomeOficina, usuario?.NomeProprietario, usuario?.Telefone, usuario?.Email]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const camposAlterados = CAMPOS.filter((c) => normalizar(c, form[c]) !== normalizar(c, atual[c]));
  const trocouEmail = camposAlterados.includes('email');
  const alterado = camposAlterados.length > 0;

  async function handleSalvarDados() {
    setErroDados('');
    setCamposComErro([]);

    if (!form.nomeOficina.trim()) {
      setErroDados('O nome da oficina não pode ficar vazio.');
      setCamposComErro(['nomeOficina']);
      return;
    }
    const telefone = somenteDigitos(form.telefone);
    if (telefone && telefone.length < 10) {
      setErroDados('Telefone incompleto. Informe o DDD e o número.');
      setCamposComErro(['telefone']);
      return;
    }
    if (trocouEmail && !emailValido(form.email)) {
      setErroDados('Informe um e-mail válido.');
      setCamposComErro(['email']);
      return;
    }
    if (trocouEmail && !senhaAtual) {
      setErroDados('Informe sua senha atual para trocar o e-mail.');
      setCamposComErro(['senhaAtual']);
      return;
    }

    const campos = {};
    camposAlterados.forEach((c) => {
      campos[c] = normalizar(c, form[c]);
    });
    if (trocouEmail) campos.senhaAtual = senhaAtual;

    setSalvandoDados(true);
    try {
      const { perfil, emailPendente } = await atualizarMeusDados('oficina', campos);
      atualizarUsuario(perfil);
      setSenhaAtual('');
      if (emailPendente) {
        atualizarCampo('email', atual.email); // o e-mail só muda depois de confirmar o código
        navigation.navigate('ConfirmarTrocaEmail', { emailPendente });
      } else {
        mostrar('Dados atualizados.');
      }
    } catch (e) {
      setErroDados(getErrorMessage(e));
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleSalvarFaixaPreco(novaFaixa) {
    const anterior = faixaPreco;
    setFaixaPreco(novaFaixa);
    setSalvandoFaixa(true);
    try {
      await atualizarMinhaFaixaPreco(novaFaixa);
      atualizarUsuario({ FaixaPreco: novaFaixa });
      mostrar('Faixa de preço atualizada.');
    } catch (e) {
      setFaixaPreco(anterior); // reverte em caso de falha
      mostrar(getErrorMessage(e), 'erro');
    } finally {
      setSalvandoFaixa(false);
    }
  }

  const rodape = alterado ? (
    <>
      <AvisoInline mensagem={erroDados} />
      <Button title="Salvar alterações" onPress={handleSalvarDados} loading={salvandoDados} />
    </>
  ) : null;

  const descricaoFaixa = descreverFaixaPreco(faixaPreco);

  return (
    <ScreenContainer rodape={rodape}>
      <ScreenHeader onVoltar={() => navigation.goBack()} titulo="Meus dados" subtitulo="Informações da sua oficina." />

      <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Faixa de preço</Text>
      <Text style={[typography.caption, styles.descricao, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
        Ajuda os Entusiastas a entenderem o custo médio dos seus serviços antes de entrar em contato.
      </Text>
      <FaixaPrecoSelector valor={faixaPreco} onSelecionar={handleSalvarFaixaPreco} disabled={salvandoFaixa} />
      {descricaoFaixa ? (
        <Text style={[typography.caption, styles.faixaDescricao, { color: colors.primary, fontFamily: fonts.semibold }]}>
          {descricaoFaixa}
        </Text>
      ) : null}

      <Text style={[typography.overline, styles.secao, styles.secaoEspaco, { color: colors.textSecondary }]}>
        Dados da oficina
      </Text>

      <Input
        label="Nome da oficina"
        Icone={Store}
        value={form.nomeOficina}
        onChangeText={(v) => atualizarCampo('nomeOficina', v)}
        autoCapitalize="words"
        error={camposComErro.includes('nomeOficina')}
      />

      {/* CNPJ: validado na Receita no cadastro, não editável */}
      <View style={[styles.cnpj, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
        <Building2 size={18} color={colors.textSecondary} strokeWidth={2} />
        <View style={styles.flex}>
          <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>CNPJ</Text>
          <Text style={[typography.body, { color: colors.text }]}>{mascaraCnpj(usuario?.CNPJ || '') || '—'}</Text>
        </View>
        <Lock size={16} color={colors.textSecondary} />
      </View>
      <Text style={[typography.caption, styles.cnpjDica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
        Validado na Receita Federal no cadastro. Não pode ser alterado.
      </Text>

      <Input
        label="Nome do proprietário"
        Icone={User}
        value={form.nomeProprietario}
        onChangeText={(v) => atualizarCampo('nomeProprietario', v)}
        autoCapitalize="words"
      />
      <Input
        label="Telefone (WhatsApp)"
        Icone={Phone}
        value={form.telefone}
        onChangeText={(v) => atualizarCampo('telefone', mascaraTelefone(v))}
        keyboardType="phone-pad"
        maxLength={15}
        error={camposComErro.includes('telefone')}
      />
      <Input
        label="E-mail"
        Icone={Mail}
        value={form.email}
        onChangeText={(v) => atualizarCampo('email', v)}
        keyboardType="email-address"
        error={camposComErro.includes('email')}
      />

      {trocouEmail ? (
        <>
          <AvisoInline tipo="info" mensagem="Para trocar o e-mail, confirme sua senha. Enviaremos um código para o novo endereço." />
          <Input
            label="Senha atual"
            Icone={Lock}
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureText
            autoComplete="current-password"
            textContentType="password"
            error={camposComErro.includes('senhaAtual')}
          />
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  secao: { marginBottom: 6, marginLeft: 4 },
  secaoEspaco: { marginTop: 28, marginBottom: 12 },
  descricao: { marginBottom: 14, marginLeft: 4 },
  faixaDescricao: { textAlign: 'center', marginTop: 10 },
  cnpj: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10 },
  cnpjDica: { marginTop: 6, marginBottom: 16, marginLeft: 4 },
});