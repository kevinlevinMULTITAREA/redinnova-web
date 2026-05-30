/**
 * SISTEMA DE AUTENTICACIÓN CON 2FA - MÓDULO SEGURO
 * ==================================================
 */

// ===== VARIABLES GLOBALES DE SEGURIDAD =====

let usuarioActualSeguro = null;
let codigoVerificacion2FA = null;
let codigoVerificacion2FAExpira = null;

const TIEMPO_EXPIRACION_CODIGO_2FA = 5 * 60 * 1000; // 5 minutos
const TIEMPO_EXPIRACION_SESION = 30 * 60 * 1000; // 30 minutos
const MAX_INTENTOS_FALLIDOS = 5;
const TIEMPO_BLOQUEO = 15 * 60 * 1000; // 15 minutos

let timerSesionSeguro = null;
let logsSeguridad = [];

// ===== CARGAR LOGS DE AUDITORÍA =====

function cargarLogsSeguridad() {
    const saved = localStorage.getItem('redinnova_logs_seguridad');
    if (saved) {
        try {
            logsSeguridad = JSON.parse(saved);
        } catch (e) {
            logsSeguridad = [];
        }
    }
}

// ===== BASE DE DATOS LOCAL DE USUARIOS SEGURA =====

let usuariosDBSeguro = [
    {
        id: 1,
        usuario: 'admin',
        email: 'admin@redinnova.com',
        nombre: 'Administrador Sistema',
        rol: 'admin',
        passwordHash: null,
        twoFAEnabled: false,  // ✅ CAMBIADO A FALSE - SIN 2FA
        twoFASecret: null,    // ✅ ELIMINADO
        recuperacionClaves: [],
        intentosFallidos: 0,
        bloqueadoHasta: null,
        sesionActiva: false,
        token: null,
        tiempoCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        estado: 'activo'
    },
    {
        id: 2,
        usuario: 'supervisor',
        email: 'supervisor@redinnova.com',
        nombre: 'Supervisor Ventas',
        rol: 'supervisor',
        passwordHash: null,
        twoFAEnabled: false,
        twoFASecret: null,
        recuperacionClaves: [],
        intentosFallidos: 0,
        bloqueadoHasta: null,
        sesionActiva: false,
        token: null,
        tiempoCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        estado: 'activo'
    },
    {
        id: 3,
        usuario: 'vendedor',
        email: 'vendedor@redinnova.com',
        nombre: 'Vendedor General',
        rol: 'vendedor',
        passwordHash: null,
        twoFAEnabled: false,
        twoFASecret: null,
        recuperacionClaves: [],
        intentosFallidos: 0,
        bloqueadoHasta: null,
        sesionActiva: false,
        token: null,
        tiempoCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        estado: 'activo'
    }
];

// ===== CARGAR USUARIOS DEL STORAGE =====

function cargarUsuariosSeguro() {
    const saved = localStorage.getItem('redinnova_usuarios_seguro');
    if (saved) {
        try {
            usuariosDBSeguro = JSON.parse(saved);
        } catch (e) {
            console.error('Error al cargar usuarios');
        }
    }
}

// ===== GUARDAR USUARIOS EN STORAGE =====

function guardarUsuariosSeguro() {
    localStorage.setItem('redinnova_usuarios_seguro', JSON.stringify(usuariosDBSeguro));
}

// ===== REGISTRAR LOG DE SEGURIDAD =====

function registrarLogSeguridadSeguro(usuario, accion, tipo = 'info', detalles = {}) {
    try {
        const log = {
            timestamp: new Date().toISOString(),
            usuario: usuario,
            accion: accion,
            tipo: tipo,
            detalles: detalles
        };

        logsSeguridad.push(log);
        
        if (logsSeguridad.length > 500) {
            logsSeguridad.shift();
        }
        
        localStorage.setItem('redinnova_logs_seguridad', JSON.stringify(logsSeguridad));
    } catch (e) {
        console.error('Error registrando log');
    }
}

// ===== GENERAR HASH SHA-256 =====

async function generarHashSHA256Seguro(texto) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(texto.trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.error('Error en hash');
        return null;
    }
}

// ===== GENERAR TOKEN DE SESIÓN =====

function generarTokenSesionSeguro() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .reduce((a, b) => a + ('0' + b.toString(16)).slice(-2), '');
}

// ===== INICIALIZAR SISTEMA SEGURO =====

