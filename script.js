const produtos = [
    { id:'001', img:'tenis1.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Performance:</b> Amortecimento em gel e cabedal respirável para corridas de longa distância.' },
    { id:'002', img:'tenis2.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Conforto:</b> Palmilha anatômica e solado ultra leve, ideal para o uso casual diário.' },
    { id:'003', img:'tenis3.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Tecnologia:</b> Tecido AeroFlow que evita o suor e garante máxima ventilação nos treinos.' },
    { id:'004', img:'tenis4.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Estilo:</b> Design clássico com acabamento premium e reforço lateral para maior durabilidade.' },
    { id:'005', img:'tenis5.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Segurança:</b> Solado com grip de alta tração, perfeito para pisos molhados ou lisos.' },
    { id:'006', img:'tenis6.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Leveza:</b> Construído com materiais tecnológicos que reduzem o peso sem perder a firmeza.' },
    { id:'007', img:'tenis7.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Flexibilidade:</b> Acompanha o movimento natural dos pés, reduzindo o cansaço ao caminhar.' },
    { id:'008', img:'tenis8.jpeg', price:'R$ 350,00', value: 350, desc: '<b>Exclusividade:</b> Detalhes refletivos para segurança noturna e cores exclusivas da coleção.' }
];

let carrinho = [];
let desconto = 0;
let currentProductIndex = 0;
let selectedPaymentMethod = 'cartao';

// Máscaras para os campos de formulário
function maskCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

function maskCartao(cartao) {
    cartao = cartao.replace(/\D/g, '');
    cartao = cartao.replace(/(\d{4})(\d)/, '$1 $2');
    cartao = cartao.replace(/(\d{4})(\d)/, '$1 $2');
    cartao = cartao.replace(/(\d{4})(\d)/, '$1 $2');
    return cartao.substring(0, 19);
}

function maskValidade(validade) {
    validade = validade.replace(/\D/g, '');
    if (validade.length > 2) {
        validade = validade.replace(/(\d{2})(\d)/, '$1/$2');
    }
    return validade.substring(0, 5);
}

// Botão "Sobre o Produto"
function toggleDesc(id, event) {
    event.stopPropagation();
    
    // Fecha todas as outras descrições
    document.querySelectorAll('.desc-box').forEach(box => {
        if (box.id !== `desc-${id}`) {
            box.style.display = 'none';
        }
    });
    
    // Alterna a descrição atual
    const d = document.getElementById(`desc-${id}`);
    d.style.display = d.style.display === 'block' ? 'none' : 'block';
}

// Fecha descrição ao clicar fora
document.addEventListener('click', function(event) {
    if (!event.target.closest('.btn-sobre-container')) {
        document.querySelectorAll('.desc-box').forEach(box => {
            box.style.display = 'none';
        });
    }
});

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    const backBtn = document.getElementById('backBtn');
    const homeLogo = document.getElementById('headerHomeLogo');
    const checkoutTitle = document.getElementById('checkoutTitle');
    const rightLogo = document.getElementById('rightLogo');

    backBtn.style.visibility = 'hidden';
    homeLogo.style.display = 'none';
    checkoutTitle.style.display = 'none';
    rightLogo.style.display = 'none';

    if (id === 'home') { 
        homeLogo.style.display = 'flex'; 
    } else {
        rightLogo.style.display = 'block'; 
        if (id === 'catalog') backBtn.style.visibility = 'visible';
        else if (id === 'checkout') { 
            backBtn.style.visibility = 'visible'; 
            checkoutTitle.style.display = 'block'; 
            updateCheckoutCarousel();
            // Atualizar email no boleto
            const emailInput = document.getElementById('email');
            if (emailInput.value) {
                document.getElementById('boleto-email').textContent = emailInput.value;
            }
        }
        else if (id === 'success') {
            updateSuccessPage();
        }
    }
    window.scrollTo(0, 0);
}

