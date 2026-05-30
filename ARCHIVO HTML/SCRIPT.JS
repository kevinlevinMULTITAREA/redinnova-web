// ===== DATOS DE PRODUCTOS =====
const products = [
    {
        id: 1,
        name: 'PC Gamer Pro',
        category: 'computadoras',
        price: 1500,
        originalPrice: 1500,
        description: 'Computadora gaming de alta gama con RTX 4080',
        rating: 4.9,
        reviews: 48,
        icon: '🖥️'
    },
    {
        id: 2,
        name: 'Laptop Profesional',
        category: 'laptops',
        price: 1800,
        originalPrice: 2200,
        description: 'Laptop ultradelgada para profesionales',
        rating: 4.8,
        reviews: 35,
        icon: '💻'
    },
    {
        id: 3,
        name: 'Mouse Inalámbrico',
        category: 'perifericos',
        price: 45,
        originalPrice: 60,
        description: 'Mouse gaming con precision extrema',
        rating: 4.7,
        reviews: 120,
        icon: '🖱️'
    },
    {
        id: 4,
        name: 'Teclado Mecánico RGB',
        category: 'perifericos',
        price: 120,
        originalPrice: 150,
        description: 'Teclado mecánico con luces RGB',
        rating: 4.9,
        reviews: 89,
        icon: '⌨️'
    },
    {
        id: 5,
        name: 'Monitor 4K 27"',
        category: 'perifericos',
        price: 450,
        originalPrice: 600,
        description: 'Monitor 4K con 144Hz de refresco',
        rating: 4.8,
        reviews: 56,
        icon: '🖥️'
    },
    {
        id: 6,
        name: 'Headset Gamer',
        category: 'perifericos',
        price: 150,
        originalPrice: 200,
        description: 'Headset con sonido envolvente 7.1',
        rating: 4.9,
        reviews: 102,
        icon: '🎧'
    },
    {
        id: 7,
        name: 'Software Diseño Pro',
        category: 'software',
        price: 79,
        originalPrice: 99,
        description: 'Suite completa de diseño profesional',
        rating: 4.8,
        reviews: 42,
        icon: '🎨'
    },
    {
        id: 8,
        name: 'Antivirus Premium',
        category: 'software',
        price: 49,
        originalPrice: 69,
        description: 'Protección total contra malware',
        rating: 4.7,
        reviews: 78,
        icon: '🛡️'
    },
    {
        id: 9,
        name: 'Laptop Dell XPS',
        category: 'laptops',
        price: 2500,
        originalPrice: 3000,
        description: 'Laptop premium con pantalla OLED',
        rating: 5,
        reviews: 34,
        icon: '💻'
    }
];

let cart = [];
let filteredProducts = [...products];

// ===== ARRAYS PARA ALMACENAR DATOS =====
let compras = [];
let ventas = [];
let cajaMovimientos = [];
let ventasPersonales = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    renderProducts(products);
    setupEventListeners();
    loadCartFromStorage();
    loadComprasFromStorage();
    loadVentasFromStorage();
    loadCajaFromStorage();
    loadVentasPersonalesFromStorage();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer click en link
    document.querySelectorAll('.nav-links-pro a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
}

// ===== RENDERIZAR PRODUCTOS =====
function renderProducts(productsToRender) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.cursor = 'pointer';
        productCard.innerHTML = `
            <div class="product-image">
                ${product.icon}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <div class="stars">${'⭐'.repeat(Math.floor(product.rating))}</div>
                    <span class="rating-count">(${product.reviews} opiniones)</span>
                </div>
                <div class="product-footer">
                    <div>
                        <span class="product-price">$${product.price}</span>
                        <span class="product-price-small">$${product.originalPrice}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id}); event.stopPropagation();">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Click en toda la tarjeta abre el modal con la categoría
        productCard.addEventListener('click', () => showProductDetail(product));
        productsGrid.appendChild(productCard);
    });
}

// ===== FILTRAR PRODUCTOS =====
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (category === 'all') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(p => p.category === category);
    }

    renderProducts(filteredProducts);
}

// ===== AGREGAR AL CARRITO =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    saveCartToStorage();
    showNotification('✅ Producto agregado al carrito');
}

// ===== ACTUALIZAR CARRITO =====
function updateCart() {
    updateCartCount();
    renderCartItems();
    calculateTotal();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
    showNotification('❌ Producto removido del carrito');
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.16;
    const total = subtotal + taxes;

    document.getElementById('cartSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('cartTaxes').textContent = taxes.toFixed(2);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// ===== CARRITO MODAL =====
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('active');
}

function checkout() {
    if (cart.length === 0) {
        alert('❌ Tu carrito está vacío');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity * 1.16), 0);
    alert(`✅ Compra completada!\n\nTotal: $${total.toFixed(2)}\n\nGracias por tu compra!`);
    
    cart = [];
    updateCart();
    saveCartToStorage();
    toggleCart();
}

// ===== ALMACENAMIENTO LOCAL =====
function saveCartToStorage() {
    localStorage.setItem('redinnova_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('redinnova_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

function saveComprasToStorage() {
    localStorage.setItem('redinnova_compras', JSON.stringify(compras));
}

function loadComprasFromStorage() {
    const savedCompras = localStorage.getItem('redinnova_compras');
    if (savedCompras) {
        compras = JSON.parse(savedCompras);
    }
}

function saveVentasToStorage() {
    localStorage.setItem('redinnova_ventas', JSON.stringify(ventas));
}

function loadVentasFromStorage() {
    const savedVentas = localStorage.getItem('redinnova_ventas');
    if (savedVentas) {
        ventas = JSON.parse(savedVentas);
    }
}

function saveCajaToStorage() {
    localStorage.setItem('redinnova_caja', JSON.stringify(cajaMovimientos));
}

function loadCajaFromStorage() {
    const savedCaja = localStorage.getItem('redinnova_caja');
    if (savedCaja) {
        cajaMovimientos = JSON.parse(savedCaja);
    }
}

function saveVentasPersonalesFromStorage() {
    localStorage.setItem('redinnova_ventasPersonales', JSON.stringify(ventasPersonales));
}

function loadVentasPersonalesFromStorage() {
    const savedVP = localStorage.getItem('redinnova_ventasPersonales');
    if (savedVP) {
        ventasPersonales = JSON.parse(savedVP);
    }
}

// ===== SCROLL SUAVE =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #00bcd4;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInLeft 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('✅ Reinnova Shop cargado correctamente');

// ===== DATOS DE EMPLEADOS CON FOTOS =====
const employees = [
    {
        id: 1,
        name: 'Alex Gutierrez',
        service: 'Informatica',
        phone: '+51 55 1234 5678',
        email: 'Alex.Gutieres@redinnova.com',
        role: 'Sistema Informatico',
        photo: null
    },
    {
        id: 2,
        name: 'frank',
        service: 'Soporte tecnico',
        phone: '+51 55 2345 6789',
        email: 'Frank@redinnova.com',
        role: 'Mantenimiento de pc',
        photo: null
    },
    {
        id: 3,
        name: 'Jeancarlo',
        service: 'Administrador',
        phone: '+51 55 3456 7890',
        email: 'juan@redinnova.com',
        role: 'Administrado',
        photo: null
    },
    {
        id: 4,
        name: 'Kevin Andrade',
        service: 'Informatica',
        phone: '+51 55 4567 8901',
        email: 'ana@redinnova.com',
        role: 'Sistemas Informatico',
        photo: null
    },
    {
        id: 5,
        name: 'Sebastian',
        service: 'Soporte Técnico',
        phone: '+51 55 5678 9012',
        email: 'pedro@redinnova.com',
        role: 'Tecnico Soporte',
        photo: null
    },
];

let selectedEmployee = null;
let editingEmployeeId = null;
let fotoTemporalEmpleado = null;

// ===== CARGAR EMPLEADOS DESDE STORAGE =====
function loadEmployeesFromStorage() {
    const stored = localStorage.getItem('employees');
    if (stored) {
        const loadedEmployees = JSON.parse(stored);
        employees.length = 0;
        employees.push(...loadedEmployees);
    }
}

// ===== GUARDAR EMPLEADOS EN STORAGE =====
function saveEmployeesToStorage() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

// ===== RENDERIZAR EQUIPO =====
function renderTeam() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;
    teamGrid.innerHTML = '';

    employees.forEach(employee => {
        const employeeCard = document.createElement('div');
        employeeCard.className = 'employee-card';
        
        // Generar HTML del avatar con foto
        const avatarHTML = employee.photo 
            ? `<div class="employee-avatar" style="background-image: url('${employee.photo}'); background-size: cover; background-position: center;"></div>`
            : `<div class="employee-avatar"><i class="fas fa-user-circle"></i></div>`;
        
        employeeCard.innerHTML = `
            ${avatarHTML}
            <h3>${employee.name}</h3>
            <div class="employee-service">
                <i class="fas fa-briefcase"></i>
                ${employee.service}
            </div>
            <p class="employee-role">${employee.role}</p>
            <div class="employee-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem; justify-content: center;">
                <button class="btn-edit-employee" onclick="verificarLoginParaEditar(${employee.id})" title="Editar empleado" style="background: #2196F3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete-employee" onclick="verificarLoginParaEliminar(${employee.id})" title="Eliminar empleado" style="background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        employeeCard.addEventListener('click', (e) => {
            if (!e.target.closest('.employee-actions')) {
                showEmployeeModal(employee);
            }
        });
        teamGrid.appendChild(employeeCard);
    });

    // ✅ BOTÓN PARA AGREGAR NUEVO EMPLEADO
    const addEmployeeCard = document.createElement('div');
    addEmployeeCard.className = 'employee-card add-employee-card';
    addEmployeeCard.innerHTML = `
        <div class="employee-avatar" style="font-size: 3rem; color: #00bcd4;">
            <i class="fas fa-plus-circle"></i>
        </div>
        <h3>Agregar Empleado</h3>
        <p style="color: #999;">Añade un nuevo miembro al equipo</p>
    `;
    addEmployeeCard.addEventListener('click', verificarLoginParaAgregar);
    addEmployeeCard.style.cursor = 'pointer';
    teamGrid.appendChild(addEmployeeCard);
}

// ===== VERIFICAR LOGIN PARA AGREGAR EMPLEADO =====
function verificarLoginParaAgregar() {
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para agregar empleados');
        abrirLoginSeguro();
        return;
    }
    fotoTemporalEmpleado = null;
    showAddEmployeeModal();
}

// ===== VERIFICAR LOGIN PARA EDITAR EMPLEADO =====
function verificarLoginParaEditar(employeeId) {
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para editar empleados');
        abrirLoginSeguro();
        return;
    }
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
        fotoTemporalEmpleado = employee.photo;
        showAddEmployeeModal(employee);
    }
}

// ===== VERIFICAR LOGIN PARA ELIMINAR EMPLEADO =====
function verificarLoginParaEliminar(employeeId) {
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para eliminar empleados');
        abrirLoginSeguro();
        return;
    }
    deleteEmployee(employeeId);
}

