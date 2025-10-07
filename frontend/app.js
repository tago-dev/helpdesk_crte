const API_URL = 'http://localhost:3000/api';

// Estado da aplicação
let chamados = [];
let administradores = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarAdministradores();
    carregarChamados();
    configurarEventos();
});

// Configurar eventos
function configurarEventos() {
    document.getElementById('formChamado').addEventListener('submit', criarChamado);
    document.getElementById('formEditar').addEventListener('submit', atualizarChamado);
    document.getElementById('filtroNome').addEventListener('input', filtrarChamados);
    document.getElementById('filtroStatus').addEventListener('change', filtrarChamados);
    
    // Fechar modal ao clicar no X ou fora dele
    const modal = document.getElementById('modalEditar');
    const span = document.getElementsByClassName('close')[0];
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Carregar administradores
async function carregarAdministradores() {
    try {
        const response = await fetch(`${API_URL}/administradores`);
        administradores = await response.json();
        
        const selectResponsavel = document.getElementById('responsavel');
        const selectEditResponsavel = document.getElementById('editResponsavel');
        
        administradores.forEach(admin => {
            const option = new Option(admin.nome, admin.nome);
            selectResponsavel.add(option.cloneNode(true));
            selectEditResponsavel.add(option);
        });
    } catch (error) {
        console.error('Erro ao carregar administradores:', error);
        mostrarNotificacao('Erro ao carregar administradores', 'error');
    }
}

// Carregar chamados
async function carregarChamados() {
    try {
        mostrarLoading();
        const response = await fetch(`${API_URL}/chamados`);
        chamados = await response.json();
        renderizarChamados(chamados);
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        mostrarNotificacao('Erro ao carregar chamados', 'error');
        document.getElementById('listaChamados').innerHTML = '<p class="empty-state">Erro ao carregar chamados</p>';
    }
}

// Renderizar chamados
function renderizarChamados(lista) {
    const container = document.getElementById('listaChamados');
    
    if (lista.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum chamado encontrado</p>';
        return;
    }

    container.innerHTML = lista.map(chamado => `
        <div class="chamado-card">
            <div class="chamado-header">
                <span class="chamado-id">#${chamado.id}</span>
                <span class="status-badge status-${chamado.status}">${formatarStatus(chamado.status)}</span>
            </div>
            <div class="chamado-info">
                <p><strong>Nome:</strong> ${chamado.name}</p>
                <p><strong>Setor:</strong> ${chamado.setor}</p>
                <p><strong>Motivo:</strong> ${chamado.motivo_chamado}</p>
                <p><strong>Responsável:</strong> ${chamado.responsavel || 'Não atribuído'}</p>
            </div>
            <div class="chamado-actions">
                <button class="btn btn-primary" onclick="abrirModalEditar(${chamado.id})">Editar</button>
                <button class="btn btn-danger" onclick="deletarChamado(${chamado.id})">Deletar</button>
            </div>
        </div>
    `).join('');
}

// Criar chamado
async function criarChamado(e) {
    e.preventDefault();
    
    const novoChamado = {
        name: document.getElementById('name').value,
        setor: document.getElementById('setor').value,
        status: 'aberto',
        motivo_chamado: document.getElementById('motivo_chamado').value,
        responsavel: document.getElementById('responsavel').value
    };

    try {
        const response = await fetch(`${API_URL}/chamados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoChamado)
        });

        if (response.ok) {
            mostrarNotificacao('Chamado criado com sucesso!', 'success');
            document.getElementById('formChamado').reset();
            carregarChamados();
        } else {
            throw new Error('Erro ao criar chamado');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao criar chamado', 'error');
    }
}

// Abrir modal de edição
function abrirModalEditar(id) {
    const chamado = chamados.find(c => c.id == id);
    if (!chamado) return;

    document.getElementById('editId').value = chamado.id;
    document.getElementById('editStatus').value = chamado.status;
    document.getElementById('editResponsavel').value = chamado.responsavel || '';
    
    document.getElementById('modalEditar').style.display = 'block';
}

// Fechar modal
function fecharModal() {
    document.getElementById('modalEditar').style.display = 'none';
}

// Atualizar chamado
async function atualizarChamado(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const dadosAtualizados = {
        status: document.getElementById('editStatus').value,
        responsavel: document.getElementById('editResponsavel').value
    };

    try {
        const response = await fetch(`${API_URL}/chamados/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
            mostrarNotificacao('Chamado atualizado com sucesso!', 'success');
            fecharModal();
            carregarChamados();
        } else {
            throw new Error('Erro ao atualizar chamado');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao atualizar chamado', 'error');
    }
}

// Deletar chamado
async function deletarChamado(id) {
    if (!confirm('Tem certeza que deseja deletar este chamado?')) return;

    try {
        const response = await fetch(`${API_URL}/chamados/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarNotificacao('Chamado deletado com sucesso!', 'success');
            carregarChamados();
        } else {
            throw new Error('Erro ao deletar chamado');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao deletar chamado', 'error');
    }
}

// Filtrar chamados
function filtrarChamados() {
    const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
    const filtroStatus = document.getElementById('filtroStatus').value;

    const chamadosFiltrados = chamados.filter(chamado => {
        const matchNome = chamado.name.toLowerCase().includes(filtroNome);
        const matchStatus = !filtroStatus || chamado.status === filtroStatus;
        return matchNome && matchStatus;
    });

    renderizarChamados(chamadosFiltrados);
}

// Utilitários
function formatarStatus(status) {
    const statusMap = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Andamento',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado'
    };
    return statusMap[status] || status;
}

function mostrarLoading() {
    document.getElementById('listaChamados').innerHTML = '<p class="loading">Carregando...</p>';
}

function mostrarNotificacao(mensagem, tipo) {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.innerText = mensagem;
    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}