function updateCheckoutCarousel() {
    const carouselTrack = document.getElementById('carousel-track');
    const carouselDots = document.getElementById('carouselDots');
    
    if (carrinho.length === 0) return;
    
    carouselTrack.innerHTML = '';
    carouselDots.innerHTML = '';
    
    carrinho.forEach((item, index) => {
        const quantidade = item.quantity || 1;
        
        carouselTrack.innerHTML += `
            <div class="carousel-slide">
                <div class="carousel-image-container">
                    <img src="${item.img}" alt="Tênis ${item.id}">
                </div>
                <div class="carousel-slide-info">
                    <h4>Tênis ${item.id}</h4>
                    <p>Tamanho: ${item.selectedSize}</p>
                    <p>Quantidade: ${quantidade}</p>
                    <p>${item.price} ${quantidade > 1 ? `(Total: R$ ${(item.value * quantidade).toFixed(2).replace('.', ',')})` : ''}</p>
                </div>
            </div>
        `;
        
        carouselDots.innerHTML += `
            <button class="carousel-dot ${index === 0 ? 'active' : ''}" 
                    onclick="goToProduct(${index})"></button>
        `;
    });
    
    // A largura do track deve ser 100% * número de itens
    carouselTrack.style.width = `${carrinho.length * 100}%`;
    
    // Calcular total de itens
    let itemCount = 0;
    carrinho.forEach(item => {
        itemCount += (item.quantity || 1);
    });
    
    document.getElementById('itemCount').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;
    updateOrderSummary();
    
    // Garantir que a primeira imagem seja mostrada
    currentProductIndex = 0;
    goToProduct(0);
}

// FUNÇÃO ATUALIZADA PARA A PÁGINA DE SUCESSO - COM IMAGEM
function updateSuccessPage() {
    const productInfoSection = document.getElementById('productInfoSection');
    
    if (carrinho.length === 0) {
        productInfoSection.innerHTML = '<p style="color: var(--cinza);">Nenhum produto no carrinho</p>';
        return;
    }
    
    // Limpar conteúdo anterior
    productInfoSection.innerHTML = '';
    
    // Mostrar apenas o PRIMEIRO produto do carrinho COM A IMAGEM
    const primeiroProduto = carrinho[0];
    const quantidade = primeiroProduto.quantity || 1;
    
    productInfoSection.innerHTML = `
        <div class="product-info-content">
            <div class="product-image-container">
                <img src="${primeiroProduto.img}" alt="Tênis ${primeiroProduto.id}">
            </div>
            <div class="product-info-item">
                <h4>Tênis ${primeiroProduto.id}</h4>
                <p>Tamanho: ${primeiroProduto.selectedSize}</p>
                <p>Quantidade: ${quantidade}</p>
            </div>
        </div>
    `;
    
    // Mostrar mensagem quando houver mais de 1 produto ou mais de 1 item no primeiro produto
    const totalItems = carrinho.reduce((total, item) => total + (item.quantity || 1), 0);
    if (totalItems > 1) {
        productInfoSection.innerHTML += `
            <div class="additional-items-message">
                <p>+ mais ${totalItems - 1} item${totalItems - 1 > 1 ? 's' : ''} no pedido</p>
            </div>
        `;
    }
}

function goToProduct(index) {
    if (carrinho.length === 0) return;
    
    currentProductIndex = index;
    const carouselTrack = document.getElementById('carousel-track');
    if (carouselTrack) {
        // IMPORTANTE: Mover 100% por produto
        carouselTrack.style.transform = `translateX(-${index * 100}%)`;
    }
    
    // Atualizar dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function prevProduct() {
    if (carrinho.length <= 1) return;
    
    // Calcular novo índice
    currentProductIndex--;
    if (currentProductIndex < 0) {
        currentProductIndex = carrinho.length - 1;
    }
    
    // Navegar para o produto
    goToProduct(currentProductIndex);
}

function nextProduct() {
    if (carrinho.length <= 1) return;
    
    // Calcular novo índice
    currentProductIndex++;
    if (currentProductIndex >= carrinho.length) {
        currentProductIndex = 0;
    }
    
    // Navegar para o produto
    goToProduct(currentProductIndex);
}

