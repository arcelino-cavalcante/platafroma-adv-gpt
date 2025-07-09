# platafroma-adv-gpt

Este repositório contém um exemplo de painel jurídico agora adaptado para
Google Apps Script. Os dados são armazenados em uma planilha do Google Sheets
e os documentos ficam em uma pasta no Google Drive.

## Configuração
1. Crie uma planilha no Google Sheets contendo as abas `clientes`, `casos`,
   `docs`, `agenda`, `tarefas` e `fin`.
   - Adicione também a aba `user` com as colunas `email` e `senha` para definir
     quem pode acessar o sistema.
   - Na aba `clientes`, utilize as colunas `id`, `nome`, `email`, `fone` e
     `notas` exatamente nesses nomes (em letras minúsculas). O script considera
     os cabeçalhos em minúsculas para salvar e ler os dados.
2. Crie uma pasta no Google Drive para os arquivos enviados.
3. Edite `Code.gs` e preencha as constantes `SPREADSHEET_ID` e
   `DOCS_FOLDER_ID` com os IDs correspondentes.
4. Publique o projeto como aplicativo da Web ou use a extensão do Apps Script
   para serviço de backend.

Ao carregar os dados dos documentos, o script verifica a pasta indicada em
`DOCS_FOLDER_ID` e adiciona automaticamente à aba `docs` qualquer arquivo que
ainda não esteja registrado. Isso garante que todos os documentos salvos na
pasta apareçam no painel.

## Estrutura das abas
O sistema espera que cada aba da planilha possua as seguintes colunas (todas em
letras minúsculas):

- **user**: `email`, `senha`
- **clientes**: `id`, `nome`, `email`, `fone`, `notas`
- **casos**: `id`, `cliente_id`, `numero`, `partes`, `responsavel`, `data`, `status`
- **docs**: `id`, `cliente_id`, `caso_id`, `titulo`, `file_id`, `file_nome`, `file_url`
- **agenda**: `id`, `titulo`, `tipo_evento`, `datahora`, `local`, `cliente_id`, `caso_id`, `status`, `descricao`
- **tarefas**: `id`, `descricao`, `prioridade`, `prazo`, `cliente_id`, `caso_id`, `status`
- **fin**: `id`, `descricao`, `categoria`, `valor`, `data`, `status_pg`, `cliente_id`, `caso_id`, `tipo`
