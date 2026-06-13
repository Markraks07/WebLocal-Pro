// =============================================
// FIREBASE CONFIG - REALTIME DATABASE
// =============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getDatabase, ref, set, get, child, update, remove, onValue, push
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

console.log('✅ Firebase Realtime DB inicializado');

// =============================================
// ADMIN CREDENTIALS
// =============================================
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'weblocalpro2026';

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
    const iconos = { barberia:'💈', restaurante:'🍽️', ecommerce:'🛒', otro:'🌐' };

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
            </div>
        `).join('');
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
            <div class="blog-card">
                <div class="blog-card-top">${b.emoji || '📝'}</div>
                <div class="blog-card-body">
                    <span class="blog-tag">${b.categoria}</span>
                    <h3>${b.titulo}</h3>
                    <p>${(b.contenido || '').substring(0, 100)}...</p>
                    <span class="blog-fecha">${b.fecha}</span>
                </div>
            </div>
        `).join('');
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
// PANEL ADMIN - LOGIN
// =============================================
const formLogin = document.getElementById('form-login');
if (formLogin) {
    if (sessionStorage.getItem('wlp_admin') === 'true') mostrarPanel();

    formLogin.addEventListener('submit', e => {
        e.preventDefault();
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        if (u === ADMIN_USER && p === ADMIN_PASS) {
            sessionStorage.setItem('wlp_admin', 'true');
            mostrarPanel();
        } else {
            if (document.getElementById('login-error')) {
                document.getElementById('login-error').style.display = 'block';
            }
        }
    });
}

function cerrarSesion() {
    sessionStorage.removeItem('wlp_admin');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('panel').style.display = 'none';
}

function mostrarPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('panel').style.display = 'block';
    iniciarPanel();
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

// =============================================
// PORTAL CLIENTE - LOGIN
// =============================================
const formLoginCliente = document.getElementById('form-login-cliente');
if (formLoginCliente) {
    // Verificar si viene código en URL
    const urlParams = new URLSearchParams(window.location.search);
    const codigoURL = urlParams.get('codigo');
    
    if (sessionStorage.getItem('wlp_cliente_id')) {
        mostrarPortalCliente(sessionStorage.getItem('wlp_cliente_id'));
    } else if (codigoURL) {
        // Auto-login con código de URL
        console.log('🔐 Intentando login automático con código:', codigoURL);
        (async () => {
            try {
                const snap = await get(ref(db, 'wlp_clientes'));
                const clientes = snap.val() || {};
                const clientesArray = Object.entries(clientes).map(([id, c]) => ({ id, ...c }));
                const cliente = clientesArray.find(c => c.codigo === codigoURL);

                if (cliente) {
                    console.log('✅ Cliente encontrado:', cliente.negocio);
                    sessionStorage.setItem('wlp_cliente_id', cliente.id);
                    mostrarPortalCliente(cliente.id);
                } else {
                    console.log('❌ Código no válido');
                }
            } catch (err) {
                console.error('Error login automático:', err);
            }
        })();
    }

    formLoginCliente.addEventListener('submit', async e => {
        e.preventDefault();
        const codigo = document.getElementById('codigo-acceso').value.trim();
        
        const snap = await get(ref(db, 'wlp_clientes'));
        const clientes = snap.val() || {};
        const clientesArray = Object.entries(clientes).map(([id, c]) => ({ id, ...c }));
        const cliente = clientesArray.find(c => c.codigo === codigo);

        if (cliente) {
            sessionStorage.setItem('wlp_cliente_id', cliente.id);
            mostrarPortalCliente(cliente.id);
        } else {
            if (document.getElementById('login-cliente-error')) {
                document.getElementById('login-cliente-error').style.display = 'block';
            }
        }
    });
}

function cerrarSesionCliente() {
    sessionStorage.removeItem('wlp_cliente_id');
    document.getElementById('login-cliente').style.display = 'flex';
    document.getElementById('portal-cliente').style.display = 'none';
}

async function mostrarPortalCliente(clienteId) {
    document.getElementById('login-cliente').style.display = 'none';
    document.getElementById('portal-cliente').style.display = 'block';

    const snap = await get(ref(db, 'wlp_clientes'));
    const clientes = snap.val() || {};
    const clientesArray = Object.entries(clientes).map(([id, c]) => ({ id, ...c }));
    const cliente = clientesArray.find(c => c.id === clienteId);
    
    if (!cliente) return;

    if (document.getElementById('cliente-bienvenida')) {
        document.getElementById('cliente-bienvenida').textContent = `Bienvenido/a, ${cliente.negocio}`;
    }

    if (document.getElementById('cliente-web-info')) {
        document.getElementById('cliente-web-info').innerHTML = `
            <h3>🌐 Tu web</h3>
            <p><strong>Negocio:</strong> ${cliente.negocio}</p>
            <p><strong>Tipo:</strong> ${cliente.tipo}</p>
            ${cliente.url ? `<p><strong>URL:</strong> <a href="${cliente.url}" target="_blank">${cliente.url}</a></p>` : '<p><em>Tu web estará disponible pronto.</em></p>'}
        `;
    }

    // Chat
    onValue(ref(db, `wlp_chats/${clienteId}`), snap => {
        const msgs = document.getElementById('chat-mensajes-cliente');
        if (!msgs) return;
        const mensajes = snap.val() || {};
        const mList = Object.values(mensajes);
        
        if (mList.length === 0) {
            msgs.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px">Sin mensajes</div>';
        } else {
            msgs.innerHTML = mList.map(m => `
                <div class="chat-msg ${m.autor === 'cliente' ? 'yo' : 'cliente'}">
                    ${m.texto}
                    <div class="chat-msg-meta">${m.hora}</div>
                </div>
            `).join('');
            msgs.scrollTop = msgs.scrollHeight;
        }
    });

    const formChat = document.getElementById('form-chat-cliente');
    if (formChat) {
        formChat.addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('chat-input-cliente');
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
                console.error(err);
            }
        });
    }
}

// Cerrar modales
window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
});

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

console.log('✅ WebLocal Pro - Script completo cargado');