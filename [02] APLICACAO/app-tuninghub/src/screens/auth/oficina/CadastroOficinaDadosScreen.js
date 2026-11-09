import { useState, useRef } from 'react';
import { Store, Building2, Phone } from 'lucide-react-native';
import { cnpjValido } from '../../../utils/validadores';
import { mascaraCnpj, mascaraTelefone, somenteDigitos } from '../../../utils/formatters';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import ProgressoEtapas from '../../../components/ProgressoEtapas';
import AvisoInline from '../../../components/AvisoInline';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

export default function CadastroOficinaDadosScreen({ route, navigation }) {
  const cnpjRef = useRef(null);
  const telefoneRef = useRef(null);

  const [nomeOficina, setNomeOficina] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);

  function handleProximo() {
    setErro('');
    const vazios = [];
    if (!nomeOficina.trim()) vazios.push('nomeOficina');
    if (!cnpj) vazios.push('cnpj');

    if (vazios.length > 0) {
      setErro('Preencha o nome da oficina e o CNPJ.');
      setCamposComErro(vazios);
      return;
    }

    if (!cnpjValido(cnpj)) {
      setErro('CNPJ inválido. Confira os números.');
      setCamposComErro(['cnpj']);
      return;
    }

    const telefoneDigitos = somenteDigitos(telefone);
    if (telefoneDigitos && telefoneDigitos.length < 10) {
      setErro('Telefone incompleto. Informe o DDD e o número.');
      setCamposComErro(['telefone']);
      return;
    }

    setCamposComErro([]);
    navigation.navigate('CadastroOficinaEndereco', {
      ...route.params,
      nomeOficina: nomeOficina.trim(),
      cnpj: somenteDigitos(cnpj),
      telefone: telefoneDigitos,
    });
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={<ProgressoEtapas atual={2} />}
        titulo="Sobre a oficina"
        subtitulo="O CNPJ é validado na Receita Federal e precisa ter atividade de manutenção ou reparação de veículos."
      />

      <Input
        Icone={Store}
        placeholder="Nome da oficina"
        value={nomeOficina}
        onChangeText={setNomeOficina}
        autoCapitalize="words"
        autoComplete="organization"
        textContentType="organizationName"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => cnpjRef.current?.focus()}
        error={camposComErro.includes('nomeOficina')}
      />
      <Input
        ref={cnpjRef}
        Icone={Building2}
        placeholder="CNPJ"
        value={cnpj}
        onChangeText={(v) => setCnpj(mascaraCnpj(v))}
        keyboardType="number-pad"
        maxLength={18}
        error={camposComErro.includes('cnpj')}
      />
      <Input
        ref={telefoneRef}
        Icone={Phone}
        placeholder="Telefone (opcional)"
        value={telefone}
        onChangeText={(v) => setTelefone(mascaraTelefone(v))}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={15}
        error={camposComErro.includes('telefone')}
      />

      <AvisoInline mensagem={erro} />

      <Button title="Continuar" onPress={handleProximo} />
    </ScreenContainer>
  );
}