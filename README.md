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
3. No editor do Apps Script, abra **Arquivo > Propriedades do projeto** e, na
   aba **Propriedades do Script**, adicione `SPREADSHEET_ID` e
   `DOCS_FOLDER_ID` com os respectivos IDs.
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

Para datas e prazos, o script converte automaticamente valores do tipo Date em um formato ISO (yyyy-MM-dd'T'HH:mm:ss'Z'). Isso garante que o painel consiga interpretar corretamente as datas retornadas pela planilha.

## Hospedando o front-end no GitHub Pages

Caso deseje servir o arquivo `index.html` a partir do GitHub Pages em vez de utilizar o serviço de front-end do Apps Script, siga os passos abaixo. Assim é possível manter a planilha e a pasta do Google Drive como "banco de dados" e acessar o backend via requisições HTTP.

1. **Exponha o Apps Script como uma API.**
   - No arquivo `Code.gs`, adicione uma função `doPost(e)` responsável por receber uma chamada HTTP e redirecionar para as demais funções (`getRows`, `addRow`, `updateRow` etc.). Um exemplo de implementação está abaixo:

   ```javascript
   function doPost(e) {
     const data = JSON.parse(e.postData.contents || '{}');
     const { action, args } = data;
     let result;
     switch (action) {
       case 'getRows':
         result = getRows(args.sheet);
         break;
       case 'addRow':
         result = addRow(args.sheet, args.row);
         break;
       case 'updateRow':
         result = updateRow(args.sheet, args.id, args.row);
         break;
       case 'deleteRow':
         result = deleteRow(args.sheet, args.id);
         break;
       case 'uploadDocument':
         result = uploadDocument(args.name, args.base64);
         break;
       case 'login':
         result = login(args.email, args.senha);
         break;
       case 'exportSheetCsv':
         result = exportSheetCsv(args.sheet);
         break;
       default:
         result = { error: 'Ação inválida' };
     }
       return ContentService
         .createTextOutput(JSON.stringify(result))
         .setMimeType(ContentService.MimeType.JSON)
         .setHeader('Access-Control-Allow-Origin', '*')
         .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   }
   ```

   Essa função permite que chamadas `POST` sejam feitas de qualquer origem (graças ao cabeçalho `Access-Control-Allow-Origin`), retornando sempre um JSON.

2. **Publique o Apps Script como Web App.**
   - Escolha a opção "Qualquer um, mesmo anônimo" para acesso. Copie a URL gerada após a publicação; ela será usada pelo front-end.

3. **Adapte `index.html`** para realizar requisições via `fetch` para a URL do Web App. Um helper simples pode ser utilizado:

   ```javascript
   const API_URL = 'https://script.google.com/macros/s/SEU_ID/exec';

   function api(action, args) {
     return fetch(API_URL, {
       method: 'POST',
       body: JSON.stringify({ action, args }),
       headers: { 'Content-Type': 'text/plain' }
     }).then(r => r.json());
   }
   ```

   Em seguida, substitua as chamadas `google.script.run` por `api('acao', {...})`.

4. **Hospede o arquivo `index.html`** no GitHub Pages (por exemplo, através da branch `gh-pages`).

Dessa forma, a interface continua consumindo os dados da planilha e da pasta do Drive por meio das funções do Apps Script, mas o HTML fica hospedado externamente.