function updateOrderSummary() {
    let subtotal = 0;
    carrinho.forEach(item => {
        const quantidade = item.quantity || 1;
        subtotal += item.value * quantidade;
    });
    
    let descontoValor = subtotal * desconto;
    let total = subtotal - descontoValor;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('desconto-valor').textContent = `-R$ ${descontoValor.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-final').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function hideSizeAlert(id) {
    document.getElementById(`size-alert-${id}`).style.display = 'none';
}

// MODIFICADA: Agrupa itens iguais no carrinho
function addToCart(id) {
    const sizeSelect = document.getElementById(`size-${id}`);
    const sizeAlert = document.getElementById(`size-alert-${id}`);
    const selectedSize = sizeSelect.value;
    
    if (!selectedSize) { 
        sizeAlert.style.display = 'block';
        return; 
    }
    
    const p = produtos.find(x => x.id === id);
    
    // Verificar se já existe um item igual no carrinho (mesmo ID e mesmo tamanho)
    const existingItemIndex = carrinho.findIndex(item => 
        item.id === id && item.selectedSize === selectedSize
    );
    
    if (existingItemIndex !== -1) {
        // Item já existe, incrementar quantidade
        if (!carrinho[existingItemIndex].quantity) {
            carrinho[existingItemIndex].quantity = 1;
        }
        carrinho[existingItemIndex].quantity += 1;
    } else {
        // Item não existe, adicionar novo com quantidade 1
        carrinho.push({ 
            ...p, 
            selectedSize: selectedSize,
            quantity: 1
        });
    }
    
    sizeSelect.value = ""; 
    
    // Feedback visual
    const addBtn = sizeSelect.closest('.product-card').querySelector('.add-btn');
    const originalHTML = addBtn.innerHTML;
    addBtn.innerHTML = '<i class="fas fa-check"></i>';
    addBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
        addBtn.innerHTML = originalHTML;
        addBtn.style.background = '';
    }, 1000);
    
    renderCart();
}

function aplicarCupom() {
    const cupom = document.getElementById('cupom-input').value.toUpperCase();
    const feedback = document.getElementById('cupom-feedback');
    
    if (cupom === "SHOES10" || cupom === "MATOS10") {
        desconto = 0.10; 
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Cupom de 10% aplicado!'; 
        feedback.style.color = "#4CAF50";
    } else if (cupom === "ESTUDANTE15") {
        desconto = 0.15; 
        feedback.innerHTML = '<i class="fas fa-graduation-cap"></i> Cupom estudante de 15% aplicado!'; 
        feedback.style.color = "#4CAF50";
    } else if (cupom === "") {
        desconto = 0; 
        feedback.innerHTML = ""; 
    } else {
        desconto = 0; 
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> Cupom inválido'; 
        feedback.style.color = "#d32f2f";
    }
    
    renderCart();
    if (document.querySelector('.page.active').id === 'checkout') {
        updateOrderSummary();
    }
}

// MODIFICADA: Mostra itens agrupados com quantidades
function renderCart() {
    const cartList = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-value');
    
    if(carrinho.length === 0) {
        cartList.innerHTML = '<div class="cart-empty"><p style="font-size: 16px; color: #777; text-align: center; padding: 20px;">Seu carrinho está vazio</p></div>';
        totalEl.innerText = `R$ 0,00`;
        document.getElementById('btn-go-checkout').style.display = 'none';
        return;
    }
    
    cartList.innerHTML = '';
    let total = 0;
    let itemCount = 0;
    
    carrinho.forEach((item, index) => {
        const quantidade = item.quantity || 1;
        const itemTotal = item.value * quantidade;
        total += itemTotal;
        itemCount += quantidade;
        
        cartList.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>Tênis ${item.id}</strong><br>
                    <small>Tamanho: ${item.selectedSize}</small><br>
                    <small>Quantidade: ${quantidade}</small>
                </div>
                <div class="cart-item-actions">
                    <button onclick="changeQuantity(${index}, -1)" title="Diminuir">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button onclick="changeQuantity(${index}, 1)" title="Aumentar">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="removeItem(${index})" title="Remover">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>`;
    });
    
    let final = total * (1 - desconto);
    let descontoValor = total * desconto;
    
    if (desconto > 0) {
        cartList.innerHTML += `
            <div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 10px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Desconto:</span>
                    <span style="color: #4CAF50; font-weight: bold;">-R$ ${descontoValor.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>`;
    }
    
    totalEl.innerText = `R$ ${final.toFixed(2).replace('.', ',')}`;
    document.getElementById('btn-go-checkout').style.display = 'block';
}

