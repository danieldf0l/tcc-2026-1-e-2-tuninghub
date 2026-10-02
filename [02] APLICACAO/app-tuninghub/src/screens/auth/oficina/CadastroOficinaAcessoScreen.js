import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Input from '../../../components/Input';
import Checkbox from '../../../components/Checkbox';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

export default function CadastroOficinaAcessoScreen({ navigation }) {
  const { colors } = useTheme();
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [erro, setErro] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);

  function handleProximo() {
    setErro('');
    const vazios = [];
    if (!nomeProprietario) vazios.push('nomeProprietario');
    if (!email) vazios.push('email');
    if (!senha) vazios.push('senha');
    if (!confirmarSenha) vazios.push('confirmarSenha');

    if (vazios.length > 0) {
      setErro('Preencha todos os campos.');
      setCamposComErro(vazios);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCamposComErro(['senha', 'confirmarSenha']);
      return;
    }

    if (!termosAceitos) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setCamposComErro([]);
    navigation.navigate('CadastroOficinaDados', {
      nomeProprietario,
      email,
      senha,
      termosAceitos,
    });
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.etapa, { color: colors.primary }]}>Etapa 1 de 3</Text>
      <Text style={[styles.title, { color: colors.text }]}>Para acesso</Text>

      <Input
        placeholder="Nome do Proprietário"
        value={nomeProprietario}
        onChangeText={setNomeProprietario}
        error={camposComErro.includes('nomeProprietario')}
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={camposComErro.includes('email')}
      />
      <Input
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureText
        error={camposComErro.includes('senha')}
      />
      <Input
        placeholder="Confirmar Senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureText
        error={camposComErro.includes('confirmarSenha')}
      />

      <View style={{ height: 8 }} />
      <Checkbox marcado={termosAceitos} onToggle={() => setTermosAceitos((v) => !v)}>
        <Text style={{ color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 }}>
          Li e concordo com os{' '}
          <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => navigation.navigate('Termos')}>
            Termos de Uso
          </Text>{' '}
          e a{' '}
          <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => navigation.navigate('Privacidade')}>
            Política de Privacidade
          </Text>
        </Text>
      </Checkbox>

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