async function inicializarSistemaSeguro() {
    cargarUsuariosSeguro();
    cargarLogsSeguridad();

    const passwordsDefault = {
        'admin': 'Admin@2026',
        'supervisor': 'Supervisor@2026Seguro#',
        'vendedor': 'Vendedor@2026Secure$'
    };

    for (let usuario of usuariosDBSeguro) {
        if (!usuario.passwordHash) {
            const nombreClave = usuario.usuario.toLowerCase();
            
            if (passwordsDefault[nombreClave]) {
                const passwordPlain = passwordsDefault[nombreClave];
                usuario.passwordHash = await generarHashSHA256Seguro(passwordPlain);
            }
        }
    }

    guardarUsuariosSeguro();
    registrarLogSeguridadSeguro('SISTEMA', 'Sistema de seguridad inicializado', 'info');
}

// ===== VALIDAR ACCESO A MÓDULO =====

function verificarAccesoSeguro(moduleId, usuarioActual) {
    if (!usuarioActual) {
        return {
            permitido: false,
            motivo: 'No autenticado'
        };
    }

    const modulosProtegidos = {
        'ingreso-compras': ['vendedor', 'supervisor', 'admin'],
        'salida-ventas': ['vendedor', 'supervisor', 'admin'],
        'caja-diaria': ['supervisor', 'admin'],
        'ventas-personales': ['supervisor', 'admin'],
        'productos': ['vendedor', 'supervisor', 'admin'],
        'devoluciones': ['vendedor', 'supervisor', 'admin'],
        'servicio-tecnico': ['vendedor', 'supervisor', 'admin'],
        'registro-diario': ['vendedor', 'supervisor', 'admin']
    };

    const rolesPermitidos = modulosProtegidos[moduleId] || ['admin'];

    if (!rolesPermitidos.includes(usuarioActual.rol)) {
        registrarLogSeguridadSeguro(
            usuarioActual.usuario,
            `Intento de acceso denegado: ${moduleId}`,
            'advertencia'
        );
        return {
            permitido: false,
            motivo: `Se requiere rol: ${rolesPermitidos.join(', ')}`
        };
    }

    registrarLogSeguridadSeguro(
        usuarioActual.usuario,
        `Acceso al módulo: ${moduleId}`,
        'info'
    );

    return { permitido: true };
}

// ===== VERIFICAR USUARIO BLOQUEADO =====

function verificarUsuarioBloqueadoSeguro(usuario) {
    if (usuario.bloqueadoHasta && new Date() < new Date(usuario.bloqueadoHasta)) {
        const tiempoRestante = Math.ceil((new Date(usuario.bloqueadoHasta) - new Date()) / 1000 / 60);
        return {
            bloqueado: true,
            mensaje: `Cuenta bloqueada. Intenta en ${tiempoRestante} minuto(s)`
        };
    }
    return { bloqueado: false };
}

// ===== PROCESAR LOGIN =====

async function procesarLoginSeguroPaso1() {
    const usuarioInput = document.getElementById('loginUsuario')?.value.trim();
    const passwordInput = document.getElementById('loginPassword')?.value;

    if (!usuarioInput || !passwordInput) {
        mostrarErrorLoginSeguro('❌ Usuario y contraseña son requeridos');
        return;
    }

    cargarUsuariosSeguro();

    const usuario = usuariosDBSeguro.find(u =>
        (u.usuario === usuarioInput || u.email === usuarioInput) && u.estado === 'activo'
    );

    if (!usuario) {
        mostrarErrorLoginSeguro('❌ Usuario o email no encontrado');
        registrarLogSeguridadSeguro(usuarioInput, 'Intento de login - Usuario no encontrado', 'advertencia');
        document.getElementById('loginPassword').value = '';
        return;
    }

    const bloqueo = verificarUsuarioBloqueadoSeguro(usuario);
    if (bloqueo.bloqueado) {
        mostrarErrorLoginSeguro('🔒 ' + bloqueo.mensaje);
        return;
    }

    const passwordHash = await generarHashSHA256Seguro(passwordInput);
    
    if (usuario.passwordHash !== passwordHash) {
        usuario.intentosFallidos++;
        guardarUsuariosSeguro();

        if (usuario.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
            usuario.bloqueadoHasta = new Date(Date.now() + TIEMPO_BLOQUEO).toISOString();
            guardarUsuariosSeguro();
            mostrarErrorLoginSeguro(`❌ Demasiados intentos fallidos. Cuenta bloqueada 15 minutos.`);
            registrarLogSeguridadSeguro(usuario.usuario, 'Cuenta bloqueada por exceso de intentos', 'error');
        } else {
            const intentosRestantes = MAX_INTENTOS_FALLIDOS - usuario.intentosFallidos;
            mostrarErrorLoginSeguro(`❌ Contraseña incorrecta. ${intentosRestantes} intento(s) restante(s).`);
            registrarLogSeguridadSeguro(usuario.usuario, `Intento fallido`, 'advertencia');
        }

        document.getElementById('loginPassword').value = '';
        return;
    }

    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;
    guardarUsuariosSeguro();

    // ✅ DIRECTO AL LOGIN - SIN 2FA
    completarLoginSeguro(usuario);
}

