// Textos legais do TuningHub (versão de 21/05/2026)
// Apêndice J = Entusiasta (usuário) · Apêndice K = Oficina
// Use getDocumentosLegais(tipoConta) para pegar o documento certo de cada perfil.

export const DATA_ATUALIZACAO = '21/05/2026';
export const EMAIL_DPO = 'adm@tuninghub.net.br';

// ---------------------------------------------------------------------------
// APÊNDICE J — USUÁRIOS (ENTUSIASTAS)
// ---------------------------------------------------------------------------

export const TERMOS_USUARIO = {
  introducao:
    'O presente Termo de Uso se refere a um contrato de adesão firmado entre o usuário e o fornecedor deste serviço, o TuningHub, localizado em São Paulo - SP. O uso deste serviço está condicionado à aceitação dos termos e das políticas associadas. O usuário deverá ler tais termos e políticas, certificar-se de havê-los entendido, concordar com todas as condições estabelecidas no Termo de Uso e se comprometer a cumpri-las. Ao utilizar o serviço, o usuário manifesta sua livre, expressa e inequívoca concordância com relação ao conteúdo deste Termo de Uso e estará legalmente vinculado a todas as condições aqui previstas.',
  clausulas: [
    {
      titulo: 'CLÁUSULA PRIMEIRA – DO OBJETO',
      itens: [
        '1.1 O presente texto tem por objeto estabelecer as regras e condições para a utilização do aplicativo TuningHub pelo USUÁRIO. A aplicação consiste em uma solução digital no formato Mobile, destinada a:',
        'i. Organização e gestão de projetos de customização automotiva por meio de listas de afazeres (To-do lists).',
        'ii. Descoberta e visualização de oficinas automotivas especializadas cadastradas na base da APLICAÇÃO, ordenadas por proximidade geográfica.',
        '1.2 Fica estabelecido que o APLICATIVO atua exclusivamente como ferramenta tecnológica de busca e organização, não prestando serviços automotivos, não vendendo peças e não se responsabilizando pelos serviços eventualmente contratados pelo USUÁRIO junto às oficinas.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEGUNDA – DO CADASTRO E ACESSO',
      itens: [
        '2.1 Para acessar as funcionalidades restritas do aplicativo, o USUÁRIO deverá realizar cadastro prévio, fornecendo obrigatoriamente os seguintes dados válidos: Nome, E-mail e Senha.',
        '2.2 A autenticação por login (e-mail e senha) é requisito obrigatório para a liberação das áreas privadas, bem como para a criação, edição ou exclusão de qualquer dado vinculado à conta.',
        '2.3 O USUÁRIO é o único e exclusivo responsável pela veracidade e atualização dos dados fornecidos, bem como pela guarda e sigilo de suas credenciais de acesso (e-mail e senha), não sendo possível, em qualquer hipótese, a alegação de uso indevido após o ato de compartilhamento da senha.',
      ],
    },
    {
      titulo: 'CLÁUSULA TERCEIRA – DAS FUNCIONALIDADES E LIMITAÇÕES',
      itens: [
        '3.1 Gestão de Projetos: O aplicativo impõe a regra restritiva de um teto máximo de 3 (três) projetos de customização simultâneos ativos por conta de USUÁRIO e outros 3 (três) arquivados até a deleção.',
        '3.2 Para a abertura de todo novo projeto de modificação, é obrigatória a inserção dos dados de "marca" e "modelo" do veículo.',
        '3.3 Geolocalização: A busca por oficinas baseia-se na localização para cálculo de distância. O USUÁRIO expressamente concorda que o sistema obterá essas coordenadas por meio da geolocalização do dispositivo, ou, na ausência deste, um endereço do Centro Universitário SENAC.',
        '3.4 Contato com Oficinas: A PLATAFORMA poderá disponibilizar um botão dinâmico para redirecionamento direto ao WhatsApp das oficinas assinantes do "Plano Pro". O TUNINGHUB não monitora, não intermedeia e não se responsabiliza pelas tratativas realizadas fora do ambiente do aplicativo.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUARTA – DAS CONDIÇÕES FINANCEIRAS',
      itens: [
        '4.1 O acesso e o uso de todas as funcionalidades disponibilizadas ao USUÁRIO são inteiramente gratuitos.',
        '4.2 Fica expressamente vedado ao sistema aceitar ou processar qualquer transação financeira por parte do USUÁRIO final. O TUNINGHUB não realiza intermediação financeira ou cobrança de comissões e/ou taxas sobre serviços prestados pelas oficinas.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUINTA – DA PROPRIEDADE INTELECTUAL',
      itens: [
        '5.1 Todos os direitos de propriedade intelectual relativos ao aplicativo TuningHub, incluindo, mas não se limitando a código-fonte, bancos de dados, interfaces gráficas, logotipos e design institucional, são de titularidade exclusiva da APLICAÇÃO.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEXTA – DA EXCLUSÃO DA CONTA E RESCISÃO',
      itens: [
        '6.1 O USUÁRIO poderá, a qualquer tempo, sem necessidade de apresentar justificativa e por sua livre conveniência, solicitar a exclusão de sua conta através das configurações do próprio aplicativo.',
        '6.2 O TUNINGHUB reserva-se o direito de suspender ou cancelar, sem aviso prévio, a conta de USUÁRIOS que violarem os presentes Termos de Uso ou a legislação vigente.',
      ],
    },
    {
      titulo: 'CLÁUSULA SÉTIMA – FORO',
      itens: [
        '7.1 As Partes elegem o foro da Comarca de São Paulo, Estado de São Paulo, como o único competente para dirimir quaisquer controvérsias oriundas deste instrumento.',
      ],
    },
  ],
};

export const PRIVACIDADE_USUARIO = {
  introducao:
    'A presente Política de Privacidade regula de forma transparente o tratamento de dados pessoais dos USUÁRIOS do aplicativo TUNINGHUB, em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).',
  clausulas: [
    {
      titulo: 'CLÁUSULA PRIMEIRA – DOS DADOS COLETADOS E FINALIDADE',
      itens: [
        '1.1 O TUNINGHUB, na qualidade de Controlador, coleta os seguintes dados pessoais fornecidos diretamente pelo USUÁRIO durante o cadastro: Nome, E-mail e Senha.',
        'i. Finalidade: Autenticação segura, identificação do usuário na plataforma e viabilização do fluxo de recuperação de credenciais.',
        '1.2 Dados de Geolocalização: O aplicativo processa dados de localização, durante o uso do aplicativo, via GPS do dispositivo ou por endereço inserido manualmente.',
        'ii. Finalidade: Executar buscas parametrizadas e ordenação crescente de oficinas com base na distância.',
        '1.3 Dados de Projetos: Dados técnicos do veículo (Marca e Modelo) inseridos ativamente pelo usuário.',
        'iii. Finalidade: Viabilizar a criação e o mapeamento de listas de pendências (To-Do Lists) estruturadas.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEGUNDA – DO ARMAZENAMENTO E SEGURANÇA DA INFORMAÇÃO',
      itens: [
        '2.1 Os dados pessoais são armazenados de forma persistente e segura em banco de dados relacional MySQL.',
        '2.2 O TUNINGHUB aplica algoritmos de criptografia unidirecional (hashing) para todo e qualquer armazenamento de senhas no banco de dados, impedindo o acesso por colaboradores internos do TUNINGHUB ou terceiros não autorizados.',
        '2.3 Toda a troca de informações entre a interface do aplicativo (front-end) e os servidores (API/back-end) ocorre obrigatoriamente através de protocolos seguros de comunicação, visando mitigar interceptações.',
      ],
    },
    {
      titulo: 'CLÁUSULA TERCEIRA – DO COMPARTILHAMENTO DE DADOS',
      itens: [
        '3.1 O TUNINGHUB não comercializa os dados pessoais dos USUÁRIOS.',
        '3.2 O compartilhamento de informações ocorrerá exclusivamente mediante obrigações legais, e, integração com provedores de infraestrutura necessários para o funcionamento da plataforma, tais como a API do OpenStreetMap para serviços de localização e estruturação visual no mapa.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUARTA – DOS DIREITOS DO TITULAR DOS DADOS (LGPD)',
      itens: [
        '4.1 Em estrito cumprimento à LGPD, o USUÁRIO possui, dentre outros, o direito de acesso, correção de dados incompletos ou desatualizados, e a eliminação dos dados tratados.',
        '4.2 Direito ao Esquecimento / Exclusão: Havendo a solicitação formal de exclusão de conta pelo usuário na interface da aplicação, o sistema possui a obrigação técnica de executar a remoção física e imediata de todos os dados pessoais identificáveis associados àquele usuário (nome, e-mail e projetos vinculados) do banco de dados.',
        '4.3 Fica ressalvado que dados residuais gerados pela utilização do aplicativo poderão ser retidos exclusivamente para fins estatísticos sistêmicos, devendo, para tanto, ser categoricamente anonimizados, inviabilizando qualquer identificação reversa do titular.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUINTA – DISPOSIÇÕES FINAIS E CONTATO',
      itens: [
        '5.1 Esta Política de Privacidade poderá ser atualizada periodicamente. Versões revisadas serão publicadas no aplicativo.',
        `5.2 Para o exercício de direitos referentes à LGPD, denúncias/reports ou para sanar dúvidas sobre o tratamento de dados, o USUÁRIO deverá entrar em contato com o Encarregado pelo Tratamento de Dados Pessoais (Data Protection Officer - DPO) através do e-mail: ${EMAIL_DPO}.`,
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// APÊNDICE K — PRESTADORES DE SERVIÇOS (OFICINAS)
// ---------------------------------------------------------------------------

export const TERMOS_OFICINA = {
  introducao:
    'O presente Termo de Uso se refere a um contrato de adesão firmado entre a OFICINA e o fornecedor deste serviço, o TuningHub, localizado em São Paulo - SP. O uso deste serviço está condicionado à aceitação dos termos e das políticas associadas. A OFICINA deverá ler tais termos e políticas, certificar-se de havê-los entendido, concordar com todas as condições estabelecidas no Termo de Uso e se comprometer a cumpri-las. Ao utilizar o serviço, o usuário manifesta sua livre, expressa e inequívoca concordância com relação ao conteúdo deste Termo de Uso e estará legalmente vinculado a todas as condições aqui previstas.',
  clausulas: [
    {
      titulo: 'CLÁUSULA PRIMEIRA – DO OBJETO',
      itens: [
        '1.1 O presente instrumento tem por objeto regular a disponibilização de espaço virtual na PLATAFORMA para que a OFICINA possa divulgar seu estabelecimento comercial, suas especialidades técnicas, endereço institucional e canais de contato, visando à aproximação com os usuários entusiastas automotivos.',
        '1.2 Fica estabelecido que o TUNINGHUB atua como mero provedor de aplicação de dispositivos móveis e facilitador de busca por geolocalização, não constituindo agenciamento, parceria comercial, consórcio ou intermediação de negócios, limitando-se a exibir o perfil da OFICINA aos usuários finais, consumindo fotos e logos informadas pela OFICINA para constituição do perfil.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEGUNDA – DO CADASTRO, REQUISITOS E VALIDAÇÃO',
      itens: [
        '2.1 Para a inserção de seu perfil na plataforma, a OFICINA deverá preencher formulário eletrônico fornecendo dados verídicos, exatos e atualizados, incluindo: Razão Social/Nome, CNPJ, Endereço Completo, Telefone de Contato (WhatsApp) e Especialidades de customização/manutenção.',
        '2.2 O acesso à área de gestão do perfil é obrigatoriamente mediante inserção de login e senha confidenciais, cuja guarda e sigilo permanecem sob responsabilidade exclusiva da OFICINA, não sendo possível, em qualquer hipótese, a alegação de uso indevido após o ato de compartilhamento das credenciais.',
        '2.3 A OFICINA declara possuir todas as autorizações, alvarás de funcionamento e licenças ambientais e municipais necessárias para o exercício de sua atividade econômica, isentando a PLATAFORMA de qualquer fiscalização correlata.',
      ],
    },
    {
      titulo: 'CLÁUSULA TERCEIRA – DOS PLANOS E DAS CONDIÇÕES FINANCEIRAS',
      itens: [
        '3.1 A PLATAFORMA disponibilizará modalidades distintas de exibição e funcionalidades para a OFICINA, estruturadas sob a delimitação de planos gratuitos e planos pagos:',
        'i. Plano Básico (Gratuito): Permite a inserção do perfil comercial na base de dados geral e exibição simples nos resultados de busca por geolocalização dos usuários entusiastas.',
        'ii. Plano Pro (Pago): Contempla benefícios adicionais de personalização do perfil público e a ativação de botão dinâmico para redirecionamento direto do usuário ao canal de atendimento via WhatsApp da OFICINA.',
        '3.2 Pela contratação do Plano Pro, a OFICINA pagará ao TUNINGHUB a importância recorrente de R$ 1.299,71 (MIL DUZENTOS E NOVENTA E NOVE REAIS E SETENTA E UM CENTAVOS), com periodicidade ANUAL ou R$ 113,72 (CENTO E TREZE REAIS E SETENTA E DOIS CENTAVOS), com periodicidade MENSAL, vencendo-se a primeira parcela na data de ativação dos recursos avançados.',
        '3.3 Os valores dos planos pagos poderão ser reajustados anualmente com base na variação positiva do IPCA/IBGE ou outro índice oficial que venha a substituí-lo.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUARTA – DAS OBRIGAÇÕES DA OFICINA',
      itens: [
        '4.1 Constituem obrigações exclusivas da OFICINA, sob pena de rescisão contratual imediata ou retenção do conteúdo publicado no aplicativo:',
        'i. Prestar os serviços automotivos eventualmente acordados com os usuários entusiastas em estrita observância às normas do Código de Defesa do Consumidor (CDC) e aos padrões técnicos de segurança automotiva.',
        'ii. Manter seus dados cadastrais, canais de contato e serviços prestados rigorosamente atualizados na PLATAFORMA.',
        'iii. Não veicular anúncios, imagens ou descrições falsas, abusivas, de cunho discriminatório ou que violem direitos de propriedade intelectual de terceiros.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUINTA – DA INEXISTÊNCIA DE VÍNCULO E LIMITAÇÃO DE RESPONSABILIDADE',
      itens: [
        '5.1 O presente contrato não estabelece qualquer vínculo societário, empregatício, de representação ou de responsabilidade solidária ou subsidiária entre o TUNINGHUB e a OFICINA.',
        '5.2 A PLATAFORMA não garante o fechamento de contratos, volume de orçamentos ou faturamento mínimo à OFICINA em decorrência da utilização do aplicativo.',
        '5.3 O TUNINGHUB não responde por eventuais inadimplementos financeiros, avarias em veículos, desistências ou condutas ilícitas praticadas pelos usuários que contatarem a OFICINA por intermédio do aplicativo, operando esta última sob o princípio da exclusão de responsabilidade por atos de terceiros.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEXTA – DA PROPRIEDADE INTELECTUAL E LICENÇA DE USO DE MARCA',
      itens: [
        '6.1 A OFICINA concede ao TUNINGHUB, a título gratuito e pelo período em que mantiver seu cadastro ativo, licença não exclusiva de uso de seus sinais distintivos, logotipos, marcas e fotografias do estabelecimento, exclusivamente para fins de exibição na interface do aplicativo e materiais promocionais de divulgação da própria PLATAFORMA.',
      ],
    },
    {
      titulo: 'CLÁUSULA SÉTIMA – DA RESCISÃO E DO CANCELAMENTO',
      itens: [
        '7.1 O presente instrumento vige por prazo indeterminado, podendo qualquer das partes rescindi-lo imotivadamente mediante manifestação expressa através das ferramentas de exclusão sistêmica integradas ao painel da OFICINA.',
        // ATENÇÃO: o backend agora calcula reembolso proporcional (e integral em até 7 dias).
        // Este texto precisa ser revisado pelo grupo para não contradizer essa regra.
        '7.2 O cancelamento do Plano Pro poderá ser solicitado a qualquer momento, cessando-se as cobranças para o período subsequente, inexistindo direito a estorno ou reembolso proporcional dos valores já adimplidos relativos ao ciclo de faturamento vigente. Concomitantemente, a OFICINA será alocada novamente aos recursos do plano gratuito.',
      ],
    },
    {
      titulo: 'CLÁUSULA OITAVA – DO FORO DE ELEIÇÃO',
      itens: [
        '8.1 Para resolução de quaisquer dúvidas ou litígios oriundos da interpretação ou execução deste instrumento, as Partes elegem o foro da Comarca de São Paulo, Estado de São Paulo, com exclusão de qualquer outro, por mais privilegiado que seja.',
      ],
    },
  ],
};

export const PRIVACIDADE_OFICINA = {
  introducao:
    'Este documento estabelece as diretrizes institucionais do TUNINGHUB relativas ao processamento, armazenamento e compartilhamento de dados coletados junto às OFICINAS cadastradas, em conformidade com as regras dispostas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).',
  clausulas: [
    {
      titulo: 'CLÁUSULA PRIMEIRA – DOS DADOS COLETADOS E NATUREZA JURÍDICA',
      itens: [
        '1.1 O TUNINGHUB realiza a coleta e o processamento de dados fornecidos ativamente pela OFICINA, os quais compreendem dados de natureza jurídica (informações corporativas públicas) e dados pessoais de seus representantes legais e prepostos.',
        '1.2 Os dados coletados englobam: Razão Social, CNPJ, Nome do Representante Legal, E-mail Corporativo, Endereço Comercial, Telefone Comercial/WhatsApp e Credenciais de Autenticação (Senha).',
        '1.3 São coletados, outrossim, dados de geolocalização do estabelecimento, nos termos do artigo 15 do Marco Civil da Internet.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEGUNDA – DA FINALIDADE E BASE LEGAL DO TRATAMENTO',
      itens: [
        '2.1 O tratamento dos dados coletados possui fundamentação nas seguintes bases legais e estritas finalidades:',
        'i. Execução de Contrato: Viabilizar a criação do perfil, faturamento do Plano Pro, indexação geográfica no mapa do aplicativo e direcionamento de cliques para o WhatsApp comercial.',
        'ii. Cumprimento de Obrigação Legal: Guarda dos registros de acesso à aplicação (logs) para fins de identificação em caso de ilícitos cibernéticos.',
        'iii. Legítimo Interesse: Otimização técnica da aplicação, prevenção a fraudes no cadastro e envio de comunicações operacionais.',
      ],
    },
    {
      titulo: 'CLÁUSULA TERCEIRA – DA EXIBIÇÃO PÚBLICA E COMPARTILHAMENTO DE DADOS',
      itens: [
        '3.1 A OFICINA declara estar ciente de que, por força da própria natureza do serviço de divulgação objeto da PLATAFORMA, seus dados comerciais (Nome Fantasia, Endereço, Especialidades Técnicas e Telefone de Contato) serão exibidos de forma pública e irrestrita a todos os usuários que efetuarem buscas no aplicativo.',
        '3.2 O compartilhamento interno de dados com prestadores de serviços de infraestrutura em nuvem e intermediadores de pagamento integrados, assegurando-se que tais entes terceirizados possuam níveis de conformidade adequados à LGPD.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUARTA – DA SEGURANÇA E ARMAZENAMENTO DAS INFORMAÇÕES',
      itens: [
        '4.1 Os dados coletados são mantidos em ambiente seguro (banco de dados MySQL), com tráfego protegido por protocolos e certificados de segurança.',
        '4.2 As senhas de acesso criadas pelos operadores da OFICINA passam por processo de hashing criptográfico antes do armazenamento físico, impedindo o acesso por colaboradores internos do TUNINGHUB ou terceiros não autorizados.',
      ],
    },
    {
      titulo: 'CLÁUSULA QUINTA – DOS DIREITOS DOS TITULARES E EXCLUSÃO DEFINITIVA',
      itens: [
        '5.1 Aos profissionais pessoas físicas vinculados às OFICINAS são garantidos todos os direitos previstos no artigo 18 da LGPD (confirmação, acesso, retificação, oposição e exclusão).',
        '5.2 Mediante a solicitação de encerramento de conta, o TUNINGHUB procederá à exclusão lógica e física dos dados cadastrais associados no prazo técnico aplicável, ressalvada a guarda obrigatória dos registros de acesso pelo prazo legal de 6 (seis) meses exigido pelo Marco Civil da Internet, ou para defesa em juízo.',
      ],
    },
    {
      titulo: 'CLÁUSULA SEXTA – DAS ALTERAÇÕES E CANAL DE ATENDIMENTO',
      itens: [
        '6.1 Esta Política poderá sofrer alterações estruturais visando ao aprimoramento da segurança. As modificações serão notificadas através do painel de controle da OFICINA.',
        `6.2 Para requisições relativas à privacidade de dados, a OFICINA ou seus colaboradores poderão contatar o Encarregado de Proteção de Dados (DPO) por meio do canal eletrônico: ${EMAIL_DPO}.`,
      ],
    },
  ],
};

// Documento certo para cada perfil ('usuario' | 'oficina'). Sem tipo, usa o do usuário.
export function getDocumentosLegais(tipoConta) {
  return tipoConta === 'oficina'
    ? { termos: TERMOS_OFICINA, privacidade: PRIVACIDADE_OFICINA }
    : { termos: TERMOS_USUARIO, privacidade: PRIVACIDADE_USUARIO };
}

// Nomes antigos, mantidos para não quebrar telas que ainda importam assim
export const TERMOS_DE_USO = TERMOS_USUARIO;
export const POLITICA_DE_PRIVACIDADE = PRIVACIDADE_USUARIO;
