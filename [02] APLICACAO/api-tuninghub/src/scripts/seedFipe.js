// src/scripts/seedFipe.js
//
// Script de importação única do catálogo de montadoras/modelos
// a partir da API pública Parallelum FIPE (https://fipe.parallelum.com.br).
//
// COMO EXECUTAR (na raiz do projeto, com o .env apontando para o banco desejado):
//   node ./src/scripts/seedFipe.js
//
// Idempotente: pode ser executado mais de uma vez sem duplicar dados,
// pois verifica existência antes de inserir (mesma lógica do checkDuplicidade
// já usado no cadastro manual via API).
//
// Após rodar, a API do TuningHub nunca mais depende dessa API externa --
// ela só lê do banco local, normalmente.

import MontadoraRepository from '../repositories/montadora.repository.js';
import ModeloRepository from '../repositories/modelo.repository.js';

const BASE_URL = 'https://fipe.parallelum.com.br/api/v2/cars';
const DELAY_ENTRE_REQUISICOES_MS = 300; // evita bater no rate limit da API gratuita

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buscarMarcas() {
  const resposta = await fetch(`${BASE_URL}/brands`);
  if (!resposta.ok) {
    throw new Error(`Falha ao buscar marcas (status ${resposta.status})`);
  }
  return resposta.json();
}

async function buscarModelosDaMarca(brandCode) {
  const resposta = await fetch(`${BASE_URL}/brands/${brandCode}/models`);
  if (!resposta.ok) {
    throw new Error(`status ${resposta.status}`);
  }
  return resposta.json();
}

async function importarModelos(idMontadora, nomeMontadora, brandCode) {
  let modelos;
  try {
    modelos = await buscarModelosDaMarca(brandCode);
  } catch (error) {
    console.warn(`  ⚠️  Não foi possível buscar modelos de "${nomeMontadora}": ${error.message}`);
    return { criados: 0, existentes: 0 };
  }

  let criados = 0;
  let existentes = 0;

  for (const modelo of modelos) {
    const nomeModelo = modelo.name?.trim();
    if (!nomeModelo) continue;

    const jaExiste = await ModeloRepository.checkDuplicidade(idMontadora, nomeModelo);
    if (jaExiste) {
      existentes += 1;
      continue;
    }

    await ModeloRepository.create(idMontadora, nomeModelo);
    criados += 1;
  }

  return { criados, existentes };
}

async function importarFipe() {
  console.log('🔎 Buscando marcas na API FIPE...');
  const marcas = await buscarMarcas();
  console.log(`✅ ${marcas.length} marcas encontradas.\n`);

  let totalModelosCriados = 0;

  for (const marca of marcas) {
    const nomeMontadora = marca.name?.trim();
    if (!nomeMontadora) continue;

    let montadora = await MontadoraRepository.findByNome(nomeMontadora);
    let idMontadora;

    if (!montadora) {
      idMontadora = await MontadoraRepository.create(nomeMontadora);
      console.log(`+ Montadora criada: ${nomeMontadora}`);
    } else {
      idMontadora = montadora.IdMontadora;
      console.log(`= Montadora já existia: ${nomeMontadora}`);
    }

    const { criados, existentes } = await importarModelos(idMontadora, nomeMontadora, marca.code);
    totalModelosCriados += criados;
    console.log(`  → ${criados} modelos novos, ${existentes} já existentes.`);

    await delay(DELAY_ENTRE_REQUISICOES_MS);
  }

  console.log(`\n🎉 Importação concluída! Total de modelos novos criados: ${totalModelosCriados}`);
  process.exit(0);
}

importarFipe().catch((error) => {
  console.error('❌ Erro fatal na importação:', error);
  process.exit(1);
});