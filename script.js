// =============================================
// FIREBASE CONFIG - REALTIME DATABASE & AUTH
// =============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getDatabase, ref, set, get, child, update, remove, onValue, push
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // Añadido módulo Auth

const firebaseConfig = {
    apiKey: "AIzaSyB5l-76-ZNi0NjmzRGYavlx8xJjC2d2msg",
    authDomain: "weblocalpro.firebaseapp.com",
    databaseURL: "https://weblocalpro-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "weblocalpro",
    storageBucket: "weblocalpro.firebasestorage.app",
    messagingSenderId: "478772458715",
    appId: "1:478772458715:web:42938999d717ed0bc108fe"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Inicializar Auth

console.log('✅ Firebase Realtime DB & Auth inicializados');

// =============================================
// SISTEMA DE AUTENTICACIÓN Y CONTROL DE PANTALLAS
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const panelScreen = document.getElementById('panel');

    // 1. Escuchar el estado de autenticación en tiempo real
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('Usuario autenticado:', user.email);
            // Ocultar login, mostrar panel y cargar los datos de la BD
            if (loginScreen) loginScreen.style.display = 'none';
            if (panelScreen) panelScreen.style.display = 'block';
            if (typeof iniciarPanel === 'function') iniciarPanel();
        } else {
            console.warn('Esperando inicio de sesión...');
            // Mostrar login, ocultar panel
            if (loginScreen) loginScreen.style.display = 'flex';
            if (panelScreen) panelScreen.style.display = 'none';
        }
    });

    // 2. Lógica del formulario de inicio de sesión
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            // Ahora sí, buscando los IDs que existen en el HTML
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-pass');
            const errorDiv = document.getElementById('login-error');

            // Prevenimos el error null comprobando que existen
            if (!emailInput || !passInput) {
                console.error("Error: No se encontraron los inputs del login en el HTML");
                return;
            }

            const email = emailInput.value;
            const password = passInput.value;

            errorDiv.style.display = 'none';

            // Llamada nativa con sintaxis v10
            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    console.error('Error de autenticación:', error.code, error.message);
                    errorDiv.style.display = 'block';
                    errorDiv.innerText = '❌ Credenciales incorrectas';
                });
        });
    }
});

// =============================================
// MENÚ HAMBURGUESA
// =============================================
const hamburguesa = document.getElementById('menu-hamburguesa');
const navMenu = document.getElementById('nav-menu');
if (hamburguesa) {
    hamburguesa.addEventListener('click', () => {
        hamburguesa.classList.toggle('activo');
        navMenu.classList.toggle('activo');
    });
    document.querySelectorAll('#nav-menu a').forEach(a => {
        a.addEventListener('click', () => {
            hamburguesa.classList.remove('activo');
            navMenu.classList.remove('activo');
        });
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
});

// =============================================
// WEB PÚBLICA - PORTFOLIO
// =============================================
const portfolioGrid = document.getElementById('portfolio-grid');
if (portfolioGrid) {
    const iconos = { barberia: '💈', restaurante: '🍽️', ecommerce: '🛒', otro: '🌐' };

    onValue(ref(db, 'wlp_portfolio'), snap => {
        const data = snap.val() || {};
        const items = Object.entries(data).map(([id, p]) => ({ id, ...p }));

        const el = id => document.getElementById(id);
        if (el('pstat-total')) el('pstat-total').textContent = items.length;
        if (el('stat-webs')) el('stat-webs').textContent = items.length;
        if (el('stat-clientes')) el('stat-clientes').textContent = items.length;

        if (items.length === 0) {
            portfolioGrid.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;grid-column:1/-1">Pronto añadiré mis trabajos aquí.</p>';
            return;
        }

        portfolioGrid.innerHTML = items.map(p => `
            <div class="portfolio-card">
                <div class="portfolio-card-top">${iconos[p.tipo] || '🌐'}</div>
                <div class="portfolio-card-body">
                    <h3>${p.nombre}</h3>
                    <p>${p.descripcion || ''}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                        <span class="portfolio-tag">${p.tipo}</span>
                        ${p.url ? `<a href="${p.url}" target="_blank" class="btn btn-outline btn-sm">Ver web →</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// =============================================
// WEB PÚBLICA - TESTIMONIOS
// =============================================
const testimoniosGrid = document.getElementById('testimonios-grid');
if (testimoniosGrid) {
    onValue(ref(db, 'wlp_testimonios'), snap => {
        const data = snap.val() || {};
        const items = Object.entries(data).map(([id, t]) => ({ id, ...t }));

        if (items.length === 0) {
            testimoniosGrid.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;grid-column:1/-1">Los testimonios de mis clientes aparecerán aquí.</p>';
            return;
        }

        testimoniosGrid.innerHTML = items.map(t => `
            <div class="testimonio-card">
                <div class="testimonio-estrellas">${'★'.repeat(t.estrellas || 5)}</div>
                <p class="testimonio-texto">"${t.texto}"</p>
                <div class="testimonio-autor">
                    <div class="testimonio-avatar">${(t.nombre || 'U')[0].toUpperCase()}</div>
                    <div class="testimonio-info">
                        <strong>${t.nombre || '-'}</strong>
                        <span>${t.negocio || ''}</span>
                    </div>
                </div>
                ${t.descripcion ? `<button class="btn btn-sm btn-outline" style="width:100%;margin-top:15px;" onclick="abrirTestimonioCompleto('${t.id}')">Leer historia completa →</button>` : ''}
            </div>
        `).join('');
    });
}

function abrirTestimonioCompleto(id) {
    get(ref(db, `wlp_testimonios/${id}`)).then(snap => {
        const t = snap.val();
        if (!t) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:700px">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px">
                    <div>
                        <h2>${t.nombre}</h2>
                        <p style="color:#666;margin:0">${t.negocio || ''}</p>
                        <p style="color:#f59e0b;font-size:1.2rem;margin:8px 0">${'★'.repeat(t.estrellas || 5)}</p>
                    </div>
                    <button onclick="this.closest('.modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer">✕</button>
                </div>
                <div style="background:#f8fafc;padding:20px;border-radius:10px;margin-bottom:20px">
                    <p style="font-style:italic;color:#666;line-height:1.8">${t.descripcion}</p>
                </div>
                <button onclick="this.closest('.modal').remove()" class="btn btn-primary" style="width:100%">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.remove();
        });
    });
}

// =============================================
// WEB PÚBLICA - BLOG
// =============================================
const blogGrid = document.getElementById('blog-grid');
if (blogGrid) {
    onValue(ref(db, 'wlp_blog'), snap => {
        const data = snap.val() || {};
        const items = Object.entries(data)
            .map(([id, b]) => ({ id, ...b }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (items.length === 0) {
            blogGrid.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;grid-column:1/-1">Pronto publicaré artículos con consejos para tu negocio.</p>';
            return;
        }

        blogGrid.innerHTML = items.map(b => `
            <div class="blog-card" onclick="abrirArticuloBlog('${b.id}')">
                <div class="blog-card-top">${b.emoji || '📝'}</div>
                <div class="blog-card-body">
                    <span class="blog-tag">${b.categoria}</span>
                    <h3>${b.titulo}</h3>
                    <p>${(b.contenido || '').substring(0, 100)}...</p>
                    <span class="blog-fecha">${b.fecha}</span>
                    <div style="margin-top:12px"><button class="btn btn-sm btn-outline" style="cursor:pointer">Leer más →</button></div>
                </div>
            </div>
        `).join('');
    });
}

function abrirArticuloBlog(id) {
    get(ref(db, `wlp_blog/${id}`)).then(snap => {
        const b = snap.val();
        if (!b) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px">
                <button onclick="this.closest('.modal').remove()" style="background:none;border:none;font-size:2rem;cursor:pointer;float:right">✕</button>
                <div style="clear:both">
                    <div style="font-size:3rem;text-align:center;margin:20px 0">${b.emoji || '📝'}</div>
                    <h1 style="text-align:center;color:var(--dark);margin:20px 0">${b.titulo}</h1>
                    <p style="text-align:center;color:#94a3b8;margin:10px 0"><strong>${b.categoria}</strong> • ${b.fecha}</p>
                    <div style="background:#f8fafc;padding:30px;border-radius:10px;margin:30px 0;line-height:1.8;color:#333">
                        ${b.contenido.replace(/\n/g, '<br><br>')}
                    </div>
                    <button onclick="this.closest('.modal').remove()" class="btn btn-primary" style="width:100%">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.remove();
        });
    });
}

// =============================================
// WEB PÚBLICA - CONTACTO
// =============================================
const formContacto = document.getElementById('form-contacto');
if (formContacto) {
    formContacto.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = formContacto.querySelector('button[type="submit"]');
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const nombre = document.getElementById('con-nombre').value;
        const negocio = document.getElementById('con-negocio').value;
        const email = document.getElementById('con-email').value;
        const telefono = document.getElementById('con-telefono').value;
        const tipo = document.getElementById('con-tipo').value;
        const mensaje = document.getElementById('con-mensaje').value;

        // Generar código único para el cliente
        const codigoCliente = 'CLI-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const timestamp = Date.now();

        try {
            // 1. Guardar contacto
            await set(ref(db, `wlp_contactos/${timestamp}`), {
                nombre: nombre,
                negocio: negocio,
                email: email,
                telefono: telefono,
                tipo: tipo,
                mensaje: mensaje,
                estado: 'nuevo',
                fecha: new Date().toLocaleDateString('es-ES'),
                timestamp: timestamp
            });

            // 2. Crear cliente automáticamente
            await set(ref(db, `wlp_clientes/${timestamp}`), {
                nombre: nombre,
                negocio: negocio,
                email: email,
                telefono: telefono,
                tipo: tipo,
                codigo: codigoCliente,
                estado: 'contacto-inicial',
                timestamp: timestamp
            });

            console.log('✅ Contacto creado y cliente añadido:', codigoCliente);

            formContacto.reset();

            // 3. Mostrar mensaje de éxito con código
            if (document.getElementById('contacto-ok')) {
                const okDiv = document.getElementById('contacto-ok');
                okDiv.innerHTML = `
                    <div style="padding: 20px; background: #d4edda; border: 2px solid #28a745; border-radius: 8px; text-align: center;">
                        <h3 style="color: #155724; margin-top: 0;">✅ ¡Mensaje enviado correctamente!</h3>
                        <p style="color: #155724; margin: 10px 0;">Tu consulta ha sido recibida. Te contactaremos en 24 horas.</p>
                        
                        <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
                            <p style="color: #333; margin: 5px 0;"><strong>Tu código de acceso:</strong></p>
                            <div style="font-size: 1.3rem; font-weight: bold; color: #6366f1; margin: 10px 0; letter-spacing: 2px;">${codigoCliente}</div>
                            <p style="color: #666; font-size: 0.9rem; margin: 10px 0;">Usa este código para acceder a tu panel y ver el estado de tu proyecto.</p>
                        </div>
                        
                        <a href="cliente.html?codigo=${codigoCliente}" class="btn btn-primary" style="display: inline-block; margin-top: 15px; padding: 12px 30px; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            🚀 Entrar a mi panel
                        </a>
                    </div>
                `;
                okDiv.style.display = 'block';

                // Scroll hacia el mensaje
                okDiv.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (err) {
            alert('Error al enviar. Inténtalo de nuevo.');
            console.error(err);
        }

        btn.textContent = 'Enviar mensaje 🚀';
        btn.disabled = false;
    });
}

// =============================================
// PANEL - NAV
// =============================================
document.querySelectorAll('.panel-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.panel-nav-btn').forEach(b => b.classList.remove('activo'));
        document.querySelectorAll('.panel-sec').forEach(s => s.classList.remove('activo'));
        btn.classList.add('activo');
        document.getElementById('sec-' + btn.getAttribute('data-sec')).classList.add('activo');
    });
});

