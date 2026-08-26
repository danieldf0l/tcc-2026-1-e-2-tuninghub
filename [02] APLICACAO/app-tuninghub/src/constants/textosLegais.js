export const DATA_ATUALIZACAO = '21/05/2026';

export const TERMOS_DE_USO = {
  introducao:
    'O presente Termo de Uso se refere a um contrato de adesão firmado entre o usuário e o fornecedor deste serviço, o TuningHub, localizado em São Paulo - SP. O uso deste serviço está condicionado à aceitação dos termos e das políticas associadas. O usuário deverá ler tais termos e políticas, certificar-se de havê-los entendido, concordar com todas as condições estabelecidas no Termo de Uso e se comprometer a cumpri-las. Ao utilizar o serviço, o usuário manifesta sua livre, expressa e inequívoca concordância com relação ao conteúdo deste Termo de Uso e estará legalmente vinculado a todas as condições aqui previstas.',
  clausulas: [
    {
      titulo: 'CLÁUSULA PRIMEIRA – DO OBJETO',
      itens: [
        '1.1 O presente texto tem por objeto estabelecer as regras e condições para a utilização do aplicativo TuningHub pelo USUÁRIO. A aplicação consiste em uma solução digital no formato Progressive Web App (PWA), destinada a: (i) Organização e gestão de projetos de customização automotiva por meio de listas de afazeres (To-do lists); (ii) Descoberta e visualização de oficinas automotivas especializadas cadastradas na base da APLICAÇÃO, ordenadas por proximidade geográfica.',
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
        '3.1 Gestão de Projetos: O aplicativo impõe a regra restritiva de um teto máximo de 3 (três) projetos de customização simultâneos ativos por conta de USUÁRIO.',
        '3.2 Para a abertura de todo novo projeto de modificação, é obrigatória a inserção dos dados de "marca" e "modelo" do veículo.',
        '3.3 Geolocalização: A busca por oficinas baseia-se na localização para cálculo de distância. O USUÁRIO expressamente concorda que o sistema obterá essas coordenadas por meio da geolocalização do dispositivo, ou, na ausência deste, um endereço inserido manualmente.',
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

export const POLITICA_DE_PRIVACIDADE = {
  introducao:
    'A presente Política de Privacidade regula de forma transparente o tratamento de dados pessoais dos USUÁRIOS do aplicativo TUNINGHUB, em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).',
  clausulas: [
    {
      titulo: 'CLÁUSULA PRIMEIRA – DOS DADOS COLETADOS E FINALIDADE',
      itens: [
        '1.1 O TUNINGHUB, na qualidade de Controlador, coleta os seguintes dados pessoais fornecidos diretamente pelo USUÁRIO durante o cadastro: Nome, E-mail e Senha. Finalidade: autenticação segura, identificação do usuário na plataforma e viabilização do fluxo de recuperação de credenciais.',
        '1.2 Dados de Geolocalização: O aplicativo processa dados de localização, durante o uso do aplicativo, via GPS do dispositivo ou por endereço inserido manualmente. Finalidade: executar buscas parametrizadas e ordenação crescente de oficinas com base na distância.',
        '1.3 Dados de Projetos: Dados técnicos do veículo (Marca e Modelo) inseridos ativamente pelo usuário. Finalidade: viabilizar a criação e o mapeamento de listas de pendências (To-Do Lists) estruturadas.',
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
        '3.2 O compartilhamento de informações ocorrerá exclusivamente mediante obrigações legais, e integração com provedores de infraestrutura necessários para o funcionamento da plataforma, tais como serviços de localização e estruturação visual no mapa.',
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
        '5.2 Para o exercício de direitos referentes à LGPD, denúncias/reports ou para sanar dúvidas sobre o tratamento de dados, o USUÁRIO deverá entrar em contato com o Encarregado pelo Tratamento de Dados Pessoais (Data Protection Officer - DPO) através do e-mail: adm@tuninghub.net.br.',
      ],
    },
  ],
};