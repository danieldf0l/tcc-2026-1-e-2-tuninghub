import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { mensagemErro } from '../utils/erroApi';

/*
  Desativar/reativar na hora, com "Desfazer" no toast (soft delete é reversível).

  const alternarStatus = useAlternarStatus(lista.recarregar);
  alternarStatus({
    ativo: !!servico.Ativo,
    rotulo: `Serviço "${servico.Nome}"`,
    feminino: false,                         // "desativado" / "desativada"
    desativar: () => desativarServico(servico.IdServico),
    reativar: () => reativarServico(servico.IdServico),
  });
*/
export const useAlternarStatus = (recarregar) => {
  const toast = useToast();

  return useCallback(
    (opcoes) => {
      const executar = async ({ ativo, rotulo, feminino, desativar, reativar }, desfazendo) => {
        try {
          if (ativo) await desativar();
          else await reativar();
          await recarregar();

          if (desfazendo) {
            toast.info('Alteração desfeita.');
            return;
          }

          const fim = feminino ? 'a' : 'o';
          toast.sucesso(`${rotulo} ${ativo ? 'desativad' : 'reativad'}${fim}.`, {
            acao: {
              rotulo: 'Desfazer',
              onClick: () => executar({ ativo: !ativo, rotulo, feminino, desativar, reativar }, true),
            },
          });
        } catch (error) {
          toast.erro(mensagemErro(error, 'Não foi possível alterar o status.'));
        }
      };

      executar(opcoes, false);
    },
    [recarregar, toast]
  );
};