import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import GoogleSheetsService from './googleSheetsService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Instanciar o serviço do Google Sheets
const sheetsService = new GoogleSheetsService();

// Middleware para autenticar antes de qualquer requisição
app.use(async (req, res, next) => {
  if (!sheetsService.sheets) {
    try {
      await sheetsService.authenticate();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Erro ao conectar com Google Sheets',
        message: error.message 
      });
    }
  }
  next();
});

// ========== ROTAS ==========

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API Helpdesk CRTE - Bem-vindo!',
    version: '1.0.0',
    endpoints: {
      chamados: {
        'GET /api/chamados': 'Listar todos os chamados',
        'GET /api/chamados/:id': 'Buscar chamado por ID',
        'POST /api/chamados': 'Criar novo chamado',
        'PUT /api/chamados/:id': 'Atualizar chamado',
        'DELETE /api/chamados/:id': 'Deletar chamado',
      },
      administradores: {
        'GET /api/administradores': 'Listar administradores',
      }
    }
  });
});

// ========== ROTAS DE CHAMADOS ==========

// GET - Listar todos os chamados
app.get('/api/chamados', async (req, res) => {
  try {
    const chamados = await sheetsService.getChamados();
    res.json({
      success: true,
      count: chamados.length,
      data: chamados
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar chamados',
      message: error.message
    });
  }
});

// GET - Buscar chamado por ID
app.get('/api/chamados/:id', async (req, res) => {
  try {
    const chamado = await sheetsService.getChamadoById(req.params.id);
    
    if (!chamado) {
      return res.status(404).json({
        success: false,
        error: 'Chamado não encontrado'
      });
    }

    res.json({
      success: true,
      data: chamado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar chamado',
      message: error.message
    });
  }
});

// POST - Criar novo chamado
app.post('/api/chamados', async (req, res) => {
  try {
    const { name, setor, status, motivo_chamado, responsavel } = req.body;

    // Validação básica
    if (!name || !setor || !motivo_chamado) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, setor, motivo_chamado'
      });
    }

    const novoChamado = await sheetsService.createChamado({
      name,
      setor,
      status: status || 'Aberto',
      motivo_chamado,
      responsavel: responsavel || ''
    });

    res.status(201).json({
      success: true,
      message: 'Chamado criado com sucesso',
      data: novoChamado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao criar chamado',
      message: error.message
    });
  }
});

// PUT - Atualizar chamado
app.put('/api/chamados/:id', async (req, res) => {
  try {
    const { name, setor, status, motivo_chamado, responsavel } = req.body;

    const chamadoAtualizado = await sheetsService.updateChamado(req.params.id, {
      name,
      setor,
      status,
      motivo_chamado,
      responsavel
    });

    res.json({
      success: true,
      message: 'Chamado atualizado com sucesso',
      data: chamadoAtualizado
    });
  } catch (error) {
    if (error.message === 'Chamado não encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar chamado',
      message: error.message
    });
  }
});

// DELETE - Deletar chamado
app.delete('/api/chamados/:id', async (req, res) => {
  try {
    const result = await sheetsService.deleteChamado(req.params.id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === 'Chamado não encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao deletar chamado',
      message: error.message
    });
  }
});

// ========== ROTAS DE ADMINISTRADORES ==========

// GET - Listar administradores
app.get('/api/administradores', async (req, res) => {
  try {
    const administradores = await sheetsService.getAdministradores();
    res.json({
      success: true,
      count: administradores.length,
      data: administradores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar administradores',
      message: error.message
    });
  }
});

// ========== TRATAMENTO DE ERROS ==========

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Erro geral
app.use((error, req, res, next) => {
  console.error('Erro:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}`);
  console.log(`📊 Endpoints: http://localhost:${PORT}/api/chamados`);
});