// ===== MODAL PARA AGREGAR/EDITAR EMPLEADO =====
function showAddEmployeeModal(employeeToEdit = null) {
    editingEmployeeId = employeeToEdit ? employeeToEdit.id : null;
    
    const isEditing = employeeToEdit !== null;
    const modal = document.createElement('div');
    modal.className = 'add-employee-modal';
    modal.id = 'addEmployeeModal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeAddEmployeeModal()"></div>
        <div class="modal-box-add-employee">
            <span class="close-modal" onclick="closeAddEmployeeModal()">
                <i class="fas fa-times"></i>
            </span>
            <h2 style="margin-bottom: 1.5rem; color: #1a1a1a;">
                <i class="fas fa-user-plus"></i> ${isEditing ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
            </h2>

            <!-- UPLOAD FOTO -->
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="font-weight: 600; margin-bottom: 0.8rem; display: block;">📸 Foto de Perfil</label>
                <div class="upload-foto-container" style="
                    border: 2px dashed #00bcd4;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: rgba(0, 188, 212, 0.05);
                ">
                    <div id="previewFotoEmpleado" onclick="event.stopPropagation(); document.getElementById('inputFotoEmpleado').click();" style="
                        width: 120px;
                        height: 120px;
                        margin: 0 auto 10px;
                        border-radius: 50%;
                        background: #f0f0f0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                        color: #00bcd4;
                        position: relative;
                        cursor: pointer;
                        transition: all 0.3s;
                        ${isEditing && employeeToEdit.photo ? `background-image: url('${employeeToEdit.photo}'); background-size: cover; background-position: center;` : ''}
                    ">
                        ${(!isEditing || !employeeToEdit.photo) ? '<i class="fas fa-camera"></i>' : ''}
                    </div>
                    <p style="margin: 0; color: #666; font-weight: 500;">Haz click para subir foto</p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 0.85rem;">Máximo 5MB</p>
                    
                    <!-- Botón para eliminar foto -->
                    ${isEditing && employeeToEdit.photo ? `
                        <button type="button" onclick="eliminarFotoEmpleado()" style="
                            margin-top: 10px;
                            background: #f44336;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">
                            <i class="fas fa-trash"></i> Eliminar Foto
                        </button>
                    ` : ''}
                    
                    <input type="file" id="inputFotoEmpleado" accept="image/*" style="display:none;" onchange="cargarFotoEmpleado(event)">
                </div>
            </div>

            <form id="formAddEmployee" onsubmit="saveNewEmployee(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre Completo: *</label>
                        <input type="text" id="newEmpName" placeholder="Ej: Juan Pérez" value="${isEditing ? employeeToEdit.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Servicio/Departamento: *</label>
                        <input type="text" id="newEmpService" placeholder="Ej: Soporte Técnico" value="${isEditing ? employeeToEdit.service : ''}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Teléfono: *</label>
                        <input type="tel" id="newEmpPhone" placeholder="+51 999 999 999" value="${isEditing ? employeeToEdit.phone : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Email: *</label>
                        <input type="email" id="newEmpEmail" placeholder="empleado@redinnova.com" value="${isEditing ? employeeToEdit.email : ''}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Rol/Puesto: *</label>
                        <input type="text" id="newEmpRole" placeholder="Ej: Técnico Senior" value="${isEditing ? employeeToEdit.role : ''}" required>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn-save-employee">
                        <i class="fas fa-save"></i> ${isEditing ? 'Guardar Cambios' : 'Guardar Empleado'}
                    </button>
                    <button type="button" class="btn-cancel-employee" onclick="closeAddEmployeeModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');
    agregarEstilosModalEmpleado();
}

// ===== CARGAR FOTO EMPLEADO =====
function cargarFotoEmpleado(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        fotoTemporalEmpleado = e.target.result;
        const preview = document.getElementById('previewFotoEmpleado');
        preview.style.backgroundImage = `url('${fotoTemporalEmpleado}')`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        preview.innerHTML = '';
        
        // Agregar botón de eliminar si aún no existe
        const container = preview.parentElement;
        if (!container.querySelector('.btn-eliminar-foto')) {
            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.className = 'btn-eliminar-foto';
            btnEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar Foto';
            btnEliminar.onclick = eliminarFotoEmpleado;
            btnEliminar.style.cssText = `
                margin-top: 10px;
                background: #f44336;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
            `;
            container.appendChild(btnEliminar);
        }
    };
    reader.readAsDataURL(file);
}

// ===== ELIMINAR FOTO EMPLEADO =====
function eliminarFotoEmpleado() {
    fotoTemporalEmpleado = null;
    const preview = document.getElementById('previewFotoEmpleado');
    preview.style.backgroundImage = '';
    preview.innerHTML = '<i class="fas fa-camera"></i>';
    
    // Limpiar input
    const input = document.getElementById('inputFotoEmpleado');
    if (input) input.value = '';
    
    // Eliminar botón de eliminar si existe
    const btnEliminar = preview.parentElement.querySelector('.btn-eliminar-foto');
    if (btnEliminar) btnEliminar.remove();
}

// ===== CERRAR MODAL DE AGREGAR EMPLEADO =====
function closeAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    editingEmployeeId = null;
    fotoTemporalEmpleado = null;
}

// ===== EDITAR EMPLEADO =====
function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
        fotoTemporalEmpleado = employee.photo;
        showAddEmployeeModal(employee);
    }
}

// ===== ELIMINAR EMPLEADO =====
function deleteEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    if (confirm(`¿Estás seguro que deseas eliminar a ${employee.name}?`)) {
        employees.splice(employees.findIndex(e => e.id === employeeId), 1);
        saveEmployeesToStorage();
        renderTeam();
        mostrarNotificacionSegura(`❌ ${employee.name} ha sido eliminado`);
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, `Empleado ${employee.name} eliminado`, 'info');
    }
}

// ===== GUARDAR NUEVO EMPLEADO O EDITAR =====
function saveNewEmployee(event) {
    event.preventDefault();

    const employeeData = {
        name: document.getElementById('newEmpName').value,
        service: document.getElementById('newEmpService').value,
        phone: document.getElementById('newEmpPhone').value,
        email: document.getElementById('newEmpEmail').value,
        role: document.getElementById('newEmpRole').value,
        photo: fotoTemporalEmpleado
    };

    if (editingEmployeeId) {
        // Editar empleado existente
        const employeeIndex = employees.findIndex(e => e.id === editingEmployeeId);
        if (employeeIndex !== -1) {
            employees[employeeIndex] = {
                id: editingEmployeeId,
                ...employeeData
            };
            saveEmployeesToStorage();
            renderTeam();
            closeAddEmployeeModal();
            mostrarNotificacionSegura('✅ Empleado actualizado exitosamente');
            registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, `Empleado ${employeeData.name} actualizado`, 'info');
        }
    } else {
        // Crear nuevo empleado
        const newEmployee = {
            id: Date.now(),
            ...employeeData
        };

        employees.push(newEmployee);
        saveEmployeesToStorage();
        renderTeam();
        closeAddEmployeeModal();
        mostrarNotificacionSegura('✅ Empleado agregado exitosamente');
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, `Nuevo empleado ${employeeData.name} agregado`, 'info');
    }
}