// NOVA FUNÇÃO: Alterar quantidade de um item
function changeQuantity(index, delta) {
    if (!carrinho[index].quantity) {
        carrinho[index].quantity = 1;
    }
    
    carrinho[index].quantity += delta;
    
    if (carrinho[index].quantity <= 0) {
        removeItem(index);
    } else {
        renderCart();
        // Atualizar carrossel do checkout se estiver na página
        if (document.querySelector('.page.active').id === 'checkout') {
            updateCheckoutCarousel();
        }
    }
}

function removeItem(index) { 
    carrinho.splice(index, 1); 
    renderCart(); 
    // Atualizar carrossel do checkout se estiver na página
    if (document.querySelector('.page.active').id === 'checkout') {
        updateCheckoutCarousel();
    }
    // Atualizar página de sucesso se estiver nela
    if (document.querySelector('.page.active').id === 'success') {
        updateSuccessPage();
    }
}

function togglePagamento(metodo) {
    selectedPaymentMethod = metodo;
    
    // Remover classe active de todos
    document.querySelectorAll('.payment-field').forEach(field => {
        field.classList.remove('active');
    });
    
    // Adicionar classe active ao campo selecionado
    document.getElementById(`campo-${metodo}`).classList.add('active');
    
    // Atualizar validação
    validateForm();
}

function copyPixKey() {
    const pixKey = '00.123.456/0001-99';
    navigator.clipboard.writeText(pixKey).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    });
}

function goToCheckout() {
    if (carrinho.length === 0) {
        alert("Adicione itens ao carrinho primeiro!");
        return;
    }
    
    showPage('checkout');
}

function resetOrder() {
    // NÃO SALVAR INFORMAÇÕES - limpar tudo
    document.querySelectorAll('input').forEach(input => {
        if (input.type !== 'radio') {
            input.value = '';
        }
    });
    
    // Resetar para cartão
    document.getElementById('cartao').checked = true;
    togglePagamento('cartao');
    
    document.getElementById('cupom-input').value = '';
    document.getElementById('cupom-feedback').innerHTML = '';
    
    carrinho = []; 
    desconto = 0; 
    currentProductIndex = 0;
    
    renderCart();
    showPage('home');
}

// Validação de formulário
function validateForm() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    
    // Validar CPF (apenas formato)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const isCpfValid = cpfRegex.test(cpf);
    
    let isPaymentValid = false;
    
    // Validar de acordo com o método de pagamento selecionado
    if (selectedPaymentMethod === 'cartao') {
        const cartao = document.getElementById('numero-cartao').value.trim();
        const validade = document.getElementById('validade').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        
        const cartaoRegex = /^\d{4} \d{4} \d{4} \d{4}$/;
        const validadeRegex = /^\d{2}\/\d{2}$/;
        const cvvRegex = /^\d{3}$/;
        
        isPaymentValid = cartaoRegex.test(cartao) && 
                        validadeRegex.test(validade) && 
                        cvvRegex.test(cvv);
    } 
    else if (selectedPaymentMethod === 'pix') {
        // PIX não precisa de preenchimento adicional
        isPaymentValid = true;
    }
    else if (selectedPaymentMethod === 'boleto') {
        // Boleto usa o email já validado
        isPaymentValid = isEmailValid;
    }
    
    const finalizarBtn = document.getElementById('finalizar');
    finalizarBtn.disabled = !(nome && isEmailValid && isCpfValid && endereco && isPaymentValid);
}

