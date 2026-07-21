document.addEventListener('DOMContentLoaded', () => {
  console.log("Script cachorros.js carregado!");

  // Elementos do Modal
  const btnNovoCachorro = document.getElementById('btn-novo-cachorro');
  const modalAdicionar = document.getElementById('modal-adicionar-cachorro');
  const modalContent = modalAdicionar ? modalAdicionar.querySelector('.transform') : null;
  const btnFecharModal = document.getElementById('btn-fechar-modal-cadastrar');
  const btnCancelarModal = document.getElementById('btn-cancelar-cadastrar');
  const formAdicionar = document.getElementById('form-adicionar-cachorro');

  // Toast
  const toastSucesso = document.getElementById('toast-sucesso-cao');
  let toastTimeout = null;

  function mostrarToast(msg = "Cão cadastrado com sucesso!") {
    if (!toastSucesso) return;
    const span = toastSucesso.querySelector('span');
    if (span) span.textContent = msg;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastSucesso.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toastSucesso.classList.add('opacity-100', 'translate-y-0');

    toastTimeout = setTimeout(() => {
      toastSucesso.classList.remove('opacity-100', 'translate-y-0');
      toastSucesso.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  function calcularIdadeEFase(dataNascimento) {
    const hoje = new Date();
    const nascAno = dataNascimento.getFullYear();
    const nascMes = dataNascimento.getMonth();
    
    let anos = hoje.getFullYear() - nascAno;
    let meses = hoje.getMonth() - nascMes;

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    const ehFilhote = anos < 1;
    const textoFase = ehFilhote ? 'Filhote' : 'Adulto';
    
    let textoIdade = '';
    if (anos > 0) textoIdade += `${anos}a `;
    textoIdade += `${meses}m`;

    return { textoIdade, textoFase, ehFilhote };
  }

  function atualizarContadorHeader() {
    const total = document.querySelectorAll('main div.grid > div, .container-caes > div').length;
    const headerSub = document.querySelector('h1 + p');
    if (headerSub) {
      headerSub.textContent = `${total} cães cadastrados no canil`;
    }
  }

  function abrirModal() {
    if (formAdicionar) formAdicionar.reset();
    if (modalAdicionar && modalContent) {
      modalAdicionar.classList.remove('hidden');
      setTimeout(() => {
        modalAdicionar.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModal() {
    if (modalAdicionar && modalContent) {
      modalAdicionar.classList.add('opacity-0');
      modalContent.classList.add('scale-95');
      setTimeout(() => {
        modalAdicionar.classList.add('hidden');
      }, 200);
    }
  }

  if (btnNovoCachorro) btnNovoCachorro.onclick = (e) => { e.preventDefault(); abrirModal(); };
  if (btnFecharModal) btnFecharModal.onclick = (e) => { e.preventDefault(); fecharModal(); };
  if (btnCancelarModal) btnCancelarModal.onclick = (e) => { e.preventDefault(); fecharModal(); };
  if (modalAdicionar) modalAdicionar.onclick = (e) => { if (e.target === modalAdicionar) fecharModal(); };

  if (formAdicionar) {
    formAdicionar.onsubmit = (e) => {
      e.preventDefault();

      const nome = document.getElementById('add-nome-cao').value;
      const raca = document.getElementById('add-raca-cao').value;
      const sexo = document.getElementById('add-sexo-cao').value;
      const dataNascRaw = document.getElementById('add-nascimento-cao').value;
      const fileInput = document.getElementById('add-foto-file-cao');

      const [ano, mes, dia] = dataNascRaw.split('-');
      const dataNasc = new Date(ano, mes - 1, dia);
      const dataFmt = `${dia}/${mes}/${ano}`;

      const { textoIdade, textoFase } = calcularIdadeEFase(dataNasc);

      // Função interna que constrói e insere o card na tela
      const criarECadastrarCard = (fotoUrl) => {
        const bgSexo = sexo === 'Macho' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FCE7F3] text-[#EC4899]';

        const novoCard = document.createElement('div');
        novoCard.className = 'bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group';

        novoCard.innerHTML = `
          <div class="relative h-48 overflow-hidden">
            <img src="${fotoUrl}" alt="${nome}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <div class="absolute top-3 left-3 flex gap-1.5">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${sexo}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#374151] backdrop-blur-sm">${textoFase}</span>
            </div>
          </div>

          <div class="p-4">
            <h3 class="font-bold text-base text-[#111827]">${nome}</h3>
            <p class="text-xs text-[#6B7280] mb-3">${raca}</p>

            <div class="flex items-center justify-between text-[11px] text-[#6B7280] pt-3 border-t border-[#FAFAF9]">
              <span class="flex items-center gap-1"><i class="ri-cake-3-line"></i> ${textoIdade}</span>
              <span class="flex items-center gap-1"><i class="ri-calendar-line"></i> ${dataFmt}</span>
            </div>
          </div>
        `;

        const containerCards = document.querySelector('main div.grid') || document.querySelector('.container-caes');
        if (containerCards) {
          containerCards.appendChild(novoCard);
        }

        atualizarContadorHeader();
        fecharModal();
        mostrarToast(`Cão ${nome} cadastrado com sucesso!`);
      };

      // Se o usuário selecionou uma foto do dispositivo
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          criarECadastrarCard(e.target.result); // Passa a imagem local convertida
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        // Foto fallback caso não escolha nada
        const fotoPadrao = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600';
        criarECadastrarCard(fotoPadrao);
      }
    };
  }
});