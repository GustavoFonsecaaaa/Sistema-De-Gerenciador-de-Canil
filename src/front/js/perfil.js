document.addEventListener('DOMContentLoaded', () => {
  // Elements - Profile
  const elNomeCard = document.getElementById('perfil-nome-card');
  const elEmailCard = document.getElementById('perfil-email-card');
  const elNomeDetalhe = document.getElementById('perfil-nome-detalhe');
  const elEmailDetalhe = document.getElementById('perfil-email-detalhe');
  const elTelefoneDetalhe = document.getElementById('perfil-telefone-detalhe');

  const elAvatarImg = document.getElementById('perfil-avatar-img');
  const elAvatarLetra = document.getElementById('perfil-avatar-letra');
  const inputAvatar = document.getElementById('input-avatar');

  const elSidebarNome = document.getElementById('sidebar-nome');
  const elSidebarEmail = document.getElementById('sidebar-email');
  const elSidebarAvatarImg = document.getElementById('sidebar-avatar-img');
  const elSidebarAvatarInicial = document.getElementById('sidebar-avatar-inicial');

  const elCanilNome = document.getElementById('perfil-canil-nome');
  const elCanilEndereco = document.getElementById('perfil-canil-endereco');
  const elCanilCidade = document.getElementById('perfil-canil-cidade');
  const elCanilEstado = document.getElementById('perfil-canil-estado');

  // Toast
  const toast = document.getElementById('toast-sucesso');

  // Action Buttons
  const btnEditar = document.getElementById('btn-editar-perfil');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-edicao');

  // Form inputs
  const inputEditNome = document.getElementById('input-perfil-nome');
  const inputEditTelefone = document.getElementById('input-perfil-telefone');
  const inputEditCanilNome = document.getElementById('input-canil-nome');
  const inputEditCanilEndereco = document.getElementById('input-canil-endereco');
  const inputEditCanilCidade = document.getElementById('input-canil-cidade');
  const inputEditCanilEstado = document.getElementById('input-canil-estado');

  let emModoEdicao = false;

  // 1. Função para carregar dados do localStorage e renderizar
  function carregarPerfil() {
    const nomeSalvo = localStorage.getItem('canil_usuario_nome') || 'Carlos Oliveira';
    const emailSalvo = localStorage.getItem('canil_usuario_cadastrado_email') || 'admin@canil.com';
    const telefoneSalvo = localStorage.getItem('canil_usuario_telefone') || '(31) 98765-4321';
    const canilNomeSalvo = localStorage.getItem('canil_nome') || 'Canil Villa Dog';
    const canilEnderecoSalvo = localStorage.getItem('canil_endereco') || 'Rua dos Pinheiros, 450';
    const canilCidadeSalvo = localStorage.getItem('canil_cidade') || 'Igarapé';
    const canilEstadoSalvo = localStorage.getItem('canil_estado') || 'MG';
    const fotoSalva = localStorage.getItem('canil_usuario_foto');

    const inicial = nomeSalvo.charAt(0).toUpperCase();

    // Preencher Dados Pessoais
    if (elNomeCard) elNomeCard.textContent = nomeSalvo;
    if (elEmailCard) elEmailCard.textContent = emailSalvo;
    if (elNomeDetalhe) elNomeDetalhe.textContent = nomeSalvo;
    if (elEmailDetalhe) elEmailDetalhe.textContent = emailSalvo;
    if (elTelefoneDetalhe) elTelefoneDetalhe.textContent = telefoneSalvo;

    // Atualizar foto do perfil principal
    if (fotoSalva) {
      if (elAvatarImg) {
        elAvatarImg.src = fotoSalva;
        elAvatarImg.classList.remove('hidden');
      }
      if (elAvatarLetra) {
        elAvatarLetra.classList.add('hidden');
      }
    } else {
      if (elAvatarImg) {
        elAvatarImg.classList.add('hidden');
      }
      if (elAvatarLetra) {
        elAvatarLetra.textContent = inicial;
        elAvatarLetra.classList.remove('hidden');
      }
    }

    // Preencher Menu Lateral
    if (elSidebarNome) elSidebarNome.textContent = nomeSalvo;
    if (elSidebarEmail) elSidebarEmail.textContent = emailSalvo;

    // Atualizar foto do menu lateral (sidebar)
    if (fotoSalva) {
      if (elSidebarAvatarImg) {
        elSidebarAvatarImg.src = fotoSalva;
        elSidebarAvatarImg.classList.remove('hidden');
      }
      if (elSidebarAvatarInicial) {
        elSidebarAvatarInicial.classList.add('hidden');
      }
    } else {
      if (elSidebarAvatarImg) {
        elSidebarAvatarImg.classList.add('hidden');
      }
      if (elSidebarAvatarInicial) {
        elSidebarAvatarInicial.textContent = inicial;
        elSidebarAvatarInicial.classList.remove('hidden');
      }
    }

    // Preencher Canil
    if (elCanilNome) elCanilNome.textContent = canilNomeSalvo;
    if (elCanilEndereco) elCanilEndereco.textContent = canilEnderecoSalvo;
    if (elCanilCidade) elCanilCidade.textContent = canilCidadeSalvo;
    if (elCanilEstado) elCanilEstado.textContent = canilEstadoSalvo;
  }

  // Inicializa a tela com os dados
  carregarPerfil();

  // Evento de alteração de foto de perfil
  if (inputAvatar) {
    inputAvatar.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tamanho (max 1.5MB)
        if (file.size > 1.5 * 1024 * 1024) {
          alert("Por favor, selecione uma imagem menor que 1.5MB.");
          return;
        }
        const reader = new FileReader();
        reader.onload = function(evt) {
          const base64Image = evt.target.result;
          localStorage.setItem('canil_usuario_foto', base64Image);
          carregarPerfil();
          mostrarToast("Foto de perfil atualizada com sucesso!");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Toast feedback
  function mostrarToast(msg = "Operação realizada com sucesso!") {
    if (!toast) return;
    const span = toast.querySelector('span');
    if (span) span.textContent = msg;

    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  // Alternar modo de edição
  function alternarModoEdicao(ativo) {
    emModoEdicao = ativo;

    if (emModoEdicao) {
      if (btnEditar) btnEditar.classList.add('hidden');
      if (btnCancelar) btnCancelar.classList.remove('hidden');
      if (btnSalvar) btnSalvar.classList.remove('hidden');

      document.querySelectorAll('.perfil-visualizacao').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.perfil-edicao').forEach(el => el.classList.remove('hidden'));

      if (inputEditNome) inputEditNome.value = localStorage.getItem('canil_usuario_nome') || 'Carlos Oliveira';
      if (inputEditTelefone) inputEditTelefone.value = localStorage.getItem('canil_usuario_telefone') || '(31) 98765-4321';
      if (inputEditCanilNome) inputEditCanilNome.value = localStorage.getItem('canil_nome') || 'Canil Villa Dog';
      if (inputEditCanilEndereco) inputEditCanilEndereco.value = localStorage.getItem('canil_endereco') || 'Rua dos Pinheiros, 450';
      if (inputEditCanilCidade) inputEditCanilCidade.value = localStorage.getItem('canil_cidade') || 'Igarapé';
      if (inputEditCanilEstado) inputEditCanilEstado.value = localStorage.getItem('canil_estado') || 'MG';
    } else {
      if (btnEditar) btnEditar.classList.remove('hidden');
      if (btnCancelar) btnCancelar.classList.add('hidden');
      if (btnSalvar) btnSalvar.classList.add('hidden');

      document.querySelectorAll('.perfil-visualizacao').forEach(el => el.classList.remove('hidden'));
      document.querySelectorAll('.perfil-edicao').forEach(el => el.classList.add('hidden'));
    }
  }

  if (btnEditar) {
    btnEditar.onclick = () => alternarModoEdicao(true);
  }
  if (btnCancelar) {
    btnCancelar.onclick = () => alternarModoEdicao(false);
  }

  // Salvar alterações inline
  if (btnSalvar) {
    btnSalvar.onclick = () => {
      const nomeVal = inputEditNome ? inputEditNome.value.trim() : '';
      const telefoneVal = inputEditTelefone ? inputEditTelefone.value.trim() : '';
      const canilNomeVal = inputEditCanilNome ? inputEditCanilNome.value.trim() : '';
      const canilEnderecoVal = inputEditCanilEndereco ? inputEditCanilEndereco.value.trim() : '';
      const canilCidadeVal = inputEditCanilCidade ? inputEditCanilCidade.value.trim() : '';
      const canilEstadoVal = inputEditCanilEstado ? inputEditCanilEstado.value.trim().toUpperCase() : '';

      if (!nomeVal || !telefoneVal || !canilNomeVal || !canilEnderecoVal || !canilCidadeVal || !canilEstadoVal) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      localStorage.setItem('canil_usuario_nome', nomeVal);
      localStorage.setItem('canil_usuario_telefone', telefoneVal);
      localStorage.setItem('canil_nome', canilNomeVal);
      localStorage.setItem('canil_endereco', canilEnderecoVal);
      localStorage.setItem('canil_cidade', canilCidadeVal);
      localStorage.setItem('canil_estado', canilEstadoVal);

      carregarPerfil();
      alternarModoEdicao(false);
      mostrarToast("Perfil atualizado com sucesso!");
    };
  }

  // Lógica do botão "Sair da conta"
  const btnSair = document.getElementById('btn-sair-conta');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao('Saindo da conta... Até logo!', 'sucesso');
      } else {
        mostrarToast('Saindo da conta... Até logo!');
      }

      setTimeout(() => {
        localStorage.removeItem('canil_logado');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      }, 1500);
    });
  }

  // Lógica das Abas (Dados Pessoais vs Canil)
  const abaDados = document.getElementById('aba-dados');
  const abaCanil = document.getElementById('aba-canil');
  const conteudoDados = document.getElementById('conteudo-dados');
  const conteudoCanil = document.getElementById('conteudo-canil');

  const classesAbaAtiva = ['text-laranja', 'border-laranja', 'font-bold'];
  const classesAbaInativa = ['text-[#6B7280]', 'font-medium', 'border-transparent'];

  if (abaDados && abaCanil && conteudoDados && conteudoCanil) {
    abaDados.addEventListener('click', () => {
      conteudoDados.classList.remove('hidden');
      conteudoCanil.classList.add('hidden');
      
      abaDados.classList.remove(...classesAbaInativa);
      abaDados.classList.add(...classesAbaAtiva);
      
      abaCanil.classList.remove(...classesAbaAtiva);
      abaCanil.classList.add(...classesAbaInativa);
    });

    abaCanil.addEventListener('click', () => {
      conteudoCanil.classList.remove('hidden');
      conteudoDados.classList.add('hidden');
      
      abaCanil.classList.remove(...classesAbaInativa);
      abaCanil.classList.add(...classesAbaAtiva);
      
      abaDados.classList.remove(...classesAbaAtiva);
      abaDados.classList.add(...classesAbaInativa);
    });
  }

  // ==================================================================
  // LÓGICA DE EXCLUSÃO DEFINITIVA DE CONTA (LGPD)
  // ==================================================================
  const btnExcluirConta = document.getElementById('btn-excluir-conta');
  const modalExcluirConta = document.getElementById('modal-excluir-conta');
  const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
  const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');

  // Abrir o modal ao clicar no botão "Excluir conta"
  if (btnExcluirConta && modalExcluirConta) {
    btnExcluirConta.addEventListener('click', () => {
      modalExcluirConta.classList.remove('hidden');
    });
  }

  // Fechar o modal ao clicar em "Cancelar"
  if (btnCancelarExclusao && modalExcluirConta) {
    btnCancelarExclusao.addEventListener('click', () => {
      modalExcluirConta.classList.add('hidden');
    });
  }

  // Fechar modal ao clicar no overlay escuro
  if (modalExcluirConta) {
    modalExcluirConta.addEventListener('click', (e) => {
      if (e.target === modalExcluirConta) {
        modalExcluirConta.classList.add('hidden');
      }
    });
  }

  // Ao clicar em "Sim, excluir tudo", fazer requisição DELETE para a API
  if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener('click', async () => {
      const token = localStorage.getItem('token');

      try {
        btnConfirmarExclusao.disabled = true;
        btnConfirmarExclusao.textContent = 'Excluindo...';

        const resposta = await fetch('/api/usuarios/me', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (token || '')
          }
        });

        if (resposta.ok) {
          if (typeof window.mostrarNotificacao === 'function') {
            window.mostrarNotificacao('Conta e dados excluídos com sucesso!', 'sucesso');
          }
          setTimeout(() => {
            localStorage.clear();
            window.location.href = 'index.html';
          }, 1200);
        } else {
          let msgErro = 'Erro ao excluir conta. Tente novamente.';
          try {
            const erroData = await resposta.json();
            if (erroData.mensagem || erroData.message || erroData.error) {
              msgErro = erroData.mensagem || erroData.message || erroData.error;
            }
          } catch (e) {}

          if (typeof window.mostrarNotificacao === 'function') {
            window.mostrarNotificacao(msgErro, 'erro');
          } else {
            mostrarToast(msgErro);
          }

          btnConfirmarExclusao.disabled = false;
          btnConfirmarExclusao.innerHTML = '<i class="ri-delete-bin-line"></i> Sim, excluir tudo';
        }
      } catch (erro) {
        console.error('Erro ao excluir conta:', erro);
        const msgConexao = 'Erro ao excluir conta. Tente novamente.';
        if (typeof window.mostrarNotificacao === 'function') {
          window.mostrarNotificacao(msgConexao, 'erro');
        } else {
          mostrarToast(msgConexao);
        }
        btnConfirmarExclusao.disabled = false;
        btnConfirmarExclusao.innerHTML = '<i class="ri-delete-bin-line"></i> Sim, excluir tudo';
      }
    });
  }
});