// =============================================
// DATOS GLOBALES
// =============================================
let clientesData = [];
let portfolioData = [];
let blogData = [];
let contactosData = [];
let testimoniosData = [];
let chatClienteActivo = null;

// =============================================
// INICIAR PANEL
// =============================================
function iniciarPanel() {
    console.log('📊 Iniciando panel...');

    // Clientes
    onValue(ref(db, 'wlp_clientes'), snap => {
        const data = snap.val() || {};
        clientesData = Object.entries(data).map(([id, c]) => ({ id, ...c }));
        renderClientes();
        renderChatLista();
        actualizarDashboard();
    });

    // Portfolio
    onValue(ref(db, 'wlp_portfolio'), snap => {
        const data = snap.val() || {};
        portfolioData = Object.entries(data).map(([id, p]) => ({ id, ...p }));
        renderTablaPortfolio();
        actualizarDashboard();
    });

    // Blog
    onValue(ref(db, 'wlp_blog'), snap => {
        const data = snap.val() || {};
        blogData = Object.entries(data).map(([id, b]) => ({ id, ...b }));
        renderTablaBlog();
    });

    // Contactos
    onValue(ref(db, 'wlp_contactos'), snap => {
        const data = snap.val() || {};
        contactosData = Object.entries(data).map(([id, c]) => ({ id, ...c }));
        renderTablaMensajes();
        actualizarDashboard();
    });

    // Testimonios
    onValue(ref(db, 'wlp_testimonios'), snap => {
        const data = snap.val() || {};
        testimoniosData = Object.entries(data).map(([id, t]) => ({ id, ...t }));
        actualizarDashboard();
    });
}

// =============================================
// DASHBOARD
// =============================================
function actualizarDashboard() {
    const el = id => document.getElementById(id);
    if (!el('d-webs')) return;

    const mensajesNuevos = contactosData.filter(c => c.estado === 'nuevo').length;
    const ingresos = clientesData.reduce((a, c) => a + (parseFloat(c.precio) || 0), 0);

    if (el('d-webs')) el('d-webs').textContent = portfolioData.length;
    if (el('d-clientes')) el('d-clientes').textContent = clientesData.length;
    if (el('d-mensajes-nuevos')) el('d-mensajes-nuevos').textContent = mensajesNuevos;
    if (el('d-ingresos')) el('d-ingresos').textContent = ingresos.toFixed(2) + '€';
    if (el('d-contactos')) el('d-contactos').textContent = contactosData.length;
    if (el('d-testimonios')) el('d-testimonios').textContent = testimoniosData.length;

    if (el('dash-ultimos-contactos')) {
        el('dash-ultimos-contactos').innerHTML = contactosData.slice(0, 5).length === 0
            ? '<p style="color:#94a3b8">Sin solicitudes aún</p>'
            : contactosData.slice(0, 5).map(c => `
                <div class="dash-item">
                    <strong>${c.nombre}</strong> - ${c.negocio}
                    <span class="badge badge-${c.estado || 'nuevo'}">${c.estado || 'nuevo'}</span>
                </div>
            `).join('');
    }
}