// ===== COMPLETAR LOGIN =====

function completarLoginSeguro(usuario) {
    const token = generarTokenSesionSeguro();

    usuarioActualSeguro = {
        ...usuario,
        token: token,
        tiempoLogin: new Date().toISOString(),
        tiempoExpiracion: new Date(Date.now() + TIEMPO_EXPIRACION_SESION).toISOString()
    };

    usuario.sesionActiva = true;
    usuario.token = token;
    usuario.ultimoAcceso = new Date().toISOString();

    guardarUsuariosSeguro();

    mostrarNotificacionSegura(`✅ ¡Bienvenido ${usuario.nombre}!`);
    cerrarLoginSeguro();
    actualizarMenuUsuarioSeguro();
    iniciarTimerSesionSeguro();
    registrarLogSeguridadSeguro(usuario.usuario, 'Login exitoso', 'info');

    window.usuarioLoginTempSeguro = null;
    window.usuarioLoginPasswordSeguro = null;

    if (typeof generarGridModulosSeguro === 'function') {
        generarGridModulosSeguro();
    }
}

// ===== CERRAR SESIÓN =====

function cerrarSesionSeguro() {
    if (usuarioActualSeguro) {
        const usuario = usuariosDBSeguro.find(u => u.id === usuarioActualSeguro.id);
        if (usuario) {
            usuario.sesionActiva = false;
            usuario.token = null;
            guardarUsuariosSeguro();
        }
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, 'Logout', 'info');
    }

    usuarioActualSeguro = null;
    clearTimeout(timerSesionSeguro);
    actualizarMenuUsuarioSeguro();

    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.style.display = 'none';
    }

    mostrarNotificacionSegura('👋 Sesión cerrada correctamente');

    if (typeof generarGridModulosSeguro === 'function') {
        generarGridModulosSeguro();
    }
}

// ===== TIMER DE SESIÓN =====

function iniciarTimerSesionSeguro() {
    clearTimeout(timerSesionSeguro);
    timerSesionSeguro = setTimeout(function() {
        mostrarNotificacionSegura('⏱️ Tu sesión ha expirado por inactividad');
        cerrarSesionSeguro();
    }, TIEMPO_EXPIRACION_SESION);
}

// ===== ACTUALIZAR MENÚ DE USUARIO =====

function actualizarMenuUsuarioSeguro() {
    const menuContent = document.getElementById('userMenuContent');
    if (!menuContent) return;

    if (usuarioActualSeguro) {
        menuContent.innerHTML = `
            <div style="padding: 0.8rem; font-weight: 600; color: #00bcd4; border-bottom: 1px solid #eee;">
                👤 ${usuarioActualSeguro.nombre}
            </div>
            <div style="padding: 0.5rem; color: #999; font-size: 0.9rem; border-bottom: 1px solid #eee;">
                Rol: <strong>${usuarioActualSeguro.rol.toUpperCase()}</strong>
            </div>
            <a href="#" onclick="mostrarPanelPermisosSeguro(); return false;" 
               style="display: block; padding: 0.8rem; color: #4caf50; text-decoration: none; border-bottom: 1px solid #eee; font-weight: 600;">
                👁️ Ver Mis Permisos
            </a>
            <a href="#" onclick="cerrarSesionSeguro(); return false;" 
               style="display: block; padding: 0.8rem; color: #ff6b6b; text-decoration: none; font-weight: 600;">
                🚪 Cerrar Sesión
            </a>
        `;
    } else {
        menuContent.innerHTML = `
            <a href="#" onclick="abrirLoginSeguro(); return false;" 
               style="display: block; padding: 0.8rem; color: #00bcd4; text-decoration: none; font-weight: 600;">
                🔐 Iniciar Sesión
            </a>
        `;
    }
}

// ===== ABRIR/CERRAR LOGIN =====

function abrirLoginSeguro() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        loginModal.style.visibility = 'visible';
        loginModal.style.opacity = '1';
        
        setTimeout(() => {
            loginModal.style.display = 'flex';
        }, 10);
        
        const step1 = document.getElementById('loginStep1');
        const step2 = document.getElementById('loginStep2FA');
        const errorDiv = document.getElementById('loginError');
        
        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        if (errorDiv) errorDiv.innerHTML = '';
        
        const formLogin = document.getElementById('formLogin');
        if (formLogin) formLogin.reset();
        
        const form2FA = document.getElementById('form2FA');
        if (form2FA) form2FA.reset();
    }
}

