# Helpdesk CRTE - API

API REST para gerenciamento de chamados de helpdesk usando Google Sheets como banco de dados.

## 📋 Funcionalidades

- ✅ Criar, listar, atualizar e deletar chamados
- ✅ Integração com Google Sheets
- ✅ Listagem de administradores
- ✅ API RESTful completa
- ✅ CORS habilitado para integração com frontend

## 🚀 Tecnologias

- Node.js
- Express.js
- Google Sheets API
- CORS
- dotenv

## 📦 Estrutura da Planilha

A planilha deve ter as seguintes abas:

### Aba: `chamados_usuarios`

Colunas:

- **A**: id
- **B**: name
- **C**: setor
- **D**: status
- **E**: motivo_chamado
- **F**: responsavel

### Aba: `administradores`

Colunas:

- **A**: nome
- **B**: email

## ⚙️ Configuração

### 1. Configurar Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**:

   - Vá em "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Sheets API"
   - Clique em "Ativar"

4. Crie uma Service Account:

   - Vá em "APIs e Serviços" > "Credenciais"
   - Clique em "Criar credenciais" > "Conta de serviço"
   - Preencha os dados e clique em "Criar"
   - Não precisa adicionar permissões (pode pular)
   - Clique em "Concluir"

5. Crie uma chave JSON:

   - Clique na service account criada
   - Vá na aba "Chaves"
   - Clique em "Adicionar chave" > "Criar nova chave"
   - Selecione "JSON" e clique em "Criar"
   - O arquivo será baixado automaticamente

6. Renomeie o arquivo baixado para `credentials.json` e coloque na pasta `backend/`

### 2. Compartilhar a Planilha

1. Abra o arquivo `credentials.json`
2. Copie o valor do campo `client_email` (algo como: `nome@projeto.iam.gserviceaccount.com`)
3. Abra sua planilha do Google Sheets
4. Clique em "Compartilhar"
5. Cole o email da service account
6. Dê permissão de **Editor**
7. Desmarque "Notificar pessoas"
8. Clique em "Compartilhar"

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:

```bash
cd backend
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione:
   - `SPREADSHEET_ID`: O ID da sua planilha (encontrado na URL)
     - URL exemplo: `https://docs.google.com/spreadsheets/d/ABC123xyz/edit`
     - O ID é: `ABC123xyz`
   - `GOOGLE_CREDENTIALS_PATH`: Caminho para o arquivo JSON (padrão: `./credentials.json`)
   - `PORT`: Porta do servidor (padrão: 3000)

### 4. Instalar Dependências

```bash
cd backend
npm install
```

## 🎯 Como Executar

### Modo Desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Modo Produção

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

### Informações da API

- **GET** `/` - Informações gerais e lista de endpoints

### Chamados

- **GET** `/api/chamados` - Lista todos os chamados

  ```json
  // Resposta
  {
    "success": true,
    "count": 10,
    "data": [...]
  }
  ```

- **GET** `/api/chamados/:id` - Busca um chamado específico

  ```json
  // Resposta
  {
    "success": true,
    "data": {
      "id": "1",
      "name": "João Silva",
      "setor": "TI",
      "status": "Aberto",
      "motivo_chamado": "Problema no computador",
      "responsavel": "Maria"
    }
  }
  ```

- **POST** `/api/chamados` - Cria um novo chamado

  ```json
  // Corpo da requisição
  {
    "name": "João Silva",
    "setor": "TI",
    "motivo_chamado": "Problema no computador",
    "status": "Aberto", // opcional (padrão: "Aberto")
    "responsavel": "" // opcional
  }
  ```

- **PUT** `/api/chamados/:id` - Atualiza um chamado

  ```json
  // Corpo da requisição (todos os campos são opcionais)
  {
    "status": "Em andamento",
    "responsavel": "Maria Santos"
  }
  ```

- **DELETE** `/api/chamados/:id` - Deleta um chamado

### Administradores

- **GET** `/api/administradores` - Lista todos os administradores
  ```json
  // Resposta
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "nome": "Admin 1",
        "email": "admin1@email.com"
      }
    ]
  }
  ```

## 🧪 Testando a API

### Usando cURL

```bash
# Listar todos os chamados
curl http://localhost:3000/api/chamados

# Criar novo chamado
curl -X POST http://localhost:3000/api/chamados \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "setor": "TI",
    "motivo_chamado": "Teste de API"
  }'

# Atualizar chamado
curl -X PUT http://localhost:3000/api/chamados/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Concluído"
  }'

# Deletar chamado
curl -X DELETE http://localhost:3000/api/chamados/1
```

### Usando Postman ou Insomnia

Importe os endpoints acima ou teste manualmente acessando a rota raiz (`/`) para ver a documentação completa.

## 📁 Estrutura do Projeto

```
backend/
├── index.js                 # Servidor Express e rotas
├── googleSheetsService.js   # Serviço de integração com Google Sheets
├── package.json             # Dependências do projeto
├── .env                     # Variáveis de ambiente (não versionar)
├── .env.example             # Exemplo de variáveis de ambiente
├── credentials.json         # Credenciais do Google (não versionar)
└── .gitignore              # Arquivos ignorados pelo Git
```

## 🔒 Segurança

⚠️ **IMPORTANTE**:

- Nunca commite o arquivo `credentials.json` no Git
- Nunca commite o arquivo `.env` no Git
- Estes arquivos já estão no `.gitignore`
- Compartilhe a planilha apenas com o email da service account

## 🐛 Troubleshooting

### Erro de autenticação

- Verifique se o arquivo `credentials.json` está na pasta correta
- Confirme se a planilha foi compartilhada com o email da service account
- Verifique se a Google Sheets API está ativada no projeto

### Erro ao buscar dados

- Confirme o ID da planilha no arquivo `.env`
- Verifique se os nomes das abas estão corretos: `chamados_usuarios` e `administradores`
- Confirme se a primeira linha contém os cabeçalhos

### Porta já em uso

- Altere a porta no arquivo `.env`
- Ou finalize o processo que está usando a porta 3000

## 📝 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

## 👨‍💻 Autor

Desenvolvido para o CRTE