// ===== AGREGAR ESTILOS PARA MODAL DE EMPLEADO =====
function agregarEstilosModalEmpleado() {
    if (!document.getElementById('estilosModalEmpleado')) {
        const style = document.createElement('style');
        style.id = 'estilosModalEmpleado';
        style.innerHTML = `
            .add-employee-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
            }

            .add-employee-modal.active {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .add-employee-modal .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: -1;
            }

            .modal-box-add-employee {
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 500px;
                padding: 2rem;
                position: relative;
                z-index: 2001;
                max-height: 90vh;
                overflow-y: auto;
            }

            .modal-box-add-employee .close-modal {
                position: absolute;
                top: 1rem;
                right: 1rem;
                cursor: pointer;
                font-size: 1.5rem;
                color: #999;
                transition: color 0.3s;
                background: none;
                border: none;
                padding: 0;
            }

            .modal-box-add-employee .close-modal:hover {
                color: #00bcd4;
            }

            .modal-box-add-employee .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .modal-box-add-employee .form-group {
                display: flex;
                flex-direction: column;
            }

            .modal-box-add-employee .form-group label {
                font-weight: 600;
                color: #333;
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }

            .modal-box-add-employee .form-group input {
                padding: 0.8rem;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s;
                font-family: inherit;
            }

            .modal-box-add-employee .form-group input:focus {
                outline: none;
                border-color: #00bcd4;
                box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
            }

            .modal-box-add-employee .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

            .btn-save-employee,
            .btn-cancel-employee {
                flex: 1;
                padding: 0.8rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 1rem;
            }

            .btn-save-employee {
                background: linear-gradient(135deg, #00bcd4, #0097a7);
                color: white;
            }

            .btn-save-employee:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
            }

            .btn-cancel-employee {
                background: #f5f5f5;
                color: #666;
            }

            .btn-cancel-employee:hover {
                background: #e0e0e0;
            }

            .add-employee-card {
                border: 2px dashed #00bcd4;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .add-employee-card:hover {
                background: rgba(0, 188, 212, 0.05);
                border-color: #0097a7;
                transform: translateY(-5px);
            }

            .btn-edit-employee:hover,
            .btn-delete-employee:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }

            @media (max-width: 768px) {
                .modal-box-add-employee .form-row {
                    grid-template-columns: 1fr;
                }

                .modal-box-add-employee {
                    width: 95%;
                    padding: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== MOSTRAR MODAL DE EMPLEADO =====
function showEmployeeModal(employee) {
    selectedEmployee = employee;
    
    document.getElementById('employeeName').textContent = employee.name;
    document.getElementById('employeeService').textContent = employee.service;
    document.getElementById('employeePhone').textContent = employee.phone;
    document.getElementById('employeeEmail').textContent = employee.email;
    
    // Actualizar avatar con foto si existe
    const avatarEl = document.querySelector('.employee-avatar');
    if (avatarEl && employee.photo) {
        avatarEl.style.backgroundImage = `url('${employee.photo}')`;
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.innerHTML = '';
    }
    
    const employeeModal = document.getElementById('employeeModal');
    if (employeeModal) {
        employeeModal.style.display = 'flex';
    }
}

// ===== CERRAR MODAL =====
function closeEmployeeModal() {
    const employeeModal = document.getElementById('employeeModal');
    if (employeeModal) {
        employeeModal.style.display = 'none';
    }
    selectedEmployee = null;
}

// ===== LLAMAR EMPLEADO =====
function callEmployee() {
    if (selectedEmployee) {
        const phoneNumber = selectedEmployee.phone.replace(/\D/g, '');
        window.location.href = `tel:${phoneNumber}`;
    }
}

// ===== WHATSAPP EMPLEADO =====
function whatsappEmployee() {
    if (selectedEmployee) {
        const phoneNumber = selectedEmployee.phone.replace(/\D/g, '');
        const message = `Hola ${selectedEmployee.name}, me gustaría obtener más información sobre ${selectedEmployee.service}.`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// ===== CERRAR MODAL AL PRESIONAR ESC =====
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEmployeeModal();
        closeAddEmployeeModal();
    }
});

// ===== LLAMAR AL CARGAR =====
document.addEventListener('DOMContentLoaded', function() {
    loadEmployeesFromStorage();
    renderTeam();
});

// ===== PRODUCTOS VARIADOS CON MARCAS Y MODELOS =====
const productosVariados = {
    'computadoras': [
        { nombre: 'Dell OptiPlex 7090', marca: 'Dell', modelo: '7090', precio: 850, descripcion: 'PC Escritorio Profesional' },
        { nombre: 'HP Elite Desktop', marca: 'HP', modelo: 'EliteDesk', precio: 950, descripcion: 'PC Gaming' },
        { nombre: 'Lenovo ThinkCentre', marca: 'Lenovo', modelo: 'M90', precio: 750, descripcion: 'PC Empresa' },
        { nombre: 'ASUS VivoPC', marca: 'ASUS', modelo: 'UN45', precio: 1100, descripcion: 'PC Compacta' },
        { nombre: 'Acer Aspire', marca: 'Acer', modelo: 'XC-330', precio: 600, descripcion: 'PC Básica' }
    ],
    'laptops': [
        { nombre: 'MacBook Pro', marca: 'Apple', modelo: '14"', precio: 1999, descripcion: 'Laptop Premium' },
        { nombre: 'ThinkPad X1', marca: 'Lenovo', modelo: 'Carbon', precio: 1500, descripcion: 'Laptop Profesional' },
        { nombre: 'XPS 13', marca: 'Dell', modelo: '9310', precio: 1200, descripcion: 'Ultrabook' },
        { nombre: 'ROG Gaming', marca: 'ASUS', modelo: 'G15', precio: 1800, descripcion: 'Laptop Gaming' },
        { nombre: 'Surface Laptop', marca: 'Microsoft', modelo: '5', precio: 1500, descripcion: 'Laptop Táctil' }
    ],
    'perifericos': [
        { nombre: 'Logitech MX Master', marca: 'Logitech', modelo: '3S', precio: 99, descripcion: 'Mouse Pro' },
        { nombre: 'Corsair K95 RGB', marca: 'Corsair', modelo: 'Platinum', precio: 199, descripcion: 'Teclado Mecánico' },
        { nombre: 'Samsung M7', marca: 'Samsung', modelo: '32"', precio: 500, descripcion: 'Monitor 4K' },
        { nombre: 'SteelSeries Arctis', marca: 'SteelSeries', modelo: 'Pro', precio: 329, descripcion: 'Headset Gaming' },
        { nombre: 'Razer DeathAdder', marca: 'Razer', modelo: 'V3', precio: 69, descripcion: 'Mouse Gaming' },
        { nombre: 'HyperX Alloy Elite', marca: 'HyperX', modelo: '2', precio: 149, descripcion: 'Teclado Gaming' },
        { nombre: 'BenQ EW2480', marca: 'BenQ', modelo: '24"', precio: 189, descripcion: 'Monitor IPS' }
    ],
    'software': [
        { nombre: 'Adobe Creative Suite', marca: 'Adobe', modelo: '2024', precio: 54.99, descripcion: 'Suite Diseño Mensual' },
        { nombre: 'Microsoft Office 365', marca: 'Microsoft', modelo: 'Pro', precio: 99.99, descripcion: 'Ofimática Premium' },
        { nombre: 'Kaspersky Total', marca: 'Kaspersky', modelo: '2024', precio: 49.99, descripcion: 'Antivirus' },
        { nombre: 'WinRAR', marca: 'WinRAR', modelo: '6.0', precio: 29.99, descripcion: 'Compresor Archivos' },
        { nombre: 'Visual Studio Code', marca: 'Microsoft', modelo: 'Pro', precio: 0, descripcion: 'Editor de Código' }
    ]
};

// ===== MOSTRAR MÓDULO =====
function showModule(moduleId) {
    const modalContent = document.getElementById('modalContent');
    
    // Abrir el modal primero
    document.getElementById('moduleModal').classList.add('active');
    
    let content = '';
    
    switch(moduleId) {
        case 'ingreso-compras':
            content = `
                <h2><i class="fas fa-inbox"></i> Ingreso de Compras</h2>
                <form id="formCompras" class="form-module">
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Proveedor</label>
                            <input type="text" id="comprasProveedor" placeholder="Nombre del proveedor" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Fecha</label>
                            <input type="date" id="comprasFecha" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-box"></i> Producto</label>
                            <input type="text" id="comprasProducto" placeholder="Producto comprado" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-barcode"></i> Número de Serie</label>
                            <input type="text" id="comprasSerie" placeholder="Ej: SN-123456789" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-hashtag"></i> Cantidad</label>
                            <input type="number" id="comprasCantidad" placeholder="Cantidad" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-dollar-sign"></i> Valor Unitario</label>
                            <input type="number" id="comprasValor" placeholder="Precio unitario" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-calculator"></i> Total</label>
                            <input type="number" id="comprasTotal" placeholder="Total" step="0.01" readonly>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">💾 Registrar Compra</button>
                </form>
                <div id="tablaComprasContainer"></div>
            `;
            modalContent.innerHTML = content;
            setTimeout(() => {
                setupFormCompras();
                mostrarTablaCompras();
            }, 100);
            break;
            
        case 'salida-ventas':
    content = `
        <h2><i class="fas fa-arrow-up"></i> Salida de Ventas</h2>
        <form id="formVentas" class="form-module">
            <div class="form-row">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Cliente</label>
                    <input type="text" id="ventasCliente" placeholder="Nombre del cliente" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar"></i> Fecha</label>
                    <input type="date" id="ventasFecha" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label><i class="fas fa-user-tie"></i> Empleado que Atendió</label>
                    <input type="text" id="ventasEmpleado" placeholder="Nombre del empleado" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-box"></i> Producto</label>
                    <input type="text" id="ventasProducto" placeholder="Producto vendido" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label><i class="fas fa-hashtag"></i> Cantidad</label>
                    <input type="number" id="ventasCantidad" placeholder="Cantidad" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-dollar-sign"></i> Precio Unitario</label>
                    <input type="number" id="ventasPrecio" placeholder="Precio unitario" step="0.01" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label><i class="fas fa-calculator"></i> Total Venta</label>
                    <input type="number" id="ventasTotal" placeholder="Total" step="0.01" readonly>
                </div>
            </div>
            <button type="submit" class="btn-primary">💾 Registrar Venta</button>
        </form>
        <div id="tablaVentasContainer"></div>
    `;
    modalContent.innerHTML = content;
    setTimeout(() => {
        setupFormVentas();
        mostrarTablaVentas();
    }, 100);
    break;
            
        case 'caja-diaria':
            content = `
                <h2><i class="fas fa-cash-register"></i> Caja Diaria</h2>
                <div class="resumen-caja">
                    <div class="stat-card">
                        <h3>Total Ingresos</h3>
                        <p class="amount" id="totalIngresos">S/ 0.00</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Egresos</h3>
                        <p class="amount" id="totalEgresos">S/ 0.00</p>
                    </div>
                    <div class="stat-card">
                        <h3>Saldo Caja</h3>
                        <p class="amount" id="saldoCaja">S/ 0.00</p>
                    </div>
                </div>
                <form id="formCaja" class="form-module">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Movimiento</label>
                            <select id="cajaMovimiento" required>
                                <option value="">Seleccionar...</option>
                                <option value="ingreso">Ingreso</option>
                                <option value="egreso">Egreso</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <input type="text" id="cajaDescripcion" placeholder="Descripción del movimiento" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Monto</label>
                            <input type="number" id="cajaMonto" placeholder="Monto" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="cajaFecha" required>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">💾 Registrar Movimiento</button>
                </form>
                <div id="tablaCajaContainer"></div>
            `;
            modalContent.innerHTML = content;
            setTimeout(() => {
                setupFormCaja();
                mostrarTablaCaja();
                actualizarResumenCaja();
            }, 100);
            break;
            
        case 'ventas-personales':
            content = `
                <h2><i class="fas fa-chart-bar"></i> Ventas Personales</h2>
                <div class="stats-grid">
                    <div class="stat-box">
                        <h3>Vendedor Top</h3>
                        <p id="vendedorTop">-</p>
                    </div>
                    <div class="stat-box">
                        <h3>Total Vendido</h3>
                        <p id="totalVendidoPersonal">S/ 0.00</p>
                    </div>
                    <div class="stat-box">
                        <h3>Comisión Total</h3>
                        <p id="comisionTotal">S/ 0.00</p>
                    </div>
                </div>
                <form id="formVentasPersonales" class="form-module">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Vendedor</label>
                            <input type="text" id="vendedor" placeholder="Nombre del vendedor" required>
                        </div>
                        <div class="form-group">
                            <label>Monto Venta</label>
                            <input type="number" id="montoVenta" placeholder="Monto total" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>% Comisión</label>
                            <input type="number" id="porcentajeComision" placeholder="Porcentaje" step="0.01" value="10" required>
                        </div>
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="fechaVentaPersonal" required>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">💾 Registrar Venta</button>
                </form>
                <div id="tablaVentasPersonalesContainer"></div>
            `;
            modalContent.innerHTML = content;
            setTimeout(() => {
                setupFormVentasPersonales();
                mostrarTablaVentasPersonales();
                actualizarResumenVentasPersonales();
            }, 100);
            break;
            
        case 'productos':
            content = `
                <h2><i class="fas fa-box"></i> Catálogo de Productos</h2>
                <div class="category-tabs">
                    <button class="tab-btn active" onclick="mostrarProductosPorCategoria('computadoras')">
                        🖥️ Computadoras
                    </button>
                    <button class="tab-btn" onclick="mostrarProductosPorCategoria('laptops')">
                        💻 Laptops
                    </button>
                    <button class="tab-btn" onclick="mostrarProductosPorCategoria('perifericos')">
                        🖱️ Periféricos
                    </button>
                    <button class="tab-btn" onclick="mostrarProductosPorCategoria('software')">
                        🎨 Software
                    </button>
                </div>
                <div id="productosLista" class="productos-lista"></div>
            `;
            modalContent.innerHTML = content;
            setTimeout(() => {
                mostrarProductosPorCategoria('computadoras');
            }, 100);
            break;

        case 'devoluciones':
            mostrarFormularioDevoluciones();
            break;
    }
    
}

// ===== SETUP FORM COMPRAS =====
function setupFormCompras() {
    const form = document.getElementById('formCompras');
    const cantidadInput = document.getElementById('comprasCantidad');
    const valorInput = document.getElementById('comprasValor');
    const totalInput = document.getElementById('comprasTotal');
    const fechaInput = document.getElementById('comprasFecha');
    
    // Establecer fecha actual
    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
    }
    
    // Calcular total automáticamente
    cantidadInput.addEventListener('input', calcularTotalCompras);
    valorInput.addEventListener('input', calcularTotalCompras);
    
    function calcularTotalCompras() {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const valor = parseFloat(valorInput.value) || 0;
        totalInput.value = (cantidad * valor).toFixed(2);
    }
    
    // Enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // ✅ VALIDAR FECHA
        const fechaCompra = document.getElementById('comprasFecha').value;
        if (!validarFechaDelMes(fechaCompra)) {
            showNotification(`❌ La fecha debe ser del mes actual: ${obtenerMesActual()}`);
            return;
        }

        const nuevaCompra = {
            id: Date.now(),
            proveedor: document.getElementById('comprasProveedor').value,
            fecha: fechaCompra,
            producto: document.getElementById('comprasProducto').value,
            serie: document.getElementById('comprasSerie').value,  // ← NUEVA LÍNEA
            cantidad: parseInt(document.getElementById('comprasCantidad').value),
            valorUnitario: parseFloat(document.getElementById('comprasValor').value),
            total: parseFloat(document.getElementById('comprasTotal').value)
        };
        
        compras.push(nuevaCompra);
        saveComprasToStorage();
        
        form.reset();
        fechaInput.valueAsDate = new Date();
        totalInput.value = '0.00';
        mostrarTablaCompras();
        showNotification('✅ Compra registrada exitosamente');
    });
}

// ===== MOSTRAR TABLA COMPRAS =====
function mostrarTablaCompras() {
    const container = document.getElementById('tablaComprasContainer');
    
    if (compras.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 2rem;">No hay compras registradas</p>';
        return;
    }
    
    let html = `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #1a1a1a;">📋 Historial de Compras</h3>
        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>Proveedor</th>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Nº Serie</th>
                    <th>Cantidad</th>
                    <th>V. Unitario</th>
                    <th>Total</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    compras.forEach(compra => {
        html += `
            <tr>
                <td>${compra.proveedor}</td>
                <td>${compra.fecha}</td>
                <td>${compra.producto}</td>
                <td style="font-family: monospace; font-weight: 600; color: #00bcd4;">${compra.serie || '—'}</td>
                <td>${compra.cantidad}</td>
                <td>S/ ${compra.valorUnitario.toFixed(2)}</td>
                <td style="font-weight: bold; color: #00bcd4;">S/ ${compra.total.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" onclick="eliminarCompra(${compra.id})" style="font-size: 0.8rem; padding: 0.4rem 0.6rem;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== ELIMINAR COMPRA =====
function eliminarCompra(id) {
    if (confirm('¿Deseas eliminar esta compra?')) {
        compras = compras.filter(c => c.id !== id);
        saveComprasToStorage();
        mostrarTablaCompras();
        showNotification('❌ Compra eliminada');
    }
}


// ===== SETUP FORM VENTAS =====
function setupFormVentas() {
    const form = document.getElementById('formVentas');
    const cantidadInput = document.getElementById('ventasCantidad');
    const precioInput = document.getElementById('ventasPrecio');
    const totalInput = document.getElementById('ventasTotal');
    const fechaInput = document.getElementById('ventasFecha');
    
    // Establecer fecha actual
    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
    }
    
    cantidadInput.addEventListener('input', calcularTotalVentas);
    precioInput.addEventListener('input', calcularTotalVentas);
    
    function calcularTotalVentas() {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precio = parseFloat(precioInput.value) || 0;
        totalInput.value = (cantidad * precio).toFixed(2);
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // ✅ VALIDAR FECHA
        const fechaVenta = document.getElementById('ventasFecha').value;
        if (!validarFechaDelMes(fechaVenta)) {
            showNotification(`❌ La fecha debe ser del mes actual: ${obtenerMesActual()}`);
            return;
        }

        const nuevaVenta = {
            id: Date.now(),
            cliente: document.getElementById('ventasCliente').value,
            empleado: document.getElementById('ventasEmpleado').value,  // ← NUEVA LÍNEA
            fecha: fechaVenta,
            producto: document.getElementById('ventasProducto').value,
            cantidad: parseInt(document.getElementById('ventasCantidad').value),
            precioUnitario: parseFloat(document.getElementById('ventasPrecio').value),
            total: parseFloat(document.getElementById('ventasTotal').value)
        };
        
        ventas.push(nuevaVenta);
        saveVentasToStorage();
        
        form.reset();
        fechaInput.valueAsDate = new Date();
        totalInput.value = '0.00';
        mostrarTablaVentas();
        showNotification('✅ Venta registrada exitosamente');
    });
}

// ===== MOSTRAR TABLA VENTAS =====
function mostrarTablaVentas() {
    const container = document.getElementById('tablaVentasContainer');
    
    if (ventas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 2rem;">No hay ventas registradas</p>';
        return;
    }
    
    let html = `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #1a1a1a;">📋 Historial de Ventas</h3>
        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    ventas.forEach(venta => {
        html += `
            <tr>
                <td>${venta.cliente}</td>
                <td><strong style="color: #00bcd4;">${venta.empleado || '—'}</strong></td>
                <td>${venta.fecha}</td>
                <td>${venta.producto}</td>
                <td>${venta.cantidad}</td>
                <td>S/ ${venta.precioUnitario.toFixed(2)}</td>
                <td style="font-weight: bold; color: #00bcd4;">S/ ${venta.total.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" onclick="eliminarVenta(${venta.id})" style="font-size: 0.8rem; padding: 0.4rem 0.6rem;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== ELIMINAR VENTA =====
function eliminarVenta(id) {
    if (confirm('¿Deseas eliminar esta venta?')) {
        ventas = ventas.filter(v => v.id !== id);
        saveVentasToStorage();
        mostrarTablaVentas();
        showNotification('❌ Venta eliminada');
    }
}

// ===== SETUP FORM CAJA =====
function setupFormCaja() {
    const form = document.getElementById('formCaja');
    const fechaInput = document.getElementById('cajaFecha');
    
    // Establecer fecha actual
    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // ✅ VALIDAR FECHA
const fechaCaja = document.getElementById('cajaFecha').value;
if (!validarFechaDelMes(fechaCaja)) {
    showNotification(`❌ La fecha debe ser del mes actual: ${obtenerMesActual()}`);
    return;
}

const nuevoMovimiento = {
    id: Date.now(),
    tipo: document.getElementById('cajaMovimiento').value,
    descripcion: document.getElementById('cajaDescripcion').value,
    monto: parseFloat(document.getElementById('cajaMonto').value),
    fecha: fechaCaja
};
        
        cajaMovimientos.push(nuevoMovimiento);
        saveCajaToStorage();
        
        form.reset();
        fechaInput.valueAsDate = new Date();
        mostrarTablaCaja();
        actualizarResumenCaja();
        showNotification('✅ Movimiento registrado exitosamente');
    });
}

// ===== ACTUALIZAR RESUMEN CAJA =====
function actualizarResumenCaja() {
    let totalIngresos = 0;
    let totalEgresos = 0;
    
    cajaMovimientos.forEach(mov => {
        if (mov.tipo === 'ingreso') {
            totalIngresos += mov.monto;
        } else {
            totalEgresos += mov.monto;
        }
    });
    
    const saldo = totalIngresos - totalEgresos;
    
    document.getElementById('totalIngresos').textContent = 'S/ ' + totalIngresos.toFixed(2);
    document.getElementById('totalEgresos').textContent = 'S/ ' + totalEgresos.toFixed(2);
    document.getElementById('saldoCaja').textContent = 'S/ ' + saldo.toFixed(2);
}

// ===== MOSTRAR TABLA CAJA =====
function mostrarTablaCaja() {
    const container = document.getElementById('tablaCajaContainer');
    
    if (cajaMovimientos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 2rem;">No hay movimientos registrados</p>';
        return;
    }
    
    let html = `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #1a1a1a;">📋 Historial de Movimientos</h3>
        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    cajaMovimientos.forEach(mov => {
        const colorMonto = mov.tipo === 'ingreso' ? '#4CAF50' : '#ff6b6b';
        const signo = mov.tipo === 'ingreso' ? '+' : '-';
        
        html += `
            <tr>
                <td><strong>${mov.tipo === 'ingreso' ? '📥 Ingreso' : '📤 Egreso'}</strong></td>
                <td>${mov.descripcion}</td>
                <td style="font-weight: bold; color: ${colorMonto};">${signo}S/ ${mov.monto.toFixed(2)}</td>
                <td>${mov.fecha}</td>
                <td>
                    <button class="remove-btn" onclick="eliminarMovimiento(${mov.id})" style="font-size: 0.8rem; padding: 0.4rem 0.6rem;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== ELIMINAR MOVIMIENTO =====
function eliminarMovimiento(id) {
    if (confirm('¿Deseas eliminar este movimiento?')) {
        cajaMovimientos = cajaMovimientos.filter(m => m.id !== id);
        saveCajaToStorage();
        mostrarTablaCaja();
        actualizarResumenCaja();
        showNotification('❌ Movimiento eliminado');
    }
}

// ===== SETUP FORM VENTAS PERSONALES =====
function setupFormVentasPersonales() {
    const form = document.getElementById('formVentasPersonales');
    const fechaInput = document.getElementById('fechaVentaPersonal');
    
    // Establecer fecha actual
    if (fechaInput) {
        fechaInput.valueAsDate = new Date();
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const monto = parseFloat(document.getElementById('montoVenta').value);
        const porcentaje = parseFloat(document.getElementById('porcentajeComision').value);
        const comision = (monto * porcentaje) / 100;
        
        // ✅ VALIDAR FECHA
const fechaVentaPersonal = document.getElementById('fechaVentaPersonal').value;
if (!validarFechaDelMes(fechaVentaPersonal)) {
    showNotification(`❌ La fecha debe ser del mes actual: ${obtenerMesActual()}`);
    return;
}

const nuevaVentaPersonal = {
    id: Date.now(),
    vendedor: document.getElementById('vendedor').value,
    monto: monto,
    porcentaje: porcentaje,
    comision: comision,
    fecha: fechaVentaPersonal
};
        
        ventasPersonales.push(nuevaVentaPersonal);
        saveVentasPersonalesFromStorage();
        
        form.reset();
        document.getElementById('porcentajeComision').value = '10';
        fechaInput.valueAsDate = new Date();
        mostrarTablaVentasPersonales();
        actualizarResumenVentasPersonales();
        showNotification('✅ Venta personal registrada exitosamente');
    });
}

// ===== ACTUALIZAR RESUMEN VENTAS PERSONALES =====
function actualizarResumenVentasPersonales() {
    let totalVendido = 0;
    let comisionTotal = 0;
    let vendedorTop = '';
    let ventasVendedor = {};
    
    ventasPersonales.forEach(vp => {
        totalVendido += vp.monto;
        comisionTotal += vp.comision;
        
        if (!ventasVendedor[vp.vendedor]) {
            ventasVendedor[vp.vendedor] = 0;
        }
        ventasVendedor[vp.vendedor] += vp.monto;
    });
    
    if (Object.keys(ventasVendedor).length > 0) {
        vendedorTop = Object.keys(ventasVendedor).reduce((a, b) => 
            ventasVendedor[a] > ventasVendedor[b] ? a : b
        );
    }
    
    document.getElementById('vendedorTop').textContent = vendedorTop || '-';
    document.getElementById('totalVendidoPersonal').textContent = 'S/ ' + totalVendido.toFixed(2);
    document.getElementById('comisionTotal').textContent = 'S/ ' + comisionTotal.toFixed(2);
}

// ===== MOSTRAR TABLA VENTAS PERSONALES =====
function mostrarTablaVentasPersonales() {
    const container = document.getElementById('tablaVentasPersonalesContainer');
    
    if (ventasPersonales.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 2rem;">No hay ventas personales registradas</p>';
        return;
    }
    
    let html = `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #1a1a1a;">📋 Desempeño de Vendedores</h3>
        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>Vendedor</th>
                    <th>Monto Venta</th>
                    <th>% Comisión</th>
                    <th>Comisión Ganada</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    ventasPersonales.forEach(vp => {
        html += `
            <tr>
                <td><strong>${vp.vendedor}</strong></td>
                <td>S/ ${vp.monto.toFixed(2)}</td>
                <td>${vp.porcentaje}%</td>
                <td style="font-weight: bold; color: #4CAF50;">S/ ${vp.comision.toFixed(2)}</td>
                <td>${vp.fecha}</td>
                <td>
                    <button class="remove-btn" onclick="eliminarVentaPersonal(${vp.id})" style="font-size: 0.8rem; padding: 0.4rem 0.6rem;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== ELIMINAR VENTA PERSONAL =====
function eliminarVentaPersonal(id) {
    if (confirm('¿Deseas eliminar esta venta personal?')) {
        ventasPersonales = ventasPersonales.filter(vp => vp.id !== id);
        saveVentasPersonalesFromStorage();
        mostrarTablaVentasPersonales();
        actualizarResumenVentasPersonales();
        showNotification('❌ Venta personal eliminada');
    }
}

function mostrarProductosPorCategoria(categoria) {
    // Actualizar botones activos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Encontrar y marcar el botón clickeado
    const botones = document.querySelectorAll('.tab-btn');
    botones.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(categoria.toLowerCase()) || 
            btn.onclick.toString().includes(categoria)) {
            btn.classList.add('active');
        }
    });
    
    const productos = productosVariados[categoria] || [];
    let html = `
        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Precio</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    productos.forEach(prod => {
        html += `
            <tr>
                <td><strong>${prod.nombre}</strong></td>
                <td>${prod.marca}</td>
                <td>${prod.modelo}</td>
                <td style="color: #00bcd4; font-weight: bold;">S/ ${prod.precio.toFixed(2)}</td>
                <td>${prod.descripcion}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    document.getElementById('productosLista').innerHTML = html;
}

function closeModule() {
    document.getElementById('moduleModal').classList.remove('active');
}

// ===== NAVEGAR A DETALLE DEL PRODUCTO =====
function goToProductDetail(productId) {
    sessionStorage.setItem('selectedProductId', productId);
    window.location.href = 'product-detail.html';
}

// ===== MOSTRAR DETALLE DEL PRODUCTO / CATEGORÍA =====
function showProductDetail(product) {
    const modalContent = document.getElementById('modalContent');
    const categoria = product.category;
    const categoriaFormato = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    
    modalContent.innerHTML = `
        <h2><i class="fas fa-box"></i> Categoría: ${categoriaFormato}</h2>
        <div class="category-tabs">
            <button class="tab-btn active" onclick="mostrarProductosPorCategoria('computadoras')">
                🖥️ Computadoras
            </button>
            <button class="tab-btn" onclick="mostrarProductosPorCategoria('laptops')">
                💻 Laptops
            </button>
            <button class="tab-btn" onclick="mostrarProductosPorCategoria('perifericos')">
                🖱️ Periféricos
            </button>
            <button class="tab-btn" onclick="mostrarProductosPorCategoria('software')">
                🎨 Software
            </button>
        </div>
        <div id="productosLista" class="productos-lista"></div>
    `;
    
    mostrarProductosPorCategoria(categoria);
    document.getElementById('moduleModal').classList.add('active');
}

// ===== INTEGRACIÓN DEL MÓDULO SERVICIO TÉCNICO =====

// Cuando se carga el módulo, actualizar los módulos disponibles
const modulosConServicio = [
    {
        id: 'servicio-tecnico',
        icon: 'fa-tools',
        title: 'Servicio Técnico',
        desc: 'Registra y consulta reparaciones'
    }
];

// Agregar al menú si el usuario es técnico
function actualizarModulosConServicio() {
    if (currentUser && currentUser.nivel === 'tecnico') {
        const modulesGrid = document.getElementById('modulesGrid');
        if (modulesGrid) {
            const moduloHTML = `
                <div class="module-card" onclick="mostrarServicioTecnico()">
                    <div class="module-icon">
                        <i class="fas fa-tools"></i>
                    </div>
                    <h3>Servicio Técnico</h3>
                    <p>Registra y consulta reparaciones</p>
                </div>
            `;
            // Agregar después de productos
            const lastCard = modulesGrid.lastElementChild;
            if (lastCard) {
                lastCard.insertAdjacentHTML('afterend', moduloHTML);
            }
        }
    }
}


// Llamar cuando se actualiza el usuario
document.addEventListener('usuarioActualizado', actualizarModulosConServicio);

// ===== INICIALIZAR MÓDULO SERVICIO TÉCNICO =====
function mostrarServicioTecnico() {
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2><i class="fas fa-tools"></i> Servicio Técnico</h2>
        
        <div class="servicio-tabs">
            <button class="tab-btn active" onclick="mostrarTabRegistro()">
                <i class="fas fa-plus-circle"></i> Registrar Servicio
            </button>
            <button class="tab-btn" onclick="mostrarTabConsulta()">
                <i class="fas fa-search"></i> Consultar por DNI
            </button>
            <button class="tab-btn" onclick="mostrarTabHistorial()">
                <i class="fas fa-history"></i> Historial Completo
            </button>
        </div>

        <div id="tabContentServicio"></div>
    `;
    
    document.getElementById('moduleModal').classList.add('active');
    mostrarTabRegistro();
}

// ===== TAB: REGISTRAR SERVICIO =====
function mostrarTabRegistro() {
    const tabContent = document.getElementById('tabContentServicio');
    
    tabContent.innerHTML = `
        <div class="tab-content">
            <h3 style="color: #1a1a1a; margin-bottom: 1.5rem;">
                <i class="fas fa-plus"></i> Registrar Nuevo Servicio
            </h3>

            <form id="formRegistroServicio" class="form-module">
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Nombre del Cliente</label>
                        <input type="text" id="clienteNombre" placeholder="Nombre completo" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> DNI</label>
                        <input type="text" id="clienteDNI" placeholder="Número de DNI" required maxlength="8">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Teléfono</label>
                        <input type="tel" id="clienteTelefono" placeholder="Teléfono de contacto" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Fecha de Ingreso</label>
                        <input type="date" id="fechaIngreso" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-laptop"></i> Producto/Equipo</label>
                        <input type="text" id="nombreProducto" placeholder="Ej: Laptop Dell XPS" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Categoría</label>
                        <select id="categoriaProducto" required>
                            <option value="">Seleccionar categoría...</option>
                            <option value="PC de Escritorio">PC de Escritorio</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Impresora">Impresora</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Teclado">Teclado</option>
                            <option value="Mouse">Mouse</option>
                            <option value="Headset">Headset</option>
                            <option value="Router">Router</option>
                            <option value="Modem">Modem</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" style="grid-column: 1/-1;">
                        <label><i class="fas fa-edit"></i> Descripción del Problema</label>
                        <textarea id="descripcionProblema" placeholder="Describe el problema del equipo..." rows="4" required></textarea>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-dollar-sign"></i> Costo Estimado (S/)</label>
                        <input type="number" id="costoEstimado" placeholder="0.00" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-clock"></i> Fecha Estimada de Entrega</label>
                        <input type="date" id="fechaEstimada" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" style="grid-column: 1/-1;">
                        <label><i class="fas fa-image"></i> Fotos del Equipo (Opcional - Puedes seleccionar varias)</label>
                        <input type="file" id="fotoEquipo" accept="image/*" multiple style="padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer;">
                    </div>
                </div>

                <div id="previewFotos" style="margin-bottom: 1.5rem;"></div>

                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> Registrar Servicio
                </button>
            </form>

            <div id="mensajeRegistro" style="margin-top: 1.5rem;"></div>
        </div>
    `;

    // Setup del formulario
    setTimeout(() => {
        const form = document.getElementById('formRegistroServicio');
        const fotoInput = document.getElementById('fotoEquipo');
        const previewDiv = document.getElementById('previewFotos');
        let fotosSeleccionadas = [];

        // Preview de imágenes
        if (fotoInput) {
            fotoInput.addEventListener('change', function(e) {
                fotosSeleccionadas = Array.from(e.target.files);
                
                if (fotosSeleccionadas.length > 0) {
                    let previewHTML = `
                        <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px;">
                            <p style="margin: 0 0 1rem 0; color: #333; font-weight: 600;">
                                ✅ ${fotosSeleccionadas.length} imagen(es) cargada(s):
                            </p>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.8rem;">
                    `;
                    
                    fotosSeleccionadas.forEach((file, index) => {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            previewHTML += `
                                <div style="position: relative; border-radius: 8px; overflow: hidden; background: white;">
                                    <img src="${event.target.result}" style="width: 100%; height: 100px; object-fit: cover;">
                                    <button type="button" onclick="eliminarFotoPreview(${index})" style="position: absolute; top: 5px; right: 5px; background: #ff6b6b; color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">✕</button>
                                </div>
                            `;
                        };
                        reader.readAsDataURL(file);
                    });
                    
                    previewHTML += `
                            </div>
                        </div>
                    `;
                    previewDiv.innerHTML = previewHTML;
                } else {
                    previewDiv.innerHTML = '';
                }
            });
        }

        window.eliminarFotoPreview = function(index) {
            fotosSeleccionadas.splice(index, 1);
            fotoInput.files = crearFileList(fotosSeleccionadas);
            fotoInput.dispatchEvent(new Event('change'));
        };

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const procesarFotos = () => {
                    let fotosBase64 = [];
                    let procesadas = 0;

                    if (fotosSeleccionadas.length === 0) {
                        guardarServicio([]);
                        return;
                    }

                    fotosSeleccionadas.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            fotosBase64.push(event.target.result);
                            procesadas++;
                            
                            if (procesadas === fotosSeleccionadas.length) {
                                guardarServicio(fotosBase64);
                            }
                        };
                        reader.readAsDataURL(file);
                    });
                };

                function guardarServicio(fotos) {
                    // ✅ VALIDAR FECHA DE INGRESO
const fechaIngreso = document.getElementById('fechaIngreso').value;
if (!validarFechaDelMes(fechaIngreso)) {
    showNotification(`❌ La fecha debe ser del mes actual: ${obtenerMesActual()}`);
    return;
}

const nuevoServicio = {
    id: Date.now(),
    cliente: {
        nombre: document.getElementById('clienteNombre').value,
        dni: document.getElementById('clienteDNI').value,
        telefono: document.getElementById('clienteTelefono').value
    },
    producto: {
        nombre: document.getElementById('nombreProducto').value,
        categoria: document.getElementById('categoriaProducto').value
    },
    descripcion: document.getElementById('descripcionProblema').value,
    fechaIngreso: fechaIngreso,
                        fechaEstimada: document.getElementById('fechaEstimada').value,
                        costoEstimado: parseFloat(document.getElementById('costoEstimado').value),
                        fotos: fotos,
                        estado: 'recibido',
                        fechaRegistro: new Date().toISOString().split('T')[0]
                    };

                    // Cargar servicios existentes
                    let serviciosTecnicos = [];
                    const saved = localStorage.getItem('redinnova_servicios_tecnicos');
                    if (saved) serviciosTecnicos = JSON.parse(saved);
                    
                    serviciosTecnicos.push(nuevoServicio);
                    localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));

                    // Mostrar mensaje de éxito
                    const mensajeDiv = document.getElementById('mensajeRegistro');
                    mensajeDiv.innerHTML = `
                        <div style="background: #c8e6c9; border: 2px solid #4caf50; border-radius: 8px; padding: 1rem; color: #2e7d32; text-align: center;">
                            <i class="fas fa-check-circle" style="font-size: 1.5rem; margin-right: 0.5rem;"></i>
                            <strong>¡Servicio registrado exitosamente!</strong>
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                                ID de servicio: <strong>#${nuevoServicio.id}</strong>
                            </p>
                        </div>
                    `;

                    // Limpiar formulario
                    form.reset();
                    previewDiv.innerHTML = '';
                    fotosSeleccionadas = [];
                    document.getElementById('fechaIngreso').valueAsDate = new Date();

                    setTimeout(() => {
                        mensajeDiv.innerHTML = '';
                    }, 4000);

                    showNotification('✅ Servicio registrado exitosamente');
                }

                procesarFotos();
            });
        }
    }, 100);

    // Establecer fecha actual por defecto
    setTimeout(() => {
        const fechaInput = document.getElementById('fechaIngreso');
        if (fechaInput) {
            fechaInput.valueAsDate = new Date();
        }
    }, 50);
}

// Función auxiliar para crear FileList
function crearFileList(files) {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
}

// ===== TAB: CONSULTAR POR DNI =====
function mostrarTabConsulta() {
    const tabContent = document.getElementById('tabContentServicio');
    
    tabContent.innerHTML = `
        <div class="tab-content">
            <h3 style="color: #1a1a1a; margin-bottom: 1.5rem;">
                <i class="fas fa-search"></i> Consultar Estado de Servicio
            </h3>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label><i class="fas fa-id-card"></i> Ingresa tu DNI para consultar tu servicio</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="dniConsulta" placeholder="Número de DNI" maxlength="8" style="flex: 1; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                    <button onclick="buscarPorDNI()" class="btn-primary" style="flex: 0; white-space: nowrap;">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
            </div>

            <div id="resultadosConsulta" style="margin-top: 1.5rem;"></div>
        </div>
    `;

    // Permitir buscar con Enter
    setTimeout(() => {
        const input = document.getElementById('dniConsulta');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    buscarPorDNI();
                }
            });
            input.focus();
        }
    }, 100);
}

