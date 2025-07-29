# platafroma-adv-gpt

Este repositório contém um exemplo de painel jurídico que utiliza o Firebase
para armazenamento. Os dados ficam em coleções do Firestore e os documentos
são enviados para o Firebase Storage. A autenticação dos usuários é realizada
via e‑mail e senha utilizando o Firebase Authentication.

## Configuração
1. Crie um projeto no Firebase habilitando a autenticação por e‑mail e senha.
2. No console do Firebase, ative o Firestore e o Storage.
3. Copie as chaves do projeto e preencha o objeto `firebaseConfig` em `index.html`.
4. Crie no Firestore as coleções `clientes`, `casos`, `docs`, `agenda`, `tarefas` e `fin`.

## Estrutura das coleções
Cada coleção do Firestore deve possuir os seguintes campos (todos em letras minúsculas):
- **clientes**: `id`, `nome`, `email`, `fone`, `notas`
- **casos**: `id`, `cliente_id`, `numero`, `partes`, `responsavel`, `data`, `status`
- **docs**: `id`, `cliente_id`, `caso_id`, `titulo`, `file_id`, `file_nome`, `file_url`
- **agenda**: `id`, `titulo`, `tipo_evento`, `datahora`, `local`, `cliente_id`, `caso_id`, `status`, `descricao`
- **tarefas**: `id`, `descricao`, `prioridade`, `prazo`, `cliente_id`, `caso_id`, `status`
- **fin**: `id`, `descricao`, `categoria`, `valor`, `data`, `status_pg`, `cliente_id`, `caso_id`, `tipo`

Para datas e prazos, os valores são armazenados no formato ISO (yyyy-MM-dd'T'HH:mm:ss'Z'), garantindo que o painel interprete corretamente as informações de data.

## Hospedagem

O arquivo `index.html` pode ser hospedado em qualquer serviço de páginas estáticas, como o GitHub Pages, já que toda a comunicação é feita diretamente com o Firebase.
