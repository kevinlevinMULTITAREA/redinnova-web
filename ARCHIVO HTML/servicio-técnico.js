// ===== MÓDULO SERVICIO TÉCNICO =====

// Datos de servicios técnicos
let serviciosTecnicos = [];

// Estados posibles del servicio
const estadosServicio = [
    { id: 'recibido', name: 'Recibido', color: '#2196F3', icon: '📥' },
    { id: 'diagnostico', name: 'Diagnóstico', color: '#FF9800', icon: '🔍' },
    { id: 'reparacion', name: 'En Reparación', color: '#FF5722', icon: '🔧' },
    { id: 'completado', name: 'Completado', color: '#8BC34A', icon: '✓' },
    { id: 'entregado', name: 'Entregado', color: '#4CAF50', icon: '✅' }
];

// Categorías de productos
const categoriasProductos = [
    'PC de Escritorio',
    'Laptop',
    'Impresora',
    'Monitor',
    'Teclado',
    'Mouse',
    'Headset',
    'Router',
    'Modem',
    'Otros'
];

// ===== CARGAR SERVICIOS DEL LOCALSTORAGE =====
function cargarServiciosTecnicos() {
    const saved = localStorage.getItem('redinnova_servicios_tecnicos');
    if (saved) {
        serviciosTecnicos = JSON.parse(saved);
    }
}

// ===== GUARDAR SERVICIOS AL LOCALSTORAGE =====
function guardarServiciosTecnicos() {
    localStorage.setItem('redinnova_servicios_tecnicos', JSON.stringify(serviciosTecnicos));
}

// ===== MOSTRAR MÓDULO SERVICIO TÉCNICO =====
function mostrarServicioTecnico() {
    if (!verificarAcceso('ver_productos')) return;
    
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
                            ${categoriasProductos.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
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

                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> Registrar Servicio
                </button>
            </form>

            <div id="mensajeRegistro" style="margin-top: 1.5rem;"></div>
        </div>
    `;

    // Setup del formulario
    document.getElementById('formRegistroServicio').addEventListener('submit', function(e) {
        e.preventDefault();

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
            fechaIngreso: document.getElementById('fechaIngreso').value,
            fechaEstimada: document.getElementById('fechaEstimada').value,
            costoEstimado: parseFloat(document.getElementById('costoEstimado').value),
            estado: 'recibido',
            fechaRegistro: new Date().toISOString().split('T')[0]
        };

        serviciosTecnicos.push(nuevoServicio);
        guardarServiciosTecnicos();

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
        this.reset();
        document.getElementById('fechaIngreso').valueAsDate = new Date();

        setTimeout(() => {
            mensajeDiv.innerHTML = '';
        }, 4000);

        showNotification('✅ Servicio registrado exitosamente');
    });

    // Establecer fecha actual por defecto
    document.getElementById('fechaIngreso').valueAsDate = new Date();
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

    const serviciosEncontrados = serviciosTecnicos.filter(s => s.cliente.dni === dni);

    if (serviciosEncontrados.length === 0) {
        resultadosDiv.innerHTML = `
            <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 8px; padding: 1rem; color: #c62828; text-align: center;">
                <i class="fas fa-times-circle"></i> No se encontraron servicios para el DNI: <strong>${dni}</strong>
            </div>
        `;
        return;
    }

    let html = `<h4 style="color: #1a1a1a; margin-bottom: 1rem;">Se encontraron ${serviciosEncontrados.length} servicio(s):</h4>`;
    html += '<div class="resultados-consulta">';

    serviciosEncontrados.forEach(servicio => {
        const estado = estadosServicio.find(e => e.id === servicio.estado);
        
        html += `
            <div class="servicio-card" style="border-left: 4px solid ${estado.color};">
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

                <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p style="margin: 0.5rem 0; color: #666;"><strong>📱 Equipo:</strong> ${servicio.producto.nombre}</p>
                    <p style="margin: 0.5rem 0; color: #666;"><strong>🏷️ Categoría:</strong> ${servicio.producto.categoria}</p>
                    <p style="margin: 0.5rem 0; color: #666;"><strong>📝 Problema:</strong> ${servicio.descripcion}</p>
                    <p style="margin: 0.5rem 0; color: #666;"><strong>💰 Costo Estimado:</strong> S/ ${servicio.costoEstimado.toFixed(2)}</p>
                    <p style="margin: 0.5rem 0; color: #666;"><strong>📅 Entrega Estimada:</strong> ${servicio.fechaEstimada}</p>
                </div>

                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a href="https://www.facebook.com/p/Red-innova-sac-100064703783715/" target="_blank" class="social-btn" style="background: #1877F2; color: white; flex: 1;">
                        <i class="fab fa-facebook"></i> Facebook
                    </a>
                    <a href="https://www.instagram.com" target="_blank" class="social-btn" style="background: #E4405F; color: white; flex: 1;">
                        <i class="fab fa-instagram"></i> Instagram
                    </a>
                    <a href="https://www.tiktok.com" target="_blank" class="social-btn" style="background: #000000; color: white; flex: 1;">
                        <i class="fab fa-tiktok"></i> TikTok
                    </a>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultadosDiv.innerHTML = html;
}

// ===== TAB: HISTORIAL COMPLETO =====
function mostrarTabHistorial() {
    const tabContent = document.getElementById('tabContentServicio');
    
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
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    serviciosTecnicos.forEach(servicio => {
        const estado = estadosServicio.find(e => e.id === servicio.estado);
        
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
                <td>
                    <button onclick="cambiarEstadoServicio(${servicio.id})" style="background: #00bcd4; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Cambiar Estado
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

// ===== CAMBIAR ESTADO DEL SERVICIO =====
function cambiarEstadoServicio(servicioId) {
    const servicio = serviciosTecnicos.find(s => s.id === servicioId);
    if (!servicio) return;

    const estadoActual = estadosServicio.findIndex(e => e.id === servicio.estado);
    const siguienteEstado = estadoActual < estadosServicio.length - 1 ? estadoActual + 1 : 0;
    
    servicio.estado = estadosServicio[siguienteEstado].id;
    guardarServiciosTecnicos();
    
    mostrarTabHistorial();
    showNotification(`✅ Estado actualizado a: ${estadosServicio[siguienteEstado].name}`);
}

// ===== CARGAR SERVICIOS AL INICIAR =====
document.addEventListener('DOMContentLoaded', function() {
    cargarServiciosTecnicos();
});

console.log('✅ Módulo Servicio Técnico cargado correctamente');