// =============================================
// CLIENTES
// =============================================
function renderClientes() {
    const grid = document.getElementById('clientes-grid');
    if (!grid) return;

    if (clientesData.length === 0) {
        grid.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1">No hay clientes aún.</p>';
        return;
    }

    grid.innerHTML = clientesData.map(c => `
        <div class="cliente-card">
            <div class="cliente-card-header">
                <span class="cliente-negocio">${c.negocio || '-'}</span>
                <span class="cliente-tipo">${c.tipo || 'web'}</span>
            </div>
            <p class="cliente-info">👤 ${c.nombre || '-'}</p>
            <p class="cliente-info">📧 ${c.email || '-'}</p>
            <p class="cliente-info">📞 ${c.telefono || '-'}</p>
            ${c.url ? `<p class="cliente-info">🌐 <a href="${c.url}" target="_blank">${c.url}</a></p>` : ''}
            ${c.codigo ? `<p class="cliente-info">🔑 ${c.codigo}</p>` : ''}
            <p class="cliente-precio">💰 ${c.precio || 0}€</p>
            <div class="cliente-acciones">
                <button class="btn btn-sm btn-outline" onclick="editarCliente('${c.id}')">✏️</button>
                <button class="btn btn-sm btn-primary" onclick="abrirChatCliente('${c.id}')">💬</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCliente('${c.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function abrirModalCliente(id = null) {
    document.getElementById('modal-cliente').style.display = 'flex';
    document.getElementById('form-cliente').reset();
    if (id) {
        const c = clientesData.find(x => x.id === id);
        if (c) {
            document.getElementById('modal-cliente-titulo').textContent = 'Editar Cliente';
            document.getElementById('cliente-id').value = c.id;
            document.getElementById('c-negocio').value = c.negocio || '';
            document.getElementById('c-nombre').value = c.nombre || '';
            document.getElementById('c-email').value = c.email || '';
            document.getElementById('c-telefono').value = c.telefono || '';
            document.getElementById('c-url').value = c.url || '';
            document.getElementById('c-precio').value = c.precio || '';
            document.getElementById('c-tipo').value = c.tipo || 'profesional';
            document.getElementById('c-codigo').value = c.codigo || '';
        }
    } else {
        document.getElementById('modal-cliente-titulo').textContent = 'Nuevo Cliente';
        document.getElementById('cliente-id').value = '';
    }
}

function editarCliente(id) { abrirModalCliente(id); }
function cerrarModalCliente() { document.getElementById('modal-cliente').style.display = 'none'; }

document.getElementById('form-cliente')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('cliente-id').value;
    const data = {
        negocio: document.getElementById('c-negocio').value,
        nombre: document.getElementById('c-nombre').value,
        email: document.getElementById('c-email').value,
        telefono: document.getElementById('c-telefono').value,
        url: document.getElementById('c-url').value,
        precio: document.getElementById('c-precio').value,
        tipo: document.getElementById('c-tipo').value,
        codigo: document.getElementById('c-codigo').value,
        timestamp: Date.now()
    };

    try {
        if (id) {
            await update(ref(db, `wlp_clientes/${id}`), data);
        } else {
            await set(ref(db, `wlp_clientes/${Date.now()}`), data);
        }
        cerrarModalCliente();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
});

async function eliminarCliente(id) {
    if (!confirm('¿Eliminar?')) return;
    try {
        await remove(ref(db, `wlp_clientes/${id}`));
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// =============================================
// CHAT
// =============================================
function renderChatLista() {
    const lista = document.getElementById('chat-lista');
    if (!lista) return;
    if (clientesData.length === 0) {
        lista.innerHTML = '<p style="padding:20px;color:#94a3b8">Sin clientes</p>';
        return;
    }
    lista.innerHTML = clientesData.map(c => `
        <div class="chat-item ${chatClienteActivo === c.id ? 'activo' : ''}" onclick="abrirChatCliente('${c.id}')">
            <div class="chat-item-nombre">${c.negocio || 'Cliente'}</div>
            <div class="chat-item-preview">${c.nombre || ''}</div>
        </div>
    `).join('');
}

function abrirChatCliente(clienteId) {
    document.querySelectorAll('.panel-nav-btn').forEach(b => b.classList.remove('activo'));
    document.querySelectorAll('.panel-sec').forEach(s => s.classList.remove('activo'));
    const btn = document.querySelector('[data-sec="chats"]');
    if (btn) btn.classList.add('activo');
    const sec = document.getElementById('sec-chats');
    if (sec) sec.classList.add('activo');

    chatClienteActivo = clienteId;
    renderChatLista();

    const cliente = clientesData.find(c => c.id === clienteId);
    const ventana = document.getElementById('chat-ventana');
    ventana.innerHTML = `
        <div class="chat-ventana-header">💬 ${cliente?.negocio || 'Cliente'}</div>
        <div class="chat-mensajes" id="chat-msgs-panel"></div>
        <form class="chat-input-box" id="chat-form-panel">
            <input type="text" id="chat-input-panel" placeholder="Escribe..." required>
            <button type="submit" class="btn btn-primary">Enviar</button>
        </form>
    `;

    onValue(ref(db, `wlp_chats/${clienteId}`), snap => {
        const msgs = document.getElementById('chat-msgs-panel');
        if (!msgs) return;
        const mensajes = snap.val() || {};
        const mList = Object.values(mensajes);

        if (mList.length === 0) {
            msgs.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px">Sin mensajes</div>';
        } else {
            msgs.innerHTML = mList.map(m => `
                <div class="chat-msg ${m.autor === 'admin' ? 'yo' : 'cliente'}">
                    ${m.texto}
                    <div class="chat-msg-meta">${m.hora}</div>
                </div>
            `).join('');
            msgs.scrollTop = msgs.scrollHeight;
        }
    });

    document.getElementById('chat-form-panel').addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('chat-input-panel');
        const texto = input.value.trim();
        if (!texto) return;
        input.value = '';

        try {
            await set(ref(db, `wlp_chats/${clienteId}/${Date.now()}`), {
                texto,
                autor: 'admin',
                hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            });
        } catch (err) {
            console.error(err);
        }
    });
}

// =============================================
// PORTFOLIO
// =============================================
function renderTablaPortfolio() {
    const tbody = document.getElementById('tbody-portfolio');
    if (!tbody) return;
    tbody.innerHTML = portfolioData.length === 0
        ? '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sin proyectos</td></tr>'
        : portfolioData.map(p => `
            <tr>
                <td><strong>${p.nombre || '-'}</strong></td>
                <td>${p.tipo || '-'}</td>
                <td>${p.url ? `<a href="${p.url}" target="_blank">Ver</a>` : '-'}</td>
                <td>${p.precio ? p.precio + '€' : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editarPortfolio('${p.id}')">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarPortfolio('${p.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
}

function abrirModalPortfolio(id = null) {
    document.getElementById('modal-portfolio').style.display = 'flex';
    document.getElementById('form-portfolio').reset();
    document.getElementById('p-id').value = id || '';
    if (id) {
        const p = portfolioData.find(x => x.id === id);
        if (p) {
            document.getElementById('p-nombre').value = p.nombre || '';
            document.getElementById('p-tipo').value = p.tipo || '';
            document.getElementById('p-url').value = p.url || '';
            document.getElementById('p-precio').value = p.precio || '';
            document.getElementById('p-descripcion').value = p.descripcion || '';
        }
    }
}

function editarPortfolio(id) { abrirModalPortfolio(id); }
function cerrarModalPortfolio() { document.getElementById('modal-portfolio').style.display = 'none'; }

document.getElementById('form-portfolio')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const data = {
        nombre: document.getElementById('p-nombre').value,
        tipo: document.getElementById('p-tipo').value,
        url: document.getElementById('p-url').value,
        precio: document.getElementById('p-precio').value,
        descripcion: document.getElementById('p-descripcion').value,
        timestamp: Date.now()
    };

    try {
        if (id) {
            await update(ref(db, `wlp_portfolio/${id}`), data);
        } else {
            await set(ref(db, `wlp_portfolio/${Date.now()}`), data);
        }
        cerrarModalPortfolio();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
});

async function eliminarPortfolio(id) {
    if (!confirm('¿Eliminar?')) return;
    try {
        await remove(ref(db, `wlp_portfolio/${id}`));
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// =============================================
// BLOG
// =============================================
function renderTablaBlog() {
    const tbody = document.getElementById('tbody-blog');
    if (!tbody) return;
    tbody.innerHTML = blogData.length === 0
        ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">Sin artículos</td></tr>'
        : blogData.map(b => `
            <tr>
                <td><strong>${b.emoji || ''} ${b.titulo || '-'}</strong></td>
                <td>${b.categoria || '-'}</td>
                <td>${b.fecha || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editarBlog('${b.id}')">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarBlog('${b.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
}

function abrirModalBlog(id = null) {
    document.getElementById('modal-blog').style.display = 'flex';
    document.getElementById('form-blog').reset();
    document.getElementById('b-id').value = id || '';
    if (id) {
        const b = blogData.find(x => x.id === id);
        if (b) {
            document.getElementById('b-titulo').value = b.titulo || '';
            document.getElementById('b-categoria').value = b.categoria || '';
            document.getElementById('b-emoji').value = b.emoji || '';
            document.getElementById('b-contenido').value = b.contenido || '';
        }
    }
}

function editarBlog(id) { abrirModalBlog(id); }
function cerrarModalBlog() { document.getElementById('modal-blog').style.display = 'none'; }

document.getElementById('form-blog')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('b-id').value;
    const data = {
        titulo: document.getElementById('b-titulo').value,
        categoria: document.getElementById('b-categoria').value,
        emoji: document.getElementById('b-emoji').value,
        contenido: document.getElementById('b-contenido').value,
        fecha: new Date().toLocaleDateString('es-ES'),
        timestamp: Date.now()
    };

    try {
        if (id) {
            await update(ref(db, `wlp_blog/${id}`), data);
        } else {
            await set(ref(db, `wlp_blog/${Date.now()}`), data);
        }
        cerrarModalBlog();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
});

async function eliminarBlog(id) {
    if (!confirm('¿Eliminar?')) return;
    try {
        await remove(ref(db, `wlp_blog/${id}`));
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// =============================================
// CONTACTOS
// =============================================
function renderTablaMensajes() {
    const tbody = document.getElementById('tbody-mensajes');
    if (!tbody) return;
    tbody.innerHTML = contactosData.length === 0
        ? '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">Sin mensajes</td></tr>'
        : contactosData.map(c => `
            <tr>
                <td><strong>${c.nombre || '-'}</strong></td>
                <td>${c.negocio || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.tipo || '-'}</td>
                <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.mensaje || '-'}</td>
                <td><span class="badge badge-${c.estado || 'nuevo'}">${c.estado || 'nuevo'}</span></td>
                <td>
                    ${c.estado === 'nuevo' ? `<button class="btn btn-sm btn-success" onclick="marcarLeido('${c.id}')">✅</button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="eliminarContacto('${c.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
}

async function marcarLeido(id) {
    try {
        await update(ref(db, `wlp_contactos/${id}`), { estado: 'leido' });
    } catch (err) {
        console.error(err);
    }
}

async function eliminarContacto(id) {
    if (!confirm('¿Eliminar?')) return;
    try {
        await remove(ref(db, `wlp_contactos/${id}`));
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// =========================================================================
// ====== PORTAL PRIVADO DE CLIENTES - ACCESO POR CÓDIGO (🔑) ======
// =========================================================================

const formLoginCliente = document.getElementById('form-login-cliente');
if (formLoginCliente) {
    // Verificar si viene código en la URL (?codigo=barberiacruz)
    const urlParams = new URLSearchParams(window.location.search);
    const codigoURL = urlParams.get('codigo');

    if (sessionStorage.getItem('wlp_cliente_id')) {
        mostrarPortalCliente(sessionStorage.getItem('wlp_cliente_id'));
    } else if (codigoURL) {
        console.log('🔐 Intentando login automático con código:', codigoURL);
        (async () => {
            try {
                const snap = await get(ref(db, 'wlp_clientes'));
                const clientes = snap.val() || {};
                const clientesArray = Object.entries(clientes).map(([id, c]) => ({ id, ...c }));
                const cliente = clientesArray.find(c => c.codigo === codigoURL.trim().toLowerCase());

                if (cliente) {
                    console.log('✅ Cliente encontrado:', cliente.negocio);
                    sessionStorage.setItem('wlp_cliente_id', cliente.id);
                    mostrarPortalCliente(cliente.id);
                } else {
                    console.log('❌ Código de URL no válido');
                }
            } catch (err) {
                console.error('Error login automático:', err);
            }
        })();
    }

    // Login mediante el formulario manual
    formLoginCliente.addEventListener('submit', async e => {
        e.preventDefault();
        const codigo = document.getElementById('codigo-acceso').value.trim().toLowerCase();
        const errorDiv = document.getElementById('login-cliente-error');

        if (errorDiv) errorDiv.style.display = 'none';

        try {
            const snap = await get(ref(db, 'wlp_clientes'));
            const clientes = snap.val() || {};
            const clientesArray = Object.entries(clientes).map(([id, c]) => ({ id, ...c }));
            const cliente = clientesArray.find(c => c.codigo === codigo || c.id === codigo);

            if (cliente) {
                sessionStorage.setItem('wlp_cliente_id', cliente.id);
                mostrarPortalCliente(cliente.id);
            } else {
                if (errorDiv) errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error('Error al iniciar sesión de cliente:', err);
        }
    });
}

function cerrarSesionCliente() {
    sessionStorage.removeItem('wlp_cliente_id');
    const loginPantalla = document.getElementById('login-cliente');
    const portalPantalla = document.getElementById('portal-cliente') || document.querySelector('header + div')?.parentElement;

    if (loginPantalla) loginPantalla.style.display = 'flex';
    if (portalPantalla) portalPantalla.style.display = 'none';

    window.location.reload(); // Forzar recarga limpia para resetear estados del DOM
}

async function mostrarPortalCliente(clienteId) {
    const loginPantalla = document.getElementById('login-cliente');
    const portalPantalla = document.getElementById('portal-cliente') || document.querySelector('header + div')?.parentElement;

    if (loginPantalla) loginPantalla.style.display = 'none';
    if (portalPantalla) portalPantalla.style.display = 'block';

    try {
        const snap = await get(ref(db, 'wlp_clientes'));
        const clientes = snap.val() || {};
        const clientesArray = Object.entries(clientes).map(([id, c]) => ({ id, ...c }));
        const cliente = clientesArray.find(c => c.id === clienteId);

        if (!cliente) return;

        // CAMBIO 1: Saludo personalizado con el nombre del DUEÑO (ej: "Marcos")
        if (document.getElementById('cliente-bienvenida')) {
            // Si por algún motivo el campo 'nombre' está vacío, usamos 'negocio' como respaldo de seguridad
            const nombreSaludo = cliente.nombre ? cliente.nombre.split(' ')[0] : (cliente.negocio || 'Cliente');
            document.getElementById('cliente-bienvenida').textContent = `¡Bienvenido/a, ${nombreSaludo}! 👋`;
        }

        // Pintar información del proyecto
        if (document.getElementById('cliente-web-info')) {
            document.getElementById('cliente-web-info').innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 25px; border: 1px solid var(--border); margin-bottom: 25px;">
                    <h3 style="margin-bottom: 15px; color: var(--dark)">🖥️ Estado de tu Proyecto</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div>
                            <span style="color: var(--gray); font-size: 0.85rem; display:block;">NEGOCIO / COMPAÑÍA</span>
                            <strong style="color: var(--dark)">${cliente.negocio || 'No definido'}</strong>
                        </div>
                        <div>
                            <span style="color: var(--gray); font-size: 0.85rem; display:block;">PLAN / SERVICIO</span>
                            <strong style="text-transform: uppercase; color: var(--primary)">${cliente.tipo || cliente.plan || 'Plan Web'}</strong>
                        </div>
                        <div>
                            <span style="color: var(--gray); font-size: 0.85rem; display:block;">ENLACE DE ACCESO</span>
                            ${(cliente.url || cliente.urlWeb) ?
                    `<a href="${cliente.url || cliente.urlWeb}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: bold;">Ver mi Web ↗</a>`
                    : '<span style="color:var(--gray); font-style: italic;">Tu web estará disponible pronto...</span>'
                }
                        </div>
                    </div>
                </div>
            `;
        }

        // CAMBIO 2: Lógica Dinámica del nuevo módulo de Suscripción y Facturación
        const facturacionBox = document.getElementById('cliente-facturacion-box');
        // Activamos la visibilidad si el cliente tiene datos de facturación asignados
        if (facturacionBox && (cliente.proximoPago || cliente.facturaUrl)) {
            facturacionBox.style.display = 'block';

            if (document.getElementById('factura-fecha')) {
                document.getElementById('factura-fecha').innerText = cliente.proximoPago || 'Pendiente';
            }
            if (document.getElementById('factura-metodo')) {
                document.getElementById('factura-metodo').innerText = `Método: ${cliente.metodoPago || 'Transferencia'}`;
            }

            const linkFactura = document.getElementById('factura-link');
            if (linkFactura) {
                if (cliente.facturaUrl) {
                    linkFactura.href = cliente.facturaUrl;
                    linkFactura.style.pointerEvents = 'auto';
                    linkFactura.style.opacity = '1';
                    linkFactura.innerText = '📄 Descargar PDF';
                } else {
                    linkFactura.style.pointerEvents = 'none';
                    linkFactura.style.opacity = '0.5';
                    linkFactura.innerText = '⏳ Procesando...';
                }
            }
        }

        // =====================================================================
        // CONTROL DINÁMICO DE TAREAS, BARRA DE PROGRESO Y TUTORIALES
        // =====================================================================
        const tareasRef = ref(db, `wlp_clientes/${clienteId}/entregas`);

        onValue(tareasRef, (snapshot) => {
            const entregas = snapshot.val() || {};
            const totalTareas = 3;
            let tareasCompletadasCount = 0;

            for (let i = 1; i <= totalTareas; i++) {
                const itemDiv = document.getElementById(`item-tarea${i}`);
                const formTarea = document.getElementById(`form-tarea${i}`);
                const inputTarea = document.getElementById(`input-tarea${i}`);

                if (entregas[`tarea${i}`]) {
                    tareasCompletadasCount++;

                    if (itemDiv) {
                        itemDiv.style.borderLeft = "4px solid var(--success)";
                        itemDiv.style.background = "#f0fdf4";
                    }
                    if (formTarea) {
                        formTarea.innerHTML = `
                            <span style="color: var(--success); font-weight: bold; font-size: 0.95rem; display: flex; align-items: center; gap: 5px;">
                                Enlace registrado con éxito ── <a href="${entregas[`tarea${i}`]}" target="_blank" style="color: var(--primary); text-decoration: underline;">Ver material enviado ↗</a>
                            </span>
                        `;
                    }
                } else {
                    if (formTarea && inputTarea) {
                        formTarea.onsubmit = async (e) => {
                            e.preventDefault();
                            const enlaceUrl = inputTarea.value.trim();
                            if (!enlaceUrl) return;

                            try {
                                await update(ref(db, `wlp_clientes/${clienteId}/entregas`), {
                                    [`tarea${i}`]: enlaceUrl
                                });

                                await set(ref(db, `wlp_chats/${clienteId}/${Date.now()}`), {
                                    texto: `🤖 *Sistema:* He enviado el material para el paso ${i}: ${enlaceUrl}`,
                                    autor: 'cliente',
                                    hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                                    timestamp: Date.now()
                                });

                            } catch (err) {
                                console.error(`Error al guardar la tarea ${i}:`, err);
                            }
                        };
                    }
                }
            }

            const porcentaje = Math.round((tareasCompletadasCount / totalTareas) * 100);
            const barra = document.getElementById('barra-progreso-cliente');
            const textoProgreso = document.getElementById('texto-progreso-cliente');
            const seccionTutoriales = document.getElementById('seccion-tutoriales-cliente');

            if (barra) barra.style.width = `${porcentaje}%`;
            if (textoProgreso) {
                textoProgreso.innerText = `${porcentaje}% Completado (${tareasCompletadasCount}/${totalTareas})`;
                textoProgreso.style.color = porcentaje > 45 ? "white" : "var(--dark)";
            }

            if (porcentaje === 100 && seccionTutoriales) {
                seccionTutoriales.style.display = "block";
            }
        });

        // Suscribirse al Chat en Tiempo Real (Manteniendo tu estructura intacta)
        const chatRef = ref(db, `wlp_chats/${clienteId}`);
        onValue(chatRef, snap => {
            const msgsContenedor = document.getElementById('chat-mensajes-cliente');
            if (!msgsContenedor) return;

            const mensajes = snapshot.val() || {};
            const mList = Object.values(mensajes);

            if (mList.length === 0) {
                msgsContenedor.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px">No hay mensajes aún. ¡Escríbeme cualquier duda!</div>';
            } else {
                msgsContenedor.innerHTML = mList.map(m => {
                    const esMiMensaje = m.autor === 'cliente';
                    return `
                        <div class="chat-msg ${esMiMensaje ? 'yo' : 'cliente'}" 
                             style="display: flex; flex-direction: column; align-items: ${esMiMensaje ? 'flex-end' : 'flex-start'}; margin-bottom: 10px;">
                            <div style="background: ${esMiMensaje ? 'var(--primary)' : '#f1f5f9'}; 
                                        color: ${esMiMensaje ? 'white' : 'var(--dark)'}; 
                                        padding: 10px 15px; 
                                        border-radius: 12px; 
                                        max-width: 70%;
                                        box-shadow: 0 1px 2px rgba(0,0,0,0.05)">
                                <p style="margin: 0; font-size: 0.95rem;">${m.texto}</p>
                                <div class="chat-msg-meta" style="font-size: 0.7rem; opacity: 0.6; text-align: right; margin-top: 4px; color: ${esMiMensaje ? 'white' : 'var(--gray)'}">
                                    ${m.hora || ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                msgsContenedor.scrollTop = msgsContenedor.scrollHeight;
            }
        });

        // Configurar el envío de mensajes del chat
        const formChat = document.getElementById('form-chat-cliente');
        if (formChat) {
            formChat.onsubmit = async e => {
                e.preventDefault();
                const input = document.getElementById('chat-input-cliente');
                if (!input) return;

                const texto = input.value.trim();
                if (!texto) return;
                input.value = '';

                try {
                    await set(ref(db, `wlp_chats/${clienteId}/${Date.now()}`), {
                        texto,
                        autor: 'cliente',
                        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: Date.now()
                    });
                } catch (err) {
                    console.error('Error al enviar mensaje:', err);
                }
            };
        }

    } catch (err) {
        console.error('Error cargando datos del portal:', err);
    }
}

// Cerrar modales genéricos al hacer click fuera
window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
});

// =============================================
// FORMULARIOS DINÁMICOS POR PLAN
// =============================================
let planSeleccionado = 'professional';

function cambiarFormularioPorPlan(plan) {
    planSeleccionado = plan;
    const form = document.getElementById('form-contacto');

    // Limpiar formulario
    form.innerHTML = '';

    let html = '';

    if (plan === 'essential') {
        html = `
      <div class="form-group">
        <label>Tu nombre *</label>
        <input type="text" id="con-nombre" placeholder="Juan García" required>
      </div>
      <div class="form-group">
        <label>Tu email *</label>
        <input type="email" id="con-email" placeholder="tu@email.com" required>
      </div>
      <div class="form-group">
        <label>Tu teléfono *</label>
        <input type="tel" id="con-telefono" placeholder="+34 600 000 000" required>
      </div>
      <div class="form-group">
        <label>Tu negocio *</label>
        <input type="text" id="con-negocio" placeholder="Barbería, restaurante..." required>
      </div>
      <div class="form-group">
        <label>Cuéntame sobre tu proyecto *</label>
        <textarea id="con-mensaje" rows="4" placeholder="¿Qué necesitas?" required></textarea>
      </div>
    `;
    } else if (plan === 'professional') {
        html = `
      <div class="form-row">
        <div class="form-group">
          <label>Tu nombre *</label>
          <input type="text" id="con-nombre" placeholder="Juan García" required>
        </div>
        <div class="form-group">
          <label>Tu negocio *</label>
          <input type="text" id="con-negocio" placeholder="Barbería, restaurante..." required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" id="con-email" placeholder="tu@email.com" required>
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input type="tel" id="con-telefono" placeholder="+34 600 000 000">
        </div>
      </div>
      <div class="form-group">
        <label>Tipo de servicio *</label>
        <input type="text" id="con-tipo" placeholder="Diseño gráfico, consultoría..." required>
      </div>
      <div class="form-group">
        <label>Presupuesto aproximado (€)</label>
        <input type="number" id="con-presupuesto" placeholder="250-500">
      </div>
      <div class="form-group">
        <label>Cuéntame tu proyecto *</label>
        <textarea id="con-mensaje" rows="4" placeholder="Describe tu proyecto en detalle..." required></textarea>
      </div>
    `;
    } else if (plan === 'enterprise') {
        html = `
      <div class="form-row">
        <div class="form-group">
          <label>Tu nombre *</label>
          <input type="text" id="con-nombre" required>
        </div>
        <div class="form-group">
          <label>Tu negocio *</label>
          <input type="text" id="con-negocio" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" id="con-email" required>
        </div>
        <div class="form-group">
          <label>Teléfono *</label>
          <input type="tel" id="con-telefono" required>
        </div>
      </div>
      <div class="form-group">
        <label>Tipo de servicio *</label>
        <input type="text" id="con-tipo" required>
      </div>
      <div class="form-group">
        <label>Descripción detallada del proyecto *</label>
        <textarea id="con-descripcion" rows="4" placeholder="Cuéntame todo sobre tu proyecto..." required></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Presupuesto aproximado (€) *</label>
          <input type="number" id="con-presupuesto" required>
        </div>
        <div class="form-group">
          <label>¿Cuándo lo necesitas? *</label>
          <select id="con-timeline" required>
            <option value="">Selecciona</option>
            <option value="asap">ASAP (Urgente)</option>
            <option value="1semana">1 semana</option>
            <option value="2semanas">2 semanas</option>
            <option value="sinprisa">Sin prisa</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Notas adicionales</label>
        <textarea id="con-mensaje" rows="3" placeholder="Cualquier otra cosa..."></textarea>
      </div>
    `;
    }

    html += `
    <input type="hidden" id="con-plan" value="${plan}">
    <button type="submit" class="btn btn-primary" style="width:100%">Enviar solicitud 🚀</button>
    <div id="contacto-ok" style="display:none" class="form-ok"></div>
  `;

    form.innerHTML = html;

    // Re-vincular evento submit
    form.addEventListener('submit', enviarContacto);
}

async function enviarContacto(e) {
    e.preventDefault();
    const btn = document.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const plan = document.getElementById('con-plan').value;
    const nombre = document.getElementById('con-nombre').value;
    const negocio = document.getElementById('con-negocio').value;
    const email = document.getElementById('con-email').value;
    const telefono = document.getElementById('con-telefono').value || '';
    const tipo = document.getElementById('con-tipo').value || '';
    const presupuesto = document.getElementById('con-presupuesto')?.value || '';
    const descripcion = document.getElementById('con-descripcion')?.value || '';
    const timeline = document.getElementById('con-timeline')?.value || '';
    const mensaje = document.getElementById('con-mensaje').value;

    const codigoCliente = 'CLI-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const timestamp = Date.now();

    try {
        await set(ref(db, `wlp_contactos/${timestamp}`), {
            nombre, negocio, email, telefono, tipo, presupuesto,
            descripcion, timeline, mensaje, plan,
            estado: 'nuevo',
            fecha: new Date().toLocaleDateString('es-ES'),
            timestamp
        });

        await set(ref(db, `wlp_clientes/${timestamp}`), {
            nombre, negocio, email, telefono, tipo, plan,
            codigo: codigoCliente,
            estado: 'contacto-inicial',
            timestamp
        });

        const okDiv = document.getElementById('contacto-ok');
        okDiv.innerHTML = `
      <div style="padding: 20px; background: #d4edda; border: 2px solid #28a745; border-radius: 8px; text-align: center;">
        <h3 style="color: #155724; margin-top: 0;">✅ ¡Mensaje enviado!</h3>
        <p style="color: #155724;">Tu código: <strong>${codigoCliente}</strong></p>
        <a href="cliente.html?codigo=${codigoCliente}" class="btn btn-primary" style="display: inline-block; margin-top: 15px;">🚀 Entrar a tu panel</a>
      </div>
    `;
        okDiv.style.display = 'block';
        okDiv.scrollIntoView({ behavior: 'smooth' });

        document.getElementById('form-contacto').reset();
    } catch (err) {
        alert('Error: ' + err.message);
    }

    btn.textContent = 'Enviar solicitud 🚀';
    btn.disabled = false;
}

// Inicializar con Professional por defecto
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('form-contacto')) {
        cambiarFormularioPorPlan('professional');
    }
});

function abrirModalTestimonio(id = null) {
    document.getElementById('modal-testimonio').style.display = 'flex';
    document.getElementById('form-testimonio').reset();
    if (id) {
        const t = testimoniosData.find(x => x.id === id);
        if (t) {
            document.getElementById('modal-testimonio-titulo').textContent = 'Editar Testimonio';
            document.getElementById('t-id').value = t.id;
            document.getElementById('t-nombre').value = t.nombre || '';
            document.getElementById('t-negocio').value = t.negocio || '';
            document.getElementById('t-estrellas').value = t.estrellas || '5';
            document.getElementById('t-texto').value = t.texto || '';
            document.getElementById('t-descripcion').value = t.descripcion || '';
        }
    } else {
        document.getElementById('modal-testimonio-titulo').textContent = 'Nuevo Testimonio';
        document.getElementById('t-id').value = '';
    }
}

function cerrarModalTestimonio() {
    document.getElementById('modal-testimonio').style.display = 'none';
}

document.getElementById('form-testimonio')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('t-id').value;
    const data = {
        nombre: document.getElementById('t-nombre').value,
        negocio: document.getElementById('t-negocio').value,
        estrellas: parseInt(document.getElementById('t-estrellas').value),
        texto: document.getElementById('t-texto').value,
        descripcion: document.getElementById('t-descripcion').value,
        timestamp: Date.now()
    };

    try {
        if (id) {
            await update(ref(db, `wlp_testimonios/${id}`), data);
        } else {
            await set(ref(db, `wlp_testimonios/${Date.now()}`), data);
        }
        cerrarModalTestimonio();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
});

// =========================================================================
// ====== MÓDULO DE CONFIGURACIÓN ADICIONAL - WEBLOCALPRO (⚙️) ======
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const btnConfig = document.getElementById('btn-nav-configuracion');
    if (btnConfig) {
        btnConfig.addEventListener('click', () => {
            document.querySelectorAll('.panel-nav-btn').forEach(b => b.classList.remove('activo'));
            document.querySelectorAll('.panel-sec').forEach(s => s.classList.remove('activo'));

            btnConfig.classList.add('activo');
            const secConfig = document.getElementById('sec-configuracion');
            if (secConfig) secConfig.classList.add('activo');
        });
    }

    const cpPrimario = document.getElementById('conf-color-primario');
    const cpSecundario = document.getElementById('conf-color-secundario');
    if (cpPrimario) cpPrimario.addEventListener('input', actualizarPreviewColoresWLP);
    if (cpSecundario) cpSecundario.addEventListener('input', actualizarPreviewColoresWLP);

    // Inicializar si la base de datos 'db' está lista
    if (typeof db !== 'undefined') {
        initFirebaseConfiguracionWLP();
    }

    initFormulariosConfiguracion();
    initManejadorBackups();
});

/**
 * Escucha reactiva utilizando el método 'onValue' modular de Firebase v10
 */
function initFirebaseConfiguracionWLP() {
    const dbRef = ref(db, 'wlp_configuracion');

    onValue(dbRef, (snapshot) => {
        const config = snapshot.val();
        if (!config) return;

        // Mapeo General
        if (config.general) {
            document.getElementById('conf-empresa').value = config.general.nombre || '';
            document.getElementById('conf-slogan').value = config.general.slogan || '';
            document.getElementById('conf-email').value = config.general.email || '';
            document.getElementById('conf-telefono').value = config.general.telefono || '';
            document.getElementById('conf-direccion').value = config.general.direccion || '';
            document.getElementById('conf-web').value = config.general.web || '';
        }

        // Mapeo Branding
        if (config.branding) {
            document.getElementById('conf-logo').value = config.branding.logoUrl || '';
            document.getElementById('conf-favicon').value = config.branding.faviconUrl || '';
            document.getElementById('conf-color-primario').value = config.branding.colorPrimario || '#1a73e8';
            document.getElementById('conf-color-secundario').value = config.branding.colorSecundario || '#34d399';
            actualizarPreviewColoresWLP();
        }

        // Mapeo Precios y Planes
        if (config.planes) {
            if (config.planes.essential) {
                document.getElementById('plan-essential-nombre').value = config.planes.essential.nombre || 'Essential';
                document.getElementById('plan-essential-precio').value = config.planes.essential.precio || '';
                document.getElementById('plan-essential-caracteristicas').value = Array.isArray(config.planes.essential.caracteristicas) ? config.planes.essential.caracteristicas.join('\n') : '';
            }
            if (config.planes.professional) {
                document.getElementById('plan-professional-nombre').value = config.planes.professional.nombre || 'Professional';
                document.getElementById('plan-professional-precio').value = config.planes.professional.precio || '';
                document.getElementById('plan-professional-caracteristicas').value = Array.isArray(config.planes.professional.caracteristicas) ? config.planes.professional.caracteristicas.join('\n') : '';
            }
            if (config.planes.enterprise) {
                document.getElementById('plan-enterprise-nombre').value = config.planes.enterprise.nombre || 'Enterprise';
                document.getElementById('plan-enterprise-precio').value = config.planes.enterprise.precio || '';
                document.getElementById('plan-enterprise-caracteristicas').value = Array.isArray(config.planes.enterprise.caracteristicas) ? config.planes.enterprise.caracteristicas.join('\n') : '';
            }
        }

        // Mapeo Contacto y Redes
        if (config.redes) {
            document.getElementById('conf-whatsapp').value = config.redes.whatsapp || '';
            document.getElementById('conf-instagram').value = config.redes.instagram || '';
            document.getElementById('conf-facebook').value = config.redes.facebook || '';
            document.getElementById('conf-tiktok').value = config.redes.tiktok || '';
            document.getElementById('conf-linkedin').value = config.redes.linkedin || '';
        }
    });

    const txtAcceso = document.getElementById('conf-ultimo-acceso');
    if (txtAcceso) {
        txtAcceso.innerText = new Date().toLocaleString('es-ES');
    }
}

function actualizarPreviewColoresWLP() {
    const p = document.getElementById('conf-color-primario').value;
    const s = document.getElementById('conf-color-secundario').value;

    if (document.getElementById('preview-primario')) document.getElementById('preview-primario').style.backgroundColor = p;
    if (document.getElementById('preview-secundario')) document.getElementById('preview-secundario').style.backgroundColor = s;
}

/**
 * Escritura estructurada utilizando el método 'set' modular de Firebase v10
 */
function initFormulariosConfiguracion() {
    // Formulario General
    const fGeneral = document.getElementById('form-config-general');
    if (fGeneral) {
        fGeneral.addEventListener('submit', (e) => {
            e.preventDefault();
            set(ref(db, 'wlp_configuracion/general'), {
                nombre: document.getElementById('conf-empresa').value,
                slogan: document.getElementById('conf-slogan').value,
                email: document.getElementById('conf-email').value,
                telefono: document.getElementById('conf-telefono').value,
                direccion: document.getElementById('conf-direccion').value,
                web: document.getElementById('conf-web').value
            }).then(() => alert('⚙️ Información general almacenada correctamente.'))
                .catch(err => console.error('Error:', err));
        });
    }

    // Formulario Branding
    const fBranding = document.getElementById('form-config-branding');
    if (fBranding) {
        fBranding.addEventListener('submit', (e) => {
            e.preventDefault();
            set(ref(db, 'wlp_configuracion/branding'), {
                logoUrl: document.getElementById('conf-logo').value,
                faviconUrl: document.getElementById('conf-favicon').value,
                colorPrimario: document.getElementById('conf-color-primario').value,
                colorSecundario: document.getElementById('conf-color-secundario').value
            }).then(() => alert('🎨 Configuración de apariencia actualizada.'))
                .catch(err => console.error('Error:', err));
        });
    }

    // Formulario Precios y Planes
    const fPlanes = document.getElementById('form-config-planes');
    if (fPlanes) {
        fPlanes.addEventListener('submit', (e) => {
            e.preventDefault();
            const parsearLineas = (id) => document.getElementById(id).value.split('\n').map(l => l.trim()).filter(l => l !== '');

            set(ref(db, 'wlp_configuracion/planes'), {
                essential: {
                    nombre: document.getElementById('plan-essential-nombre').value,
                    precio: document.getElementById('plan-essential-precio').value,
                    caracteristicas: parsearLineas('plan-essential-caracteristicas')
                },
                professional: {
                    nombre: document.getElementById('plan-professional-nombre').value,
                    precio: document.getElementById('plan-professional-precio').value,
                    caracteristicas: parsearLineas('plan-professional-caracteristicas')
                },
                enterprise: {
                    nombre: document.getElementById('plan-enterprise-nombre').value,
                    precio: document.getElementById('plan-enterprise-precio').value,
                    caracteristicas: parsearLineas('plan-enterprise-caracteristicas')
                }
            }).then(() => alert('💰 Tabla de precios y planes guardada.'))
                .catch(err => console.error('Error:', err));
        });
    }

    // Formulario Contacto y Redes
    const fRedes = document.getElementById('form-config-redes');
    if (fRedes) {
        fRedes.addEventListener('submit', (e) => {
            e.preventDefault();
            set(ref(db, 'wlp_configuracion/redes'), {
                whatsapp: document.getElementById('conf-whatsapp').value,
                instagram: document.getElementById('conf-instagram').value,
                facebook: document.getElementById('conf-facebook').value,
                tiktok: document.getElementById('conf-tiktok').value,
                linkedin: document.getElementById('conf-linkedin').value
            }).then(() => alert('🌐 Enlaces de redes sociales actualizados.'))
                .catch(err => console.error('Error:', err));
        });
    }
}

function initManejadorBackups() {
    const vincularBackup = (btnId, nodoFirebase) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => procesarExportacionColeccion(nodoFirebase));
        }
    };

    vincularBackup('btn-backup-clientes', 'wlp_clientes'); // Ajustado al prefijo real si lo usas
    vincularBackup('btn-backup-contactos', 'wlp_contactos');
    vincularBackup('btn-backup-portfolio', 'wlp_portfolio');
    vincularBackup('btn-backup-blog', 'wlp_blog');
}

/**
 * Lectura única mediante 'get' modular para exportar los Backups
 */
function procesarExportacionColeccion(coleccion) {
    get(ref(db, coleccion)).then((snapshot) => {
        const objetoDatos = snapshot.val() || {};

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objetoDatos, null, 2));
        const triggerDescarga = document.createElement('a');

        triggerDescarga.setAttribute("href", dataStr);
        triggerDescarga.setAttribute("download", `wlp_backup_${coleccion}_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(triggerDescarga);

        triggerDescarga.click();
        triggerDescarga.remove();

        const bannerExito = document.getElementById('msg-backup-exito');
        if (bannerExito) {
            bannerExito.innerText = `¡Copia de seguridad de la colección "${coleccion.toUpperCase()}" exportada!`;
            bannerExito.style.display = 'block';
            setTimeout(() => { bannerExito.style.display = 'none'; }, 4000);
        }
    }).catch(err => {
        console.error('Error en backup:', err);
        alert('No se pudo procesar la descarga de la base de datos.');
    });
}

function cerrarSesion() {
    signOut(auth).then(() => {
        console.log('Sesión cerrada correctamente. Volviendo al login...');
        // Opcional: limpiar los inputs del formulario
        if (document.getElementById('form-login')) {
            document.getElementById('form-login').reset();
        }
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
}

// =========================================================================
// ====== CONEXIÓN DINÁMICA DE LA LANDING PÚBLICA (🌐) ======
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Detectamos si estamos en la landing comprobando si existe la sección de inicio
    const esLandingPublica = document.getElementById('inicio');

    if (esLandingPublica && typeof db !== 'undefined') {
        console.log('🌐 Cargando datos dinámicos en la Landing pública...');
        cargarConfiguracionLanding();
    }
});

function cargarConfiguracionLanding() {
    const configRef = ref(db, 'wlp_configuracion');

    onValue(configRef, (snapshot) => {
        const config = snapshot.val();
        if (!config) return;

        // 1. Aplicar Branding y Colores en tiempo real a las variables CSS (:root)
        if (config.branding) {
            if (config.branding.colorPrimario) {
                document.documentElement.style.setProperty('--primary', config.branding.colorPrimario);
            }
            if (config.branding.colorSecundario) {
                document.documentElement.style.setProperty('--secondary', config.branding.colorSecundario);
            }
            // Cambiar Favicon dinámicamente si existe el elemento
            const favicon = document.querySelector("link[rel*='icon']");
            if (favicon && config.branding.faviconUrl) {
                favicon.href = config.branding.faviconUrl;
            }
        }

        // 2. Actualizar Textos Generales (Nombre, Eslogan, etc.)
        if (config.general) {
            if (config.general.slogan) {
                const heroSlogan = document.getElementById('hero-slogan') || document.querySelector('.hero-content h1');
                if (heroSlogan) heroSlogan.innerText = config.general.slogan;
            }

            // Actualizar todos los textos de logo del sitio
            document.querySelectorAll('.logo-text').forEach(logo => {
                logo.innerHTML = `${config.general.nombre || 'WebLocal'}<span class="logo-pro" style="color:var(--secondary)">Pro</span>`;
            });
        }

        // 3. Renderizar la Tabla de Precios Dinámica
        if (config.planes) {
            actualizarPlanesLanding(config.planes);
        }

        // 4. Actualizar Enlaces de Redes Sociales y Contacto
        if (config.redes) {
            configurarRedesLanding(config.redes);
        }
    });
}

/**
 * Inyecta las características y precios guardados en el panel dentro de las tarjetas de la landing
 */
function actualizarPlanesLanding(planes) {
    const mapeoPlanes = {
        'essential': planes.essential,
        'professional': planes.professional,
        'enterprise': planes.enterprise
    };

    Object.keys(mapeoPlanes).forEach(idPlan => {
        const datos = mapeoPlanes[idPlan];
        if (!datos) return;

        // Buscamos la tarjeta correspondiente por una clase o ID (ej: .card-essential, #plan-essential)
        const tarjeta = document.querySelector(`.card-${idPlan}`) || document.getElementById(`plan-${idPlan}`);
        if (!tarjeta) return;

        // Actualizar Título y Precio
        const txtTitulo = tarjeta.querySelector('h3');
        const txtPrecio = tarjeta.querySelector('.precio, .price');
        const listaFeatures = tarjeta.querySelector('ul');

        if (txtTitulo) txtTitulo.innerText = datos.nombre;
        if (txtPrecio) txtPrecio.innerHTML = `${datos.precio}<span>€/mes</span>`;

        // Limpar y renderizar lista de características
        if (listaFeatures && Array.isArray(datos.caracteristicas)) {
            listaFeatures.innerHTML = '';
            datos.caracteristicas.forEach(feat => {
                const li = document.createElement('li');
                li.innerHTML = `✓ ${feat}`;
                listaFeatures.appendChild(li);
            });
        }
    });
}

/**
 * Mapea los botones y enlaces de redes del footer y del botón flotante de WhatsApp
 */
function configurarRedesLanding(redes) {
    // Ejemplo para enlazar el botón de WhatsApp flotante si tienes uno
    const btnWpp = document.querySelector('.btn-whatsapp') || document.getElementById('link-whatsapp');
    if (btnWpp && redes.whatsapp) {
        btnWpp.href = `https://wa.me/${redes.whatsapp.replace(/\s+/g, '')}`;
    }

    // Enlaces del Footer
    const linkInsta = document.getElementById('footer-instagram');
    if (linkInsta && redes.instagram) linkInsta.href = redes.instagram;

    const linkFb = document.getElementById('footer-facebook');
    if (linkFb && redes.facebook) linkFb.href = redes.facebook;

    const linkTk = document.getElementById('footer-tiktok');
    if (linkTk && redes.tiktok) linkTk.href = redes.tiktok;

    const linkLn = document.getElementById('footer-linkedin');
    if (linkLn && redes.linkedin) linkLn.href = redes.linkedin;
}

/**
 * Genera y permite exportar una factura para un cliente
 */
function generarFactura(clienteId, concepto, monto, numero) {
    // 1. Rellenar los campos de la plantilla
    document.getElementById('fac-num').innerText = `Factura #${numero}`;
    document.getElementById('fac-fecha').innerText = new Date().toLocaleDateString();
    document.getElementById('fac-concepto').innerText = concepto;
    document.getElementById('fac-monto').innerText = `${monto}€`;
    document.getElementById('fac-total').innerText = monto;

    // Obtenemos el nombre del cliente desde la base de datos o local
    const clienteNombre = document.getElementById('nombre-cliente-seleccionado')?.innerText || "Cliente";
    document.getElementById('fac-cliente').innerText = clienteNombre;

    // 2. Mostrar plantilla, imprimir y ocultar
    const plantilla = document.getElementById('plantilla-factura');
    plantilla.style.display = 'block';

    window.print(); // Abre el diálogo de impresión para guardar como PDF

    plantilla.style.display = 'none';
}

// Cargar Facturas en el Panel
async function cargarFacturas() {
    const tbody = document.getElementById('lista-facturas-body');
    const snap = await get(ref(db, 'wlp_facturas'));
    const facturas = snap.val() || {};

    tbody.innerHTML = Object.entries(facturas).map(([id, f]) => `
        <tr>
            <td style="padding:15px;">${new Date(f.fecha).toLocaleDateString()}</td>
            <td style="padding:15px;">${f.clienteNombre}</td>
            <td style="padding:15px;">${f.concepto}</td>
            <td style="padding:15px; text-align:right;"><strong>${f.monto}€</strong></td>
            <td style="padding:15px; text-align:center;">
                <button onclick="imprimirFactura('${id}')">🖨️ PDF</button>
            </td>
        </tr>
    `).join('');
}

// Guardar nueva factura
async function guardarFactura() {
    const nuevaFactura = {
        clienteNombre: document.getElementById('fac-cliente-nombre').value,
        concepto: document.getElementById('fac-concepto').value,
        monto: document.getElementById('fac-monto').value,
        fecha: Date.now()
    };

    await push(ref(db, 'wlp_facturas'), nuevaFactura);
    document.getElementById('modal-factura').style.display = 'none';
    cargarFacturas();
}

// Abrir el modal de nueva factura
window.abrirModalFactura = () => {
    const modal = document.getElementById('modal-factura');
    if (modal) modal.style.display = 'block';
};

// Cerrar el modal (útil para el botón de Cancelar)
window.cerrarModalFactura = () => {
    document.getElementById('modal-factura').style.display = 'none';
};

// Guardar y limpiar formulario
window.guardarFactura = async () => {
    const nuevaFactura = {
        clienteNombre: document.getElementById('fac-cliente-nombre').value,
        concepto: document.getElementById('fac-concepto').value,
        monto: document.getElementById('fac-monto').value,
        fecha: Date.now()
    };

    if (!nuevaFactura.clienteNombre || !nuevaFactura.monto) {
        alert("Por favor, rellena al menos el cliente y el importe.");
        return;
    }

    try {
        await push(ref(db, 'wlp_facturas'), nuevaFactura);

        // Limpiar campos después de guardar
        document.getElementById('fac-cliente-nombre').value = '';
        document.getElementById('fac-concepto').value = '';
        document.getElementById('fac-monto').value = '';

        // Cerrar y refrescar
        window.cerrarModalFactura();
        cargarFacturas();
        console.log("✅ Factura guardada correctamente");
    } catch (err) {
        console.error("Error al guardar factura:", err);
    }
};

// =============================================
// EXPONER FUNCIONES GLOBALES
// =============================================
window.abrirModalCliente = abrirModalCliente;
window.cerrarModalCliente = cerrarModalCliente;
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.abrirChatCliente = abrirChatCliente;
window.abrirModalPortfolio = abrirModalPortfolio;
window.cerrarModalPortfolio = cerrarModalPortfolio;
window.editarPortfolio = editarPortfolio;
window.eliminarPortfolio = eliminarPortfolio;
window.abrirModalBlog = abrirModalBlog;
window.cerrarModalBlog = cerrarModalBlog;
window.editarBlog = editarBlog;
window.eliminarBlog = eliminarBlog;
window.marcarLeido = marcarLeido;
window.eliminarContacto = eliminarContacto;
window.cerrarSesion = cerrarSesion;
window.cerrarSesionCliente = cerrarSesionCliente;
window.abrirTestimonioCompleto = abrirTestimonioCompleto;
window.abrirModalTestimonio = abrirModalTestimonio;
window.cerrarModalTestimonio = cerrarModalTestimonio;
window.abrirArticuloBlog = abrirArticuloBlog;

console.log('✅ WebLocal Pro - Script completo cargado');