// ===== FUNCIÓN: BUSCAR POR DNI =====
function buscarPorDNI() {
    const dni = document.getElementById('dniConsulta').value.trim();
    const resultadosDiv = document.getElementById('resultadosConsulta');

    if (!dni) {
        resultadosDiv.innerHTML = `
            <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px; padding: 1rem; color: #e65100; text-align: center;">
                <i class="fas fa-info-circle"></i> Por favor ingresa tu DNI
            </div>
        `;
        return;
    }

    let serviciosTecnicos = [];
    const saved = localStorage.getItem('redinnova_servicios_tecnicos');
    if (saved) serviciosTecnicos = JSON.parse(saved);

    const serviciosEncontrados = serviciosTecnicos.filter(s => s.cliente.dni === dni);

    if (serviciosEncontrados.length === 0) {
        resultadosDiv.innerHTML = `
            <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 8px; padding: 1rem; color: #c62828; text-align: center;">
                <i class="fas fa-times-circle"></i> No se encontraron servicios para el DNI: <strong>${dni}</strong>
            </div>
        `;
        return;
    }

    const estadosServicio = [
        { id: 'recibido', name: 'Recibido', color: '#2196F3', icon: '📥' },
        { id: 'diagnostico', name: 'Diagnóstico', color: '#FF9800', icon: '🔍' },
        { id: 'reparacion', name: 'En Reparación', color: '#FF5722', icon: '🔧' },
        { id: 'completado', name: 'Completado', color: '#8BC34A', icon: '✓' },
        { id: 'entregado', name: 'Entregado', color: '#4CAF50', icon: '✅' }
    ];

    let html = `<h4 style="color: #1a1a1a; margin-bottom: 1rem;">Se encontraron ${serviciosEncontrados.length} servicio(s):</h4>`;
    html += '<div class="resultados-consulta">';

    serviciosEncontrados.forEach(servicio => {
        const estado = estadosServicio.find(e => e.id === servicio.estado);


        // Galería de fotos
        let galeriaHTML = '';
        if (servicio.fotos && servicio.fotos.length > 0) {
            galeriaHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <p style="margin: 0 0 0.8rem 0; font-weight: 600; color: #1a1a1a;">
                        <i class="fas fa-images"></i> Fotos del Equipo (${servicio.fotos.length})
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.8rem;">
                        ${servicio.fotos.map((foto, index) => `
                            <div style="position: relative; cursor: pointer; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
                                <img src="${foto}" style="width: 100%; height: 80px; object-fit: cover;" onclick="abrirGaleriaFotos(${servicio.id}, ${index})">
                                <div style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">
                                    ${index + 1}/${servicio.fotos.length}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `
            <div class="servicio-card" style="border-left: 4px solid ${estado.color}; background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="margin: 0 0 0.3rem 0; color: #1a1a1a; font-size: 1.1rem;">
                            ID: #${servicio.id}
                        </h4>
                        <p style="margin: 0; color: #666; font-size: 0.85rem;">
                            Registrado: ${servicio.fechaRegistro}
                        </p>
                    </div>
                    <div style="background: ${estado.color}; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-align: center;">
                        <div style="font-size: 1.5rem;">${estado.icon}</div>
                        <div style="font-weight: 600; font-size: 0.85rem;">${estado.name}</div>
                    </div>
                </div>

                ${galeriaHTML}

                ${servicio.fotos && servicio.fotos.length > 0 ? `
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                        <button onclick="agregarMasFotosServicio(${servicio.id})" style="flex: 1; background: #00bcd4; color: white; border: none; padding: 0.8rem; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-plus"></i> Agregar Más Fotos
                        </button>
                        <button onclick="reemplazarTodasFotosServicio(${servicio.id})" style="flex: 1; background: #ff9800; color: white; border: none; padding: 0.8rem; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-sync"></i> Reemplazar Todas
                        </button>
                    </div>
                ` : `
                    <div style="margin-bottom: 1.5rem;">
                        <button onclick="agregarMasFotosServicio(${servicio.id})" style="width: 100%; background: #f5f5f5; color: #666; border: 2px dashed #ddd; padding: 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-camera"></i> Agregar Fotos
                        </button>
                    </div>
                `}

                <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">
                                <i class="fas fa-laptop" style="color: #00bcd4; margin-right: 0.5rem;"></i>
                                <strong>Equipo:</strong>
                            </p>
                            <p style="margin: 0; color: #1a1a1a; font-weight: 600;">${servicio.producto.nombre}</p>
                        </div>
                        
                        <div>
                            <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">
                                <i class="fas fa-tag" style="color: #ff9800; margin-right: 0.5rem;"></i>
                                <strong>Categoría:</strong>
                            </p>
                            <p style="margin: 0; color: #1a1a1a; font-weight: 600;">${servicio.producto.categoria}</p>
                        </div>

                        <div style="grid-column: 1/-1;">
                            <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">
                                <i class="fas fa-clipboard" style="color: #4caf50; margin-right: 0.5rem;"></i>
                                <strong>Problema:</strong>
                            </p>
                            <p style="margin: 0; color: #1a1a1a; line-height: 1.5;">${servicio.descripcion}</p>
                        </div>

                        <div>
                            <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">
                                <i class="fas fa-dollar-sign" style="color: #4caf50; margin-right: 0.5rem;"></i>
                                <strong>Costo Estimado:</strong>
                            </p>
                            <p style="margin: 0; color: #4caf50; font-weight: 700; font-size: 1.1rem;">S/ ${servicio.costoEstimado.toFixed(2)}</p>
                        </div>

                        <div>
                            <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">
                                <i class="fas fa-calendar" style="color: #2196f3; margin-right: 0.5rem;"></i>
                                <strong>Entrega Estimada:</strong>
                            </p>
                            <p style="margin: 0; color: #1a1a1a; font-weight: 600;">${servicio.fechaEstimada}</p>
                        </div>
                    </div>
                </div>
<div style="margin-bottom: 1rem;">
                    <button onclick="editarDescripcion(${servicio.id})" style="width: 100%; background: #2196F3; color: white; border: none; padding: 0.8rem; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-edit"></i> Editar Descripción
                    </button>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a href="https://www.facebook.com/p/Red-innova-sac-100064703783715/" target="_blank" style="background: #1877F2; color: white; flex: 1; padding: 0.7rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; font-size: 0.9rem;">
                        <i class="fab fa-facebook"></i> Facebook
                    </a>
                    <a href="https://www.instagram.com" target="_blank" style="background: #E4405F; color: white; flex: 1; padding: 0.7rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; font-size: 0.9rem;">
                        <i class="fab fa-instagram"></i> Instagram
                    </a>
                    <a href="https://www.tiktok.com" target="_blank" style="background: #000000; color: white; flex: 1; padding: 0.7rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; font-size: 0.9rem;">
                        <i class="fab fa-tiktok"></i> TikTok
                    </a>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultadosDiv.innerHTML = html;
}

// ===== ABRIR GALERÍA FULLSCREEN =====
function abrirGaleriaFotos(servicioId, indexInicial = 0) {
    let serviciosTecnicos = [];
    const saved = localStorage.getItem('redinnova_servicios_tecnicos');
    if (saved) serviciosTecnicos = JSON.parse(saved);

    const servicio = serviciosTecnicos.find(s => s.id === servicioId);
    if (!servicio || !servicio.fotos || servicio.fotos.length === 0) return;

    let currentIndex = indexInicial;

    const modalHTML = `
        <div class="galeria-modal" id="galeriaModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000;">
            
            <!-- Botón Cerrar -->
            <button onclick="cerrarGaleria()" style="position: absolute; top: 20px; right: 20px; background: white; color: black; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; z-index: 10001;">
                ✕
            </button>

            <!-- Imagen Principal -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; max-height: 80vh; overflow: hidden;">
                <img id="fotoGaleria" src="" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;">
            </div>

            <!-- Controles -->
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;">
                <button onclick="cambiarFotoGaleria(-1)" style="background: #00bcd4; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>

                <div style="color: white; font-weight: 600; min-width: 80px; text-align: center; font-size: 1.1rem;">
                    <span id="fotoIndex">1</span>/<span id="fotoTotal">1</span>
                </div>

                <button onclick="cambiarFotoGaleria(1)" style="background: #00bcd4; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>

            <!-- Botones de Acción -->
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;">
                <button onclick="eliminarFotoGaleria(${servicioId})" style="background: #f44336; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-trash"></i> Eliminar Esta Foto
                </button>
                <button onclick="agregarMasFotosServicio(${servicioId})" style="background: #4caf50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-plus"></i> Agregar Más
                </button>
            </div>

            <!-- Miniaturas -->
            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; overflow-x: auto; padding: 0 1rem; max-width: 90%;">
                ${servicio.fotos.map((foto, index) => `
                    <img src="${foto}" onclick="cambiarFotoGaleriaPorIndex(${index})" style="width: 70px; height: 70px; object-fit: cover; border: ${index === currentIndex ? '3px solid #00bcd4' : '2px solid #666'}; border-radius: 6px; cursor: pointer; opacity: ${index === currentIndex ? '1' : '0.6'}; transition: all 0.2s;">
                `).join('')}
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Guardar referencias globales
    window.currentFotoIndex = currentIndex;
    window.servicioIdActual = servicioId;
    window.fotosActuales = servicio.fotos;

    actualizarGaleria();

    // Permitir cerrar con ESC
    document.addEventListener('keydown', cerrarGaleriaConESC);
}

function actualizarGaleria() {
    const foto = document.getElementById('fotoGaleria');
    const index = document.getElementById('fotoIndex');
    const total = document.getElementById('fotoTotal');

    if (foto && window.fotosActuales) {
        foto.src = window.fotosActuales[window.currentFotoIndex];
        index.textContent = window.currentFotoIndex + 1;
        total.textContent = window.fotosActuales.length;
    }
}

function cambiarFotoGaleria(direccion) {
    window.currentFotoIndex += direccion;

    if (window.currentFotoIndex < 0) {
        window.currentFotoIndex = window.fotosActuales.length - 1;
    } else if (window.currentFotoIndex >= window.fotosActuales.length) {
        window.currentFotoIndex = 0;
    }

    actualizarGaleria();
}

function cambiarFotoGaleriaPorIndex(index) {
    window.currentFotoIndex = index;
    actualizarGaleria();
}

function eliminarFotoGaleria(servicioId) {
    if (confirm('⚠️ ¿Estás seguro de que deseas eliminar esta foto?')) {
        let serviciosTecnicos = [];
        const saved = localStorage.getItem('redinnova_servicios_tecnicos');
        if (saved) serviciosTecnicos = JSON.parse(saved);

        const servicio = serviciosTecnicos.find(s => s.id === servicioId);
        if (servicio && servicio.fotos) {
            servicio.fotos.splice(window.currentFotoIndex, 1);

            if (servicio.fotos.length === 0) {
                delete servicio.fotos;
            } else if (window.currentFotoIndex >= servicio.fotos.length) {
                window.currentFotoIndex = servicio.fotos.length - 1;
            }

            localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
            cerrarGaleria();
            buscarPorDNI();
            showNotification('✅ Foto eliminada exitosamente');
        }
    }
}

function cerrarGaleria() {
    const modal = document.getElementById('galeriaModal');
    if (modal) modal.remove();
    document.removeEventListener('keydown', cerrarGaleriaConESC);
}

function cerrarGaleriaConESC(e) {
    if (e.key === 'Escape') {
        cerrarGaleria();
    }
}

// ===== TAB: HISTORIAL COMPLETO =====
function mostrarTabHistorial() {
    const tabContent = document.getElementById('tabContentServicio');
    
    let serviciosTecnicos = [];
    const saved = localStorage.getItem('redinnova_servicios_tecnicos');
    if (saved) serviciosTecnicos = JSON.parse(saved);

    if (serviciosTecnicos.length === 0) {
        tabContent.innerHTML = `
            <div class="tab-content">
                <p style="text-align: center; color: #999; padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No hay servicios registrados aún
                </p>
            </div>
        `;
        return;
        
    }

    const estadosServicio = [
        { id: 'recibido', name: 'Recibido', color: '#2196F3', icon: '📥' },
        { id: 'diagnostico', name: 'Diagnóstico', color: '#FF9800', icon: '🔍' },
        { id: 'reparacion', name: 'En Reparación', color: '#FF5722', icon: '🔧' },
        { id: 'completado', name: 'Completado', color: '#8BC34A', icon: '✓' },
        { id: 'entregado', name: 'Entregado', color: '#4CAF50', icon: '✅' }
    ];

    let html = `
        <div class="tab-content">
            <h3 style="color: #1a1a1a; margin-bottom: 1.5rem;">
                <i class="fas fa-history"></i> Historial de Servicios (${serviciosTecnicos.length})
            </h3>

            <table class="tabla-productos" style="width: 100%; margin-top: 1rem;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>DNI</th>
                        <th>Equipo</th>
                        <th>Categoría</th>
                        <th>Entrada</th>
                        <th>Estado</th>
                        <th>Costo</th>
                        <th>Fotos</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    serviciosTecnicos.forEach(servicio => {
        const estado = estadosServicio.find(e => e.id === servicio.estado);
        const fotosCount = servicio.fotos ? servicio.fotos.length : 0;
        
        html += `
            <tr>
                <td style="font-weight: bold; color: #00bcd4;">
                    #${servicio.id.toString().slice(-6)}
                </td>
                <td>${servicio.cliente.nombre}</td>
                <td style="font-weight: 600;">${servicio.cliente.dni}</td>
                <td>${servicio.producto.nombre}</td>
                <td>${servicio.producto.categoria}</td>
                <td>${servicio.fechaIngreso}</td>
                <td>
                    <span style="background: ${estado.color}; color: white; padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                        ${estado.icon} ${estado.name}
                    </span>
                </td>
                <td style="font-weight: bold; color: #4CAF50;">S/ ${servicio.costoEstimado.toFixed(2)}</td>
                <td style="text-align: center; font-weight: 600; color: #00bcd4;">
                    ${fotosCount > 0 ? `🖼️ ${fotosCount}` : '—'}
                </td>
                <td style="display: flex; gap: 0.3rem;">
                    <button onclick="cambiarEstadoServicio(${servicio.id})" style="background: #00bcd4; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; flex: 1;">
                        📊 Cambiar
                    </button>
                    <button onclick="eliminarServicioTecnico(${servicio.id})" style="background: #ff6b6b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    tabContent.innerHTML = html;
}
// ===== AGREGAR MÁS FOTOS =====
function agregarMasFotosServicio(servicioId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            let serviciosTecnicos = [];
            const saved = localStorage.getItem('redinnova_servicios_tecnicos');
            if (saved) serviciosTecnicos = JSON.parse(saved);

            const servicio = serviciosTecnicos.find(s => s.id === servicioId);
            if (servicio) {
                if (!servicio.fotos) servicio.fotos = [];

                let cargadas = 0;
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        servicio.fotos.push(event.target.result);
                        cargadas++;

                        if (cargadas === files.length) {
                            localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
                            cerrarGaleria();
                            buscarPorDNI();
                            showNotification(`✅ ${cargadas} foto(s) añadida(s) exitosamente`);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    });

    input.click();
}

// ===== REEMPLAZAR TODAS LAS FOTOS =====
function reemplazarTodasFotosServicio(servicioId) {
    if (confirm('⚠️ ¿Estás seguro? Esto borrará TODAS las fotos actuales y las reemplazará por las nuevas.')) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                let serviciosTecnicos = [];
                const saved = localStorage.getItem('redinnova_servicios_tecnicos');
                if (saved) serviciosTecnicos = JSON.parse(saved);

                const servicio = serviciosTecnicos.find(s => s.id === servicioId);
                if (servicio) {
                    servicio.fotos = [];

                    let cargadas = 0;
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            servicio.fotos.push(event.target.result);
                            cargadas++;

                            if (cargadas === files.length) {
                                localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
                                cerrarGaleria();
                                buscarPorDNI();
                                showNotification(`✅ ${cargadas} foto(s) cargada(s). Anteriores eliminadas.`);
                            }
                        };
                        reader.readAsDataURL(file);
                    });
                }
            }
        });

        input.click();
    }
}

// ===== EDITAR DESCRIPCIÓN =====
function editarDescripcion(servicioId) {
    let serviciosTecnicos = JSON.parse(localStorage.getItem('redinnova_servicios_tecnicos')) || [];
    const servicio = serviciosTecnicos.find(s => s.id === servicioId);
    if (!servicio) return;

    const nuevaDescripcion = prompt('✏️ Editar Descripción:\n\n' + servicio.descripcion);
    
    if (nuevaDescripcion !== null && nuevaDescripcion.trim() !== '') {
        servicio.descripcion = nuevaDescripcion.trim();
        localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
        buscarPorDNI();
        showNotification('✅ Descripción actualizada exitosamente');
    }
}

// ===== CAMBIAR ESTADO DEL SERVICIO =====
function cambiarEstadoServicio(servicioId) {
    const estadosServicio = [
        { id: 'recibido', name: 'Recibido' },
        { id: 'diagnostico', name: 'Diagnóstico' },
        { id: 'reparacion', name: 'En Reparación' },
        { id: 'completado', name: 'Completado' },
        { id: 'entregado', name: 'Entregado' }
    ];

    let serviciosTecnicos = [];
    const saved = localStorage.getItem('redinnova_servicios_tecnicos');
    if (saved) serviciosTecnicos = JSON.parse(saved);

    const servicio = serviciosTecnicos.find(s => s.id === servicioId);
    if (!servicio) return;

    // Encontrar el índice del estado actual
    const estadoActual = estadosServicio.findIndex(e => e.id === servicio.estado);
    
    // Ir al siguiente estado (o volver al primero si es el último)
    const siguienteEstado = estadoActual < estadosServicio.length - 1 ? estadoActual + 1 : 0;
    
    servicio.estado = estadosServicio[siguienteEstado].id;
    localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
    
    mostrarTabHistorial();
    showNotification(`✅ Estado actualizado a: ${estadosServicio[siguienteEstado].name}`);
}

// ===== ELIMINAR SERVICIO TÉCNICO =====
function eliminarServicioTecnico(servicioId) {
    if (confirm('⚠️ ¿Estás seguro de que deseas eliminar este servicio?')) {
        let serviciosTecnicos = [];
        const saved = localStorage.getItem('redinnova_servicios_tecnicos');
        if (saved) serviciosTecnicos = JSON.parse(saved);

        serviciosTecnicos = serviciosTecnicos.filter(s => s.id !== servicioId);
        localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
        
        mostrarTabHistorial();
        showNotification('❌ Servicio eliminado exitosamente');
    }
}

// ===== VALIDAR FECHA - DEBE SER DEL MES ACTUAL =====
function validarFechaDelMes(fechaString) {
    const fecha = new Date(fechaString);
    const hoy = new Date();
    
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    const mesFecha = fecha.getMonth();
    const añoFecha = fecha.getFullYear();
    
    return mesFecha === mesActual && añoFecha === añoActual;
}

function obtenerMesActual() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const hoy = new Date();
    return meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

// ===== VARIABLES GLOBALES DEVOLUCIONES =====
let devoluciones = [];

// Cargar datos del localStorage
function cargarDevolucionesLocal() {
    const devSaved = localStorage.getItem('redinnova_devoluciones');
    if (devSaved) {
        try {
            devoluciones = JSON.parse(devSaved);
        } catch (e) {
            console.error('Error al cargar devoluciones:', e);
            devoluciones = [];
        }
    }
}

function guardarDevolucionesLocal() {
    localStorage.setItem('redinnova_devoluciones', JSON.stringify(devoluciones));
}

// ===== MÓDULO DEVOLUCIONES =====
function mostrarFormularioDevoluciones() {
    console.log('Abriendo Devoluciones...');
    const modalContent = document.getElementById('modalContent');
    
    if (!modalContent) {
        console.error('No se encontró modalContent');
        return;
    }
    
    cargarDevolucionesLocal();
    
    modalContent.innerHTML = `
        <h2><i class="fas fa-undo"></i> Devoluciones</h2>
        
        <div class="form-tabs">
            <button class="tab-btn active" onclick="mostrarFormDevolucion()">
                <i class="fas fa-plus-circle"></i> Registrar Devolución
            </button>
            <button class="tab-btn" onclick="mostrarHistorialDevoluciones()">
                <i class="fas fa-history"></i> Historial
            </button>
        </div>

        <div id="devolucionContent"></div>
    `;
    
    mostrarFormDevolucion();
}

function mostrarFormDevolucion() {
    const content = document.getElementById('devolucionContent');
    
    if (!content) {
        console.error('No se encontró devolucionContent');
        return;
    }
    
    content.innerHTML = `
        <div class="tab-content">
            <h3 style="color: #1a1a1a; margin-bottom: 1.5rem;">
                <i class="fas fa-plus"></i> Registrar Nueva Devolución
            </h3>

            <form id="formDevolucion" class="form-module">
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Nombre del Cliente</label>
                        <input type="text" id="devCliente" placeholder="Nombre completo del cliente" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Número de Teléfono</label>
                        <input type="tel" id="devTelefono" placeholder="Número de contacto" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-barcode"></i> Número de Serie del Producto</label>
                        <input type="text" id="devSerie" placeholder="Número de serie" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> Cantidad</label>
                        <input type="number" id="devCantidad" placeholder="1" min="1" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-box"></i> Nombre del Producto</label>
                        <input type="text" id="devProducto" placeholder="Nombre del producto a devolver" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-dollar-sign"></i> Monto a Devolver (S/)</label>
                        <input type="number" id="devMonto" placeholder="0.00" step="0.01" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Fecha</label>
                        <input type="date" id="devFecha" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-comment"></i> Motivo de Devolución</label>
                        <select id="devMotivo" required>
                            <option value="">Seleccionar motivo...</option>
                            <option value="Defecto">Defecto del producto</option>
                            <option value="No funciona">No funciona</option>
                            <option value="Cambio de idea">Cambio de idea</option>
                            <option value="Daño en transporte">Daño en transporte</option>
                            <option value="Producto incorrecto">Producto incorrecto</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" style="grid-column: 1/-1;">
                        <label><i class="fas fa-image"></i> Foto del Producto (Opcional)</label>
                        <input type="file" id="devFoto" accept="image/*" style="padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer;">
                    </div>
                </div>

                <div id="previewFotoDevolucion" style="margin-bottom: 1rem;"></div>

                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> Registrar Devolución
                </button>
            </form>

            <div id="mensajeDevolucion" style="margin-top: 1.5rem;"></div>
        </div>
    `;

    setTimeout(() => {
        const form = document.getElementById('formDevolucion');
        const fechaInput = document.getElementById('devFecha');
        const fotoInput = document.getElementById('devFoto');
        const previewDiv = document.getElementById('previewFotoDevolucion');
        let fotoSeleccionada = null;
        
        if (fechaInput) {
            fechaInput.valueAsDate = new Date();
        }

        // Preview de imagen
        if (fotoInput) {
            fotoInput.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        fotoSeleccionada = event.target.result;
                        previewDiv.innerHTML = `
                            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 0.8rem 0; font-weight: 600; color: #333;">✅ Foto cargada:</p>
                                <img src="${fotoSeleccionada}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover; margin-bottom: 0.5rem;">
                                <button type="button" onclick="document.getElementById('devFoto').value=''; document.getElementById('previewFotoDevolucion').innerHTML='';" style="background: #ff6b6b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                    ✕ Eliminar Foto
                                </button>
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // ✅ VALIDAR FECHA
                const fecha = document.getElementById('devFecha').value;
                if (!validarFechaDelMes(fecha)) {
                    showNotification(`❌ La fecha debe ser del mes actual: ${obtenerMesActual()}`);
                    return;
                }

                const nuevaDevolucion = {
                    id: Date.now(),
                    cliente: document.getElementById('devCliente').value,
                    telefono: document.getElementById('devTelefono').value,
                    serie: document.getElementById('devSerie').value,
                    producto: document.getElementById('devProducto').value,
                    cantidad: parseInt(document.getElementById('devCantidad').value),
                    monto: parseFloat(document.getElementById('devMonto').value),
                    fecha: fecha,
                    motivo: document.getElementById('devMotivo').value,
                    foto: fotoSeleccionada
                };

                devoluciones.push(nuevaDevolucion);
                guardarDevolucionesLocal();

                form.reset();
                fechaInput.valueAsDate = new Date();
                previewDiv.innerHTML = '';
                fotoSeleccionada = null;
                mostrarHistorialDevoluciones();
                showNotification('✅ Devolución registrada exitosamente');
            });
        }
    }, 100);
}

function mostrarHistorialDevoluciones() {
    const content = document.getElementById('devolucionContent');
    cargarDevolucionesLocal();
    
    if (devoluciones.length === 0) {
        content.innerHTML = `
            <div class="tab-content">
                <p style="text-align: center; color: #999; padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No hay devoluciones registradas
                </p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="tab-content">
            <h3 style="margin-bottom: 1rem; color: #1a1a1a;">📋 Historial de Devoluciones (${devoluciones.length})</h3>
            <div style="overflow-x: auto;">
                <table class="tabla-productos" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Teléfono</th>
                            <th>Nº Serie</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Monto</th>
                            <th>Motivo</th>
                            <th>Fecha</th>
                            <th>Foto</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    devoluciones.forEach(dev => {
        html += `
            <tr>
                <td><strong>${dev.cliente}</strong></td>
                <td style="font-family: monospace; font-weight: 600; color: #4CAF50;">${dev.telefono}</td>
                <td style="font-family: monospace; font-weight: 600; color: #00bcd4;">${dev.serie}</td>
                <td>${dev.producto}</td>
                <td style="text-align: center; font-weight: bold;">${dev.cantidad}</td>
                <td style="color: #ff9800; font-weight: bold;">S/ ${dev.monto.toFixed(2)}</td>
                <td>${dev.motivo}</td>
                <td>${dev.fecha}</td>
                <td style="text-align: center;">
                    ${dev.foto ? `<button onclick="verFotoDevolucion(${dev.id})" style="background: #00bcd4; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">🖼️ Ver</button>` : '—'}
                </td>
                <td>
                    <button onclick="eliminarDevolucion(${dev.id})" style="background: #ff6b6b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div></div>';
    content.innerHTML = html;
}

function verFotoDevolucion(id) {
    const dev = devoluciones.find(d => d.id === id);
    if (!dev || !dev.foto) return;

    const modalHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <button onclick="this.parentElement.remove()" style="position: absolute; top: 20px; right: 20px; background: white; color: black; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; font-weight: bold; z-index: 10001;">✕</button>
            <img src="${dev.foto}" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;">
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function eliminarDevolucion(id) {
    if (confirm('⚠️ ¿Deseas eliminar esta devolución?')) {
        devoluciones = devoluciones.filter(d => d.id !== id);
        guardarDevolucionesLocal();
        mostrarHistorialDevoluciones();
        showNotification('❌ Devolución eliminada');
    }
}

// Cargar devoluciones al iniciar
cargarDevolucionesLocal();

// Modelo de permisos profesional
const PERMISOS = {
  // Lectura
  'ver_ventas': { nivel: 1, descripcion: 'Ver registro de ventas' },
  'ver_devoluciones': { nivel: 1, descripcion: 'Ver devoluciones' },
  'ver_reportes': { nivel: 1, descripcion: 'Acceder a reportes' },
  
  // Escritura (Crear)
  'crear_venta': { nivel: 2, descripcion: 'Registrar nuevas ventas' },
  'crear_devolucion': { nivel: 2, descripcion: 'Registrar devoluciones' },
  
  // Modificación (Editar/Eliminar)
  'editar_venta': { nivel: 3, descripcion: 'Editar ventas propias' },
  'eliminar_venta': { nivel: 3, descripcion: 'Eliminar ventas' },
  
  // Administración
  'aprobar_devoluciones': { nivel: 4, descripcion: 'Aprobar devs' },
  'acceso_admin': { nivel: 5, descripcion: 'Panel de admin' },
  'gestionar_usuarios': { nivel: 5, descripcion: 'CRUD de usuarios' }
};

const ROLES = {
  'vendedor': ['ver_ventas', 'crear_venta', 'editar_venta'],
  'supervisor': ['ver_ventas', 'crear_venta', 'editar_venta', 'eliminar_venta', 'aprobar_devoluciones'],
  'admin': Object.keys(PERMISOS)
};


// ===== REGISTRO DIARIO DE INGRESO Y SALIDA =====
let dailyRegistryData = [];
let currentEditingEmployee = null;

// Cargar registros diarios del localStorage
function loadDailyRegistry() {
    const saved = localStorage.getItem('dailyRegistry');
    if (saved) {
        dailyRegistryData = JSON.parse(saved);
    }
}

// Guardar registros diarios en localStorage
function saveDailyRegistryToLocal() {
    localStorage.setItem('dailyRegistry', JSON.stringify(dailyRegistryData));
}

// ===== MOSTRAR SECCIÓN DE REGISTRO DIARIO CON PROTECCIÓN DE LOGIN =====
function showDailyRegistry() {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para acceder al registro diario');
        abrirLoginSeguro();
        return;
    }

    // ✅ VERIFICACIÓN DE PERMISOS
    const acceso = verificarAccesoSeguro('registro-diario', usuarioActualSeguro);
    if (!acceso.permitido) {
        mostrarNotificacionSegura(`❌ ${acceso.motivo}`);
        return;
    }

    // Si tiene acceso y está autenticado
    const section = document.getElementById('dailyRegistry');
    if (!section) return;
    
    section.style.display = 'block';
    
    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('registryDate').value = today;
    
    loadDailyRegistry();
    renderDailyRegistry();
    section.scrollIntoView({ behavior: 'smooth' });
}

// Renderizar tabla de registro diario
function renderDailyRegistry() {
    const tableBody = document.getElementById('dailyRegistryBody');
    if (!tableBody) return;
    
    const selectedDate = document.getElementById('registryDate').value;
    tableBody.innerHTML = '';

    // Filtrar registros por fecha si hay una fecha seleccionada
    let registros = dailyRegistryData;
    if (selectedDate) {
        registros = dailyRegistryData.filter(r => r.fecha === selectedDate);
    }

    if (registros.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem; color: #999;">
                    No hay registros para esta fecha. 
                    <button onclick="addNewDailyRegistry()" class="btn-add-registry" style="background: #00bcd4; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Agregar Registro
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    registros.forEach((registro, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${registro.nombre}</strong></td>
            <td>${registro.servicio}</td>
            <td>${registro.fecha}</td>
            <td>${registro.horaIngreso || '-'}</td>
            <td style="max-width: 150px; word-wrap: break-word; overflow-wrap: break-word;">${registro.detalleAvance || '-'}</td>
            <td>${registro.almuerzoSalida || '-'}</td>
            <td>${registro.almuerzoIngreso || '-'}</td>
            <td>${registro.horaSalida || '-'}</td>
            <td style="max-width: 120px; word-wrap: break-word; overflow-wrap: break-word;">${registro.observaciones || '-'}</td>
            <td>
                <div class="action-buttons-registry" style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-pdf-registry" onclick="descargarPDFRegistro(${index})" title="Descargar PDF" style="background: #f44336; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn-edit-registry" onclick="editDailyRegistry(${index})" title="Editar" style="background: #2196F3; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-registry-daily" onclick="deleteDailyRegistry(${index})" title="Eliminar" style="background: #ff9800; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===== DESCARGAR PDF DE REGISTRO INDIVIDUAL =====
function descargarPDFRegistro(index) {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión');
        abrirLoginSeguro();
        return;
    }

    const registro = dailyRegistryData[index];

    if (!registro) {
        mostrarNotificacionSegura('⚠️ Registro no encontrado');
        return;
    }

    try {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // HEADER
        doc.setFillColor(0, 188, 212);
        doc.rect(0, 0, pageWidth, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('REDINNOVA', 15, 15);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Registro Diario de Ingreso y Salida', 15, 23);

        let y = 45;

        // DATOS DEL EMPLEADO
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('DATOS DEL EMPLEADO', 15, y);

        y += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        doc.text(`Nombre: ${registro.nombre || '-'}`, 15, y);
        y += 8;

        doc.text(`Servicio: ${registro.servicio || '-'}`, 15, y);
        y += 8;

        doc.text(`Fecha: ${registro.fecha || '-'}`, 15, y);
        y += 15;

        // HORARIOS
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('HORARIOS', 15, y);

        y += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        doc.text(`Ingreso: ${registro.horaIngreso || '-'}`, 15, y);
        y += 8;

        doc.text(`Almuerzo Salida: ${registro.almuerzoSalida || '-'}`, 15, y);
        y += 8;

        doc.text(`Almuerzo Ingreso: ${registro.almuerzoIngreso || '-'}`, 15, y);
        y += 8;

        doc.text(`Salida: ${registro.horaSalida || '-'}`, 15, y);
        y += 15;

        // DETALLE
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('DETALLE DE AVANCE', 15, y);

        y += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        const detalle = doc.splitTextToSize(
            registro.detalleAvance || 'Sin detalle',
            170
        );

        detalle.forEach(line => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }

            doc.text(line, 15, y);
            y += 6;
        });

        y += 10;

        // OBSERVACIONES
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('OBSERVACIONES', 15, y);

        y += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        const observaciones = doc.splitTextToSize(
            registro.observaciones || 'Sin observaciones',
            170
        );

        observaciones.forEach(line => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }

            doc.text(line, 15, y);
            y += 6;
        });

        // FOOTER
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        doc.text(
            `Generado por: ${usuarioActualSeguro.nombre}`,
            15,
            pageHeight - 10
        );

        doc.text(
            new Date().toLocaleString('es-PE'),
            120,
            pageHeight - 10
        );

        const filename =
            `Registro_${registro.nombre}_${registro.fecha}.pdf`;

        doc.save(filename);

        mostrarNotificacionSegura('✅ PDF descargado correctamente');

        registrarLogSeguridadSeguro(
            usuarioActualSeguro.usuario,
            `PDF descargado: ${filename}`,
            'info'
        );

    } catch (error) {

        console.error('Error al generar PDF:', error);

        mostrarNotificacionSegura(
            '❌ Error al generar PDF: ' + error.message
        );
    }
}

// Agregar nuevo registro diario
function addNewDailyRegistry() {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión');
        abrirLoginSeguro();
        return;
    }

    // Mostrar lista para seleccionar empleado
    showEmployeeSelectionForDaily();
}

// Mostrar modal para seleccionar empleado
function showEmployeeSelectionForDaily() {
    const employees_list = employees.map(emp => `
        <button class="employee-selection-btn" onclick="startDailyRegistryFor(${emp.id}, '${emp.name}', '${emp.service}')" style="background: white; border: 2px solid #e0e0e0; padding: 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: all 0.3s; text-align: left;">
            <div class="emp-selection-icon" style="font-size: 2rem; color: #00bcd4;">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="emp-selection-info">
                <strong>${emp.name}</strong>
                <small style="color: #999;">${emp.service}</small>
            </div>
        </button>
    `).join('');

    mostrarNotificacionSegura('Selecciona un empleado para registrar');
    
    // Crear un contenedor temporal para seleccionar empleado
    const selectionModal = document.createElement('div');
    selectionModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    selectionModal.id = 'employeeSelectionModal';
    selectionModal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin-bottom: 1.5rem; color: #1a1a1a;">
                <i class="fas fa-users"></i> Selecciona un Empleado
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${employees_list}
            </div>
            <button onclick="closeEmployeeSelection()" style="width: 100%; margin-top: 1.5rem; padding: 0.8rem; background: #999; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Cerrar
            </button>
        </div>
    `;
    document.body.appendChild(selectionModal);
}

function closeEmployeeSelection() {
    const modal = document.getElementById('employeeSelectionModal');
    if (modal) modal.remove();
}

// Iniciar registro diario para un empleado
function startDailyRegistryFor(empId, empName, empService) {
    closeEmployeeSelection();
    
    currentEditingEmployee = {
        id: empId,
        nombre: empName,
        servicio: empService
    };

    document.getElementById('dailyEmpName').value = empName;
    document.getElementById('dailyEmpService').value = empService;
    document.getElementById('dailyFecha').value = document.getElementById('registryDate').value || new Date().toISOString().split('T')[0];
    document.getElementById('dailyHoraIngreso').value = '';
    document.getElementById('dailyDetalleAvance').value = '';
    document.getElementById('dailyAlmuerzoSalida').value = '';
    document.getElementById('dailyAlmuerzoIngreso').value = '';
    document.getElementById('dailyHoraSalida').value = '';
    document.getElementById('dailyObservaciones').value = '';

    const modal = document.getElementById('dailyRegistryModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Editar registro diario
function editDailyRegistry(index) {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión');
        abrirLoginSeguro();
        return;
    }

    const registro = dailyRegistryData[index];
    currentEditingEmployee = { ...registro, index: index };

    document.getElementById('dailyModalTitle').textContent = `Editar Registro - ${registro.nombre}`;
    document.getElementById('dailyEmpName').value = registro.nombre;
    document.getElementById('dailyEmpService').value = registro.servicio;
    document.getElementById('dailyFecha').value = registro.fecha;
    document.getElementById('dailyHoraIngreso').value = registro.horaIngreso || '';
    document.getElementById('dailyDetalleAvance').value = registro.detalleAvance || '';
    document.getElementById('dailyAlmuerzoSalida').value = registro.almuerzoSalida || '';
    document.getElementById('dailyAlmuerzoIngreso').value = registro.almuerzoIngreso || '';
    document.getElementById('dailyHoraSalida').value = registro.horaSalida || '';
    document.getElementById('dailyObservaciones').value = registro.observaciones || '';

    const modal = document.getElementById('dailyRegistryModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Guardar registro diario
function saveDailyRegistry(event) {
    event.preventDefault();

    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Sesión expirada, inicia sesión de nuevo');
        return;
    }

    if (!currentEditingEmployee) {
        mostrarNotificacionSegura('⚠️ Error: Selecciona un empleado');
        return;
    }

    const registro = {
        id: currentEditingEmployee.id,
        nombre: document.getElementById('dailyEmpName').value,
        servicio: document.getElementById('dailyEmpService').value,
        fecha: document.getElementById('dailyFecha').value,
        horaIngreso: document.getElementById('dailyHoraIngreso').value,
        detalleAvance: document.getElementById('dailyDetalleAvance').value,
        almuerzoSalida: document.getElementById('dailyAlmuerzoSalida').value,
        almuerzoIngreso: document.getElementById('dailyAlmuerzoIngreso').value,
        horaSalida: document.getElementById('dailyHoraSalida').value,
        observaciones: document.getElementById('dailyObservaciones').value,
        usuario: usuarioActualSeguro.nombre,
        timestamp: new Date().toISOString()
    };

    // Si es edición, reemplazar
    if (currentEditingEmployee.index !== undefined) {
        dailyRegistryData[currentEditingEmployee.index] = registro;
    } else {
        dailyRegistryData.push(registro);
    }

    saveDailyRegistryToLocal();
    closeDailyRegistryModal();
    renderDailyRegistry();
    mostrarNotificacionSegura('✅ Registro guardado correctamente');
    registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, 'Registro diario guardado', 'info');
}

// Eliminar registro diario
function deleteDailyRegistry(index) {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión');
        abrirLoginSeguro();
        return;
    }

    if (confirm('¿Eliminar este registro?')) {
        dailyRegistryData.splice(index, 1);
        saveDailyRegistryToLocal();
        renderDailyRegistry();
        mostrarNotificacionSegura('🗑️ Registro eliminado');
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, 'Registro diario eliminado', 'info');
    }
}

// Filtrar por fecha
function filterRegistryByDate() {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión');
        abrirLoginSeguro();
        return;
    }
    renderDailyRegistry();
}

// Exportar registro diario (CSV/Excel)
function exportDailyRegistry() {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión');
        abrirLoginSeguro();
        return;
    }

    const selectedDate = document.getElementById('registryDate').value;
    let registros = dailyRegistryData;
    
    if (selectedDate) {
        registros = dailyRegistryData.filter(r => r.fecha === selectedDate);
    }

    if (registros.length === 0) {
        mostrarNotificacionSegura('⚠️ No hay registros para exportar');
        return;
    }

    // Crear CSV
    let csv = 'NOMBRE,SERVICIO,FECHA,H. INGRESO,DETALLE,ALMUERZO SALIDA,ALMUERZO INGRESO,H. SALIDA,OBSERVACIONES\n';
    
    registros.forEach(registro => {
        csv += `"${registro.nombre}","${registro.servicio}","${registro.fecha}","${registro.horaIngreso}","${registro.detalleAvance}","${registro.almuerzoSalida}","${registro.almuerzoIngreso}","${registro.horaSalida}","${registro.observaciones}"\n`;
    });

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registro_diario_${selectedDate || new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarNotificacionSegura('✅ Registro descargado');
    registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, 'Registro diario exportado', 'info');
}

// Cerrar modal de registro diario
function closeDailyRegistryModal() {
    const modal = document.getElementById('dailyRegistryModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingEmployee = null;
    document.getElementById('dailyRegistryForm').reset();
    document.getElementById('dailyModalTitle').textContent = 'Registrar Ingreso y Salida';
}

// ===== INICIALIZAR AL CARGAR =====
document.addEventListener('DOMContentLoaded', function() {
    loadDailyRegistry();
});


// Cargar registros al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadDailyRegistry();
});