function cerrarLoginSeguro() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    
    const formLogin = document.getElementById('formLogin');
    if (formLogin) formLogin.reset();
    
    const form2FA = document.getElementById('form2FA');
    if (form2FA) form2FA.reset();
    
    const step1 = document.getElementById('loginStep1');
    const step2 = document.getElementById('loginStep2FA');
    const errorDiv = document.getElementById('loginError');
    
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (errorDiv) errorDiv.innerHTML = '';
}

// ===== MOSTRAR PANEL DE PERMISOS =====

function mostrarPanelPermisosSeguro() {
    if (!usuarioActualSeguro) return;

    const modulosAccesibles = [
        { id: 'ingreso-compras', nombre: 'Ingreso de Compras', roles: ['vendedor', 'supervisor', 'admin'] },
        { id: 'salida-ventas', nombre: 'Salida de Ventas', roles: ['vendedor', 'supervisor', 'admin'] },
        { id: 'caja-diaria', nombre: 'Caja Diaria', roles: ['supervisor', 'admin'] },
        { id: 'ventas-personales', nombre: 'Ventas Personales', roles: ['supervisor', 'admin'] },
        { id: 'productos', nombre: 'Catálogo de Productos', roles: ['vendedor', 'supervisor', 'admin'] },
        { id: 'devoluciones', nombre: 'Devoluciones', roles: ['vendedor', 'supervisor', 'admin'] },
        { id: 'servicio-tecnico', nombre: 'Servicio Técnico', roles: ['vendedor', 'supervisor', 'admin'] },
        { id: 'registro-diario', nombre: 'Registro Diario', roles: ['vendedor', 'supervisor', 'admin'] }
    ];

    let html = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: #1a1a1a;">👁️ Mis Permisos</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px; font-weight: bold;">✕</button>
                </div>

                <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <p style="margin: 0; color: #1565c0;"><strong>Rol:</strong> ${usuarioActualSeguro.rol.toUpperCase()}</p>
                </div>

                <h3 style="color: #1a1a1a; margin-bottom: 1rem;">Módulos Disponibles:</h3>
                <div style="display: grid; gap: 0.8rem;">
    `;

    modulosAccesibles.forEach(modulo => {
        const tieneAcceso = modulo.roles.includes(usuarioActualSeguro.rol);
        const colorBorde = tieneAcceso ? '#4caf50' : '#f44336';
        const icono = tieneAcceso ? '✅' : '❌';
        const fondo = tieneAcceso ? '#e8f5e9' : '#ffebee';

        html += `
            <div style="border-left: 4px solid ${colorBorde}; background: ${fondo}; padding: 1rem; border-radius: 6px;">
                <strong style="color: ${tieneAcceso ? '#2e7d32' : '#c62828'}">${icono} ${modulo.nombre}</strong>
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

// ===== NOTIFICACIONES =====

function mostrarNotificacionSegura(mensaje) {
    const notif = document.getElementById('notification') || crearNotificacionSegura();
    if (!notif) return;
    
    notif.innerHTML = mensaje;
    notif.style.display = 'block';

    setTimeout(() => {
        notif.style.display = 'none';
    }, 5000);
}

function mostrarErrorLoginSeguro(mensaje) {
    const errorDiv = document.getElementById('loginError');
    if (!errorDiv) return;
    
    errorDiv.innerHTML = mensaje;
    errorDiv.style.display = 'block';
}

function crearNotificacionSegura() {
    const notif = document.createElement('div');
    notif.id = 'notification';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2c3e50;
        color: #fff;
        padding: 1rem;
        border-radius: 0.5rem;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notif);
    return notif;
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', async function() {
    await inicializarSistemaSeguro();

    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarLoginSeguroPaso1();
        });
    }

    actualizarMenuUsuarioSeguro();

    document.addEventListener('click', function(e) {
        const userMenu = document.getElementById('userMenu');
        const userIcon = document.querySelector('.user-icon-header');

        if (userMenu && userIcon) {
            if (!userMenu.contains(e.target) && !userIcon.contains(e.target)) {
                userMenu.style.display = 'none';
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarLoginSeguro();
        }
    });
});

// ===== FUNCIONES DE COMPATIBILIDAD =====

function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        const isHidden = userMenu.style.display === 'none';
        userMenu.style.display = isHidden ? 'block' : 'none';
    }
}

function abrirLogin() {
    abrirLoginSeguro();
}

function cerrarLogin() {
    cerrarLoginSeguro();
}

function cerrarSesion() {
    cerrarSesionSeguro();
}
