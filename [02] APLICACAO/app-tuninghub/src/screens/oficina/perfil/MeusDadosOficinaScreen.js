import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Lock, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { atualizarMinhaFaixaPreco } from '../../../api/oficina.api';
import { atualizarMeusDados } from '../../../api/conta.api';
import { getErrorMessage } from '../../../utils/errorHandler';
import Input from '../../../components/Input';
import FaixaPrecoSelector from '../../../components/FaixaPrecoSelector';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';
import MenuSection from '../../../components/MenuSection';
import MenuListItem from '../../../components/MenuListItem';

const CAMPOS = ['nomeOficina', 'nomeProprietario', 'telefone', 'email'];

export default function MeusDadosOficinaScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario, atualizarUsuario } = useAuth();

  const atual = {
    nomeOficina: usuario?.NomeOficina || '',
    nomeProprietario: usuario?.NomeProprietario || '',
    telefone: usuario?.Telefone || '',
    email: usuario?.Email || '',
  };

  const [form, setForm] = useState(atual);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [erroDados, setErroDados] = useState('');
  const [sucessoDados, setSucessoDados] = useState('');
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [faixaPreco, setFaixaPreco] = useState(usuario?.FaixaPreco || null);
  const [salvandoFaixa, setSalvandoFaixa] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Sincroniza o formulário quando o contexto muda (salvar ou confirmar novo e-mail)
  useEffect(() => {
    setForm({
      nomeOficina: usuario?.NomeOficina || '',
      nomeProprietario: usuario?.NomeProprietario || '',
      telefone: usuario?.Telefone || '',
      email: usuario?.Email || '',
    });
  }, [usuario?.NomeOficina, usuario?.NomeProprietario, usuario?.Telefone, usuario?.Email]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const camposAlterados = CAMPOS.filter((c) => form[c].trim() !== atual[c]);
  const trocouEmail = camposAlterados.includes('email');
  const alterado = camposAlterados.length > 0;

  async function handleSalvarDados() {
    setErroDados('');
    setSucessoDados('');
    setCamposComErro([]);

    if (!form.nomeOficina.trim()) {
      setErroDados('O nome da oficina não pode ficar vazio.');
      setCamposComErro(['nomeOficina']);
      return;
    }
    if (trocouEmail && !senhaAtual) {
      setErroDados('Informe sua senha atual para trocar o e-mail.');
      setCamposComErro(['senhaAtual']);
      return;
    }

    const campos = {};
    camposAlterados.forEach((c) => {
      campos[c] = form[c].trim();
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
        setSucessoDados('Dados atualizados.');
      }
    } catch (e) {
      setErroDados(getErrorMessage(e));
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleSalvarFaixaPreco(novaFaixa) {
    setErro('');
    setSucesso('');
    setFaixaPreco(novaFaixa);
    setSalvandoFaixa(true);
    try {
      await atualizarMinhaFaixaPreco(novaFaixa);
      atualizarUsuario({ FaixaPreco: novaFaixa });
      setSucesso('Faixa de preço atualizada.');
    } catch (e) {
      setErro(getErrorMessage(e));
      setFaixaPreco(usuario?.FaixaPreco || null); // reverte em caso de falha
    } finally {
      setSalvandoFaixa(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Meus dados</Text>

      <Text style={[styles.secaoLabel, { color: colors.textSecondary }]}>INFORMAÇÕES DA CONTA</Text>

      <Input
        label="Nome da Oficina"
        value={form.nomeOficina}
        onChangeText={(v) => atualizarCampo('nomeOficina', v)}
        autoCapitalize="words"
        error={camposComErro.includes('nomeOficina')}
      />
      <Input label="CNPJ" value={usuario?.CNPJ || ''} editable={false} />
      <Input
        label="Nome do Proprietário"
        value={form.nomeProprietario}
        onChangeText={(v) => atualizarCampo('nomeProprietario', v)}
        autoCapitalize="words"
      />
      <Input
        label="Email"
        value={form.email}
        onChangeText={(v) => atualizarCampo('email', v)}
        keyboardType="email-address"
      />
      {trocouEmail ? (
        <>
          <Text style={[styles.aviso, { color: colors.textSecondary }]}>
            Para trocar o e-mail, confirme sua senha. Enviaremos um código para o novo endereço.
          </Text>
          <Input
            label="Senha atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureText
            error={camposComErro.includes('senhaAtual')}
          />
        </>
      ) : null}
      <Input
        label="Telefone"
        value={form.telefone}
        onChangeText={(v) => atualizarCampo('telefone', v)}
        keyboardType="phone-pad"
      />

      {erroDados ? <Text style={[styles.mensagem, { color: colors.danger }]}>{erroDados}</Text> : null}
      {sucessoDados ? <Text style={[styles.mensagem, { color: colors.primary }]}>{sucessoDados}</Text> : null}

      <Button title="Salvar alterações" onPress={handleSalvarDados} loading={salvandoDados} disabled={!alterado} />

      <View style={{ height: 28 }} />
      <Text style={[styles.secaoLabel, { color: colors.textSecondary }]}>FAIXA DE PREÇO</Text>
      <Text style={[styles.descricao, { color: colors.textSecondary }]}>
        Isso ajuda clientes a entenderem o custo médio dos seus serviços antes de entrar em contato.
      </Text>

      <FaixaPrecoSelector valor={faixaPreco} onSelecionar={handleSalvarFaixaPreco} disabled={salvandoFaixa} />

      {erro ? <Text style={[styles.mensagem, { color: colors.danger }]}>{erro}</Text> : null}
      {sucesso ? <Text style={[styles.mensagem, { color: colors.primary }]}>{sucesso}</Text> : null}

      <MenuSection title="Segurança">
        <MenuListItem Icone={Lock} titulo="Alterar senha" onPress={() => navigation.navigate('AlterarSenha')} />
        <MenuListItem
          Icone={Trash2}
          titulo="Excluir conta da oficina"
          subtitulo="Apaga seus dados definitivamente"
          onPress={() => navigation.navigate('ExcluirConta')}
          perigo
          ultimo
        />
      </MenuSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 20 },
  secaoLabel: { fontSize: 12, fontWeight: '800', marginBottom: 12, letterSpacing: 0.5 },
  aviso: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  descricao: { fontSize: 13, marginBottom: 14, lineHeight: 19 },
  mensagem: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
});