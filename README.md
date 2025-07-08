# platafroma-adv-gpt

Este repositório contém um exemplo de painel jurídico agora adaptado para
Google Apps Script. Os dados são armazenados em uma planilha do Google Sheets
e os documentos ficam em uma pasta no Google Drive.

## Configuração
1. Crie uma planilha no Google Sheets contendo as abas `clientes`, `casos`,
   `docs`, `agenda`, `tarefas` e `fin`.
   - Adicione também a aba `user` com as colunas `email` e `senha` para definir
     quem pode acessar o sistema.
2. Crie uma pasta no Google Drive para os arquivos enviados.
3. Edite `Code.gs` e preencha as constantes `SPREADSHEET_ID` e
   `DOCS_FOLDER_ID` com os IDs correspondentes.
4. Publique o projeto como aplicativo da Web ou use a extensão do Apps Script
   para serviço de backend.
