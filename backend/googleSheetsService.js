import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    this.auth = null;
    this.sheets = null;
  }

  async authenticate() {
    try {
      // Autenticação usando Service Account (método recomendado)
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_CREDENTIALS_PATH, // Caminho para o arquivo JSON de credenciais
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.auth = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('✅ Autenticado com sucesso no Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Erro na autenticação:', error.message);
      throw error;
    }
  }

  // Buscar todos os chamados
  async getChamados() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'chamados_usuarios!A2:F', // A partir da linha 2 (pula o cabeçalho)
      });

      const rows = response.data.values || [];
      
      return rows.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        setor: row[2] || '',
        status: row[3] || '',
        motivo_chamado: row[4] || '',
        responsavel: row[5] || '',
      }));
    } catch (error) {
      console.error('Erro ao buscar chamados:', error.message);
      throw error;
    }
  }

  // Buscar um chamado específico por ID
  async getChamadoById(id) {
    try {
      const chamados = await this.getChamados();
      return chamados.find(chamado => chamado.id === id.toString());
    } catch (error) {
      console.error('Erro ao buscar chamado:', error.message);
      throw error;
    }
  }

  // Criar novo chamado
  async createChamado(chamadoData) {
    try {
      // Gerar novo ID (pega o último ID e incrementa)
      const chamados = await this.getChamados();
      const ultimoId = chamados.length > 0 
        ? Math.max(...chamados.map(c => parseInt(c.id) || 0)) 
        : 0;
      const novoId = ultimoId + 1;

      const novoChamado = [
        novoId.toString(),
        chamadoData.name || '',
        chamadoData.setor || '',
        chamadoData.status || 'Aberto',
        chamadoData.motivo_chamado || '',
        chamadoData.responsavel || '',
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'chamados_usuarios!A:F',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [novoChamado],
        },
      });

      return {
        id: novoId.toString(),
        name: chamadoData.name,
        setor: chamadoData.setor,
        status: chamadoData.status || 'Aberto',
        motivo_chamado: chamadoData.motivo_chamado,
        responsavel: chamadoData.responsavel,
      };
    } catch (error) {
      console.error('Erro ao criar chamado:', error.message);
      throw error;
    }
  }

  // Atualizar chamado existente
  async updateChamado(id, chamadoData) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'chamados_usuarios!A2:F',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id.toString());

      if (rowIndex === -1) {
        throw new Error('Chamado não encontrado');
      }

      const rowNumber = rowIndex + 2; // +2 porque começa na linha 2 (header na linha 1)
      const chamadoAtualizado = [
        id.toString(),
        chamadoData.name !== undefined ? chamadoData.name : rows[rowIndex][1],
        chamadoData.setor !== undefined ? chamadoData.setor : rows[rowIndex][2],
        chamadoData.status !== undefined ? chamadoData.status : rows[rowIndex][3],
        chamadoData.motivo_chamado !== undefined ? chamadoData.motivo_chamado : rows[rowIndex][4],
        chamadoData.responsavel !== undefined ? chamadoData.responsavel : rows[rowIndex][5],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `chamados_usuarios!A${rowNumber}:F${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [chamadoAtualizado],
        },
      });

      return {
        id: chamadoAtualizado[0],
        name: chamadoAtualizado[1],
        setor: chamadoAtualizado[2],
        status: chamadoAtualizado[3],
        motivo_chamado: chamadoAtualizado[4],
        responsavel: chamadoAtualizado[5],
      };
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error.message);
      throw error;
    }
  }

  // Deletar chamado
  async deleteChamado(id) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'chamados_usuarios!A2:F',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id.toString());

      if (rowIndex === -1) {
        throw new Error('Chamado não encontrado');
      }

      const rowNumber = rowIndex + 1; // +1 porque a API usa índice 0-based após o header

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // ID da aba (normalmente 0 para primeira aba)
                  dimension: 'ROWS',
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return { message: 'Chamado deletado com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar chamado:', error.message);
      throw error;
    }
  }

  // Buscar administradores (da aba "administradores")
  async getAdministradores() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'administradores!A2:B', // Ajuste conforme sua estrutura
      });

      const rows = response.data.values || [];
      return rows.map(row => ({
        nome: row[0] || '',
        email: row[1] || '',
      }));
    } catch (error) {
      console.error('Erro ao buscar administradores:', error.message);
      throw error;
    }
  }
}

export default GoogleSheetsService;