// Configurar máscaras e eventos
document.addEventListener('DOMContentLoaded', function() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            e.target.value = maskCPF(e.target.value);
            validateForm();
        });
    }
    
    // Máscara para cartão
    const cartaoInput = document.getElementById('numero-cartao');
    if (cartaoInput) {
        cartaoInput.addEventListener('input', function(e) {
            e.target.value = maskCartao(e.target.value);
            validateForm();
        });
    }
    
    // Máscara para validade
    const validadeInput = document.getElementById('validade');
    if (validadeInput) {
                validadeInput.addEventListener('input', function(e) {
            e.target.value = maskValidade(e.target.value);
            validateForm();
        });
    }
    
    // Máscara para CVV (apenas números)
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
            validateForm();
        });
    }
    
    // Atualizar email no boleto quando digitar
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function(e) {
            const boletoEmail = document.getElementById('boleto-email');
            if (e.target.value.trim()) {
                boletoEmail.textContent = e.target.value;
            } else {
                boletoEmail.textContent = 'carregando...';
            }
            validateForm();
        });
    }
    
    // Configurar opções de pagamento
    document.querySelectorAll('input[name="pgto"]').forEach(radio => {
        radio.addEventListener('change', function() {
            togglePagamento(this.value);
        });
    });
    
    // Validar outros campos do formulário
    document.getElementById('nome').addEventListener('input', validateForm);
    document.getElementById('email').addEventListener('input', validateForm);
    document.getElementById('endereco').addEventListener('input', validateForm);
    
    // Configurar tecla Enter no cupom
    const cupomInput = document.getElementById('cupom-input');
    if (cupomInput) {
        cupomInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarCupom();
            }
        });
    }
    
    // Configurar botão finalizar
    const finalizarBtn = document.getElementById('finalizar');
    if (finalizarBtn) {
        finalizarBtn.addEventListener('click', function() {
            finalizarCompra();
        });
    }
});

function goBack() {
    const activePage = document.querySelector('.page.active').id;
    if (activePage === 'checkout') showPage('catalog');
    else if (activePage === 'catalog') showPage('home');
}

// Função para finalizar compra
function finalizarCompra() {
    // Primeiro validar o formulário
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    
    if (!nome || !email || !cpf || !endereco) {
        alert("Preencha todas as informações antes de finalizar a compra!");
        return;
    }
    
    // Atualizar a página de sucesso antes de mostrar
    updateSuccessPage();
    showPage('success');
}

// Renderizar produtos
const list = document.getElementById('productList');
produtos.forEach(p => {
    list.innerHTML += `
    <div class="product-card">
        <img src="${p.img}" alt="Tênis ${p.id}">
        <div class="product-info">
            <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Tênis ${p.id}</p>
            
            <div class="btn-sobre-container">
                <button class="btn-sobre" onclick="toggleDesc('${p.id}', event)">
                    <i class="fas fa-info-circle"></i> SOBRE
                </button>
                <div id="desc-${p.id}" class="desc-box">${p.desc}</div>
            </div>

            <select id="size-${p.id}" class="size-selector-catalog" onchange="hideSizeAlert('${p.id}')">
                <option value="">Tamanho</option>
                <option value="39">39</option>
                <option value="40">40</option>
                <option value="41">41</option>
                <option value="42">42</option>
                <option value="43">43</option>
                <option value="44">44</option>
            </select>
            <div id="size-alert-${p.id}" class="size-alert">
                <i class="fas fa-exclamation-triangle"></i> Escolha um tamanho!
            </div>
            
            <div class="price-add-container">
                <span class="price">${p.price}</span>
                <button class="add-btn" onclick="addToCart('${p.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    </div>`;
});

// Inicializar
showPage('home'); 
