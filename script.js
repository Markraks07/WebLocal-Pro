// =============================================
// FIREBASE CONFIG
// =============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAuce0qXXpuMPVFgnNWszurH3AlSQhn-yo",
    authDomain: "sabores-de-espana.firebaseapp.com",
    projectId: "sabores-de-espana",
    storageBucket: "sabores-de-espana.firebasestorage.app",
    messagingSenderId: "507672189399",
    appId: "1:507672189399:web:3cd205d9eec9d0e4439392"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const colClientes = collection(db, 'wlp_clientes');
const colPortfolio = collection(db, 'wlp_portfolio');
const colBlog = collection(db, 'wlp_blog');
const colContactos = collection(db, 'wlp_contactos');
const colTestimonios = collection(db, 'wlp_testimonios');
const colSocios = collection(db, 'wlp_socios');

// =============================================
// ADMIN CREDENTIALS
// =============================================
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'weblocalpro2024';

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

    onSnapshot(colPortfolio, snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Stats
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
    onSnapshot(colTestimonios, snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (items.length === 0) {
            testimoniosGrid.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;grid-column:1/-1">Los testimonios de mis clientes aparecerán aquí.</p>';
            return;
        }
        testimoniosGrid.innerHTML = items.map(t => `
            <div class="testimonio-card">
                <div class="testimonio-estrellas">${'★'.repeat(t.estrellas || 5)}</div>
                <p class="testimonio-texto">"${t.texto}"</p>
                <div class="testimonio-autor">
                    <div class="testimonio-avatar">${t.nombre[0].toUpperCase()}</div>
                    <div class="testimonio-info">
                        <strong>${t.nombre}</strong>
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
    onSnapshot(query(colBlog, orderBy('timestamp', 'desc')), snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
                    <p>${b.contenido.substring(0, 100)}...</p>
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
        try {
            await addDoc(colContactos, {
                nombre: document.getElementById('con-nombre').value,
                negocio: document.getElementById('con-negocio').value,
                email: document.getElementById('con-email').value,
                telefono: document.getElementById('con-telefono').value,
                tipo: document.getElementById('con-tipo').value,
                mensaje: document.getElementById('con-mensaje').value,
                estado: 'nuevo',
                fecha: new Date().toLocaleDateString('es-ES'),
                timestamp: Date.now()
            });
            formContacto.reset();
            document.getElementById('contacto-ok').style.display = 'block';
        } catch (err) { alert('Error al enviar. Inténtalo de nuevo.'); console.error(err); }
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
            document.getElementById('login-error').style.display = 'block';
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
// PANEL - INICIAR (escuchar todo en tiempo real)
// =============================================
function iniciarPanel() {
    // Clientes
    onSnapshot(colClientes, snap => {
        clientesData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderClientes();
        renderChatLista();
        actualizarDashboard();
    });

    // Portfolio
    onSnapshot(colPortfolio, snap => {
        portfolioData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTablaPortfolio();
        actualizarDashboard();
    });

    // Blog
    onSnapshot(query(colBlog, orderBy('timestamp', 'desc')), snap => {
        blogData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTablaBlog();
    });

    // Contactos
    onSnapshot(query(colContactos, orderBy('timestamp', 'desc')), snap => {
        contactosData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTablaMensajes();
        actualizarDashboard();
    });

    // Testimonios
    onSnapshot(colTestimonios, snap => {
        testimoniosData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        actualizarDashboard();
    });

    // Socios y Trabajadores
    onSnapshot(colSocios, snap => {
        sociosData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTablaSocios();
    });
}

let clientesData = [], portfolioData = [], blogData = [], contactosData = [], testimoniosData = [], sociosData = [];
let chatClienteActivo = null;
let unsubChat = null;

// =============================================
// PANEL - DASHBOARD
// =============================================
function actualizarDashboard() {
    const el = id => document.getElementById(id);
    if (!el('d-webs')) return;

    const mensajesNuevos = contactosData.filter(c => c.estado === 'nuevo').length;

    el('d-webs').textContent = portfolioData.length;
    el('d-clientes').textContent = clientesData.length;
    el('d-mensajes-nuevos').textContent = mensajesNuevos;
    el('d-ingresos').textContent = clientesData.reduce((a, c) => a + (parseFloat(c.precio) || 0), 0) + '€';
    el('d-contactos').textContent = contactosData.length;
    el('d-testimonios').textContent = testimoniosData.length;

    el('dash-ultimos-contactos').innerHTML = contactosData.slice(0, 5).length === 0
        ? '<p style="color:#94a3b8">Sin solicitudes aún</p>'
        : contactosData.slice(0, 5).map(c => `
            <div class="dash-item">
                <strong>${c.nombre}</strong> - ${c.negocio}
                <span class="badge badge-${c.estado}">${c.estado}</span>
            </div>
        `).join('');
}

// =============================================
// PANEL - CLIENTES
// =============================================
function renderClientes() {
    const grid = document.getElementById('clientes-grid');
    if (!grid) return;

    if (clientesData.length === 0) {
        grid.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1">No hay clientes aún. Añade uno con el botón.</p>';
        return;
    }

    grid.innerHTML = clientesData.map(c => `
        <div class="cliente-card">
            <div class="cliente-card-header">
                <span class="cliente-negocio">${c.negocio}</span>
                <span class="cliente-tipo">${c.tipo || 'web'}</span>
            </div>
            <p class="cliente-info">👤 ${c.nombre}</p>
            <p class="cliente-info">📧 ${c.email}</p>
            <p class="cliente-info">📞 ${c.telefono || '-'}</p>
            ${c.url ? `<p class="cliente-info">🌐 <a href="${c.url}" target="_blank">${c.url}</a></p>` : ''}
            ${c.codigo ? `<p class="cliente-info">🔑 Código: <strong>${c.codigo}</strong></p>` : ''}
            <p class="cliente-precio">💰 ${c.precio || 0}€</p>
            <div class="cliente-acciones">
                <button class="btn btn-sm btn-outline" onclick="editarCliente('${c.id}')">✏️ Editar</button>
                <button class="btn btn-sm btn-primary" onclick="abrirChatCliente('${c.id}')">💬 Chat</button>
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
            document.getElementById('c-negocio').value = c.negocio;
            document.getElementById('c-nombre').value = c.nombre;
            document.getElementById('c-email').value = c.email;
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
    if (id) { await updateDoc(doc(db, 'wlp_clientes', id), data); }
    else { await addDoc(colClientes, data); }
    cerrarModalCliente();
});

async function eliminarCliente(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    await deleteDoc(doc(db, 'wlp_clientes', id));
}

// =============================================
// PANEL - CHAT EN TIEMPO REAL
// =============================================
function renderChatLista() {
    const lista = document.getElementById('chat-lista');
    if (!lista) return;
    if (clientesData.length === 0) {
        lista.innerHTML = '<p style="padding:20px;color:#94a3b8;font-size:0.9rem">Sin clientes aún</p>';
        return;
    }
    lista.innerHTML = clientesData.map(c => `
        <div class="chat-item ${chatClienteActivo === c.id ? 'activo' : ''}" onclick="abrirChatCliente('${c.id}')">
            <div class="chat-item-nombre">${c.negocio}</div>
            <div class="chat-item-preview">${c.nombre}</div>
        </div>
    `).join('');
}

function abrirChatCliente(clienteId) {
    // Cambiar a sección chats si no estamos ahí
    document.querySelectorAll('.panel-nav-btn').forEach(b => b.classList.remove('activo'));
    document.querySelectorAll('.panel-sec').forEach(s => s.classList.remove('activo'));
    document.querySelector('[data-sec="chats"]').classList.add('activo');
    document.getElementById('sec-chats').classList.add('activo');

    chatClienteActivo = clienteId;
    renderChatLista();

    const cliente = clientesData.find(c => c.id === clienteId);
    const ventana = document.getElementById('chat-ventana');
    ventana.innerHTML = `
        <div class="chat-ventana-header">💬 Chat con ${cliente?.negocio || 'Cliente'}</div>
        <div class="chat-mensajes" id="chat-msgs-panel"></div>
        <form class="chat-input-box" id="chat-form-panel">
            <input type="text" id="chat-input-panel" placeholder="Escribe un mensaje..." required>
            <button type="submit" class="btn btn-primary">Enviar</button>
        </form>
    `;

    // Desuscribir chat anterior
    if (unsubChat) unsubChat();

    // Escuchar mensajes en tiempo real
    const chatCol = collection(db, 'wlp_chats', clienteId, 'mensajes');
    unsubChat = onSnapshot(query(chatCol, orderBy('timestamp', 'asc')), snap => {
        const msgs = document.getElementById('chat-msgs-panel');
        if (!msgs) return;
        const mensajes = snap.docs.map(d => d.data());
        if (mensajes.length === 0) {
            msgs.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px">Sin mensajes aún. ¡Di hola!</div>';
        } else {
            msgs.innerHTML = mensajes.map(m => `
                <div class="chat-msg ${m.autor === 'admin' ? 'yo' : 'cliente'}">
                    ${m.texto}
                    <div class="chat-msg-meta">${m.hora}</div>
                </div>
            `).join('');
            msgs.scrollTop = msgs.scrollHeight;
        }
    });

    // Enviar mensaje
    document.getElementById('chat-form-panel').addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('chat-input-panel');
        const texto = input.value.trim();
        if (!texto) return;
        input.value = '';
        await addDoc(collection(db, 'wlp_chats', clienteId, 'mensajes'), {
            texto,
            autor: 'admin',
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
    });
}

// =============================================
// PANEL - PORTFOLIO
// =============================================
function renderTablaPortfolio() {
    const tbody = document.getElementById('tbody-portfolio');
    if (!tbody) return;
    tbody.innerHTML = portfolioData.length === 0
        ? '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sin proyectos</td></tr>'
        : portfolioData.map(p => `
            <tr>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.tipo}</td>
                <td>${p.url ? `<a href="${p.url}" target="_blank">Ver →</a>` : '-'}</td>
                <td>${p.precio ? p.precio + '€' : '-'}</td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-sm btn-outline" onclick="editarPortfolio('${p.id}')">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarPortfolio('${p.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function abrirModalPortfolio(id = null) {
    document.getElementById('modal-portfolio').style.display = 'flex';
    document.getElementById('form-portfolio').reset();
    document.getElementById('p-id').value = id || '';
    document.getElementById('modal-portfolio-titulo').textContent = id ? 'Editar Proyecto' : 'Añadir Proyecto';
    if (id) {
        const p = portfolioData.find(x => x.id === id);
        if (p) {
            document.getElementById('p-nombre').value = p.nombre;
            document.getElementById('p-tipo').value = p.tipo;
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
    if (id) { await updateDoc(doc(db, 'wlp_portfolio', id), data); }
    else { await addDoc(colPortfolio, data); }
    cerrarModalPortfolio();
});

async function eliminarPortfolio(id) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await deleteDoc(doc(db, 'wlp_portfolio', id));
}

// =============================================
// PANEL - BLOG
// =============================================
function renderTablaBlog() {
    const tbody = document.getElementById('tbody-blog');
    if (!tbody) return;
    tbody.innerHTML = blogData.length === 0
        ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">Sin artículos</td></tr>'
        : blogData.map(b => `
            <tr>
                <td><strong>${b.emoji || ''} ${b.titulo}</strong></td>
                <td>${b.categoria}</td>
                <td>${b.fecha}</td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-sm btn-outline" onclick="editarBlog('${b.id}')">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarBlog('${b.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function abrirModalBlog(id = null) {
    document.getElementById('modal-blog').style.display = 'flex';
    document.getElementById('form-blog').reset();
    document.getElementById('b-id').value = id || '';
    document.getElementById('modal-blog-titulo').textContent = id ? 'Editar Artículo' : 'Nuevo Artículo';
    if (id) {
        const b = blogData.find(x => x.id === id);
        if (b) {
            document.getElementById('b-titulo').value = b.titulo;
            document.getElementById('b-categoria').value = b.categoria;
            document.getElementById('b-emoji').value = b.emoji || '';
            document.getElementById('b-contenido').value = b.contenido;
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
    if (id) { await updateDoc(doc(db, 'wlp_blog', id), data); }
    else { await addDoc(colBlog, data); }
    cerrarModalBlog();
});

async function eliminarBlog(id) {
    if (!confirm('¿Eliminar este artículo?')) return;
    await deleteDoc(doc(db, 'wlp_blog', id));
}

// =============================================
// PANEL - MENSAJES DE CONTACTO
// =============================================
function renderTablaMensajes() {
    const tbody = document.getElementById('tbody-mensajes');
    if (!tbody) return;
    tbody.innerHTML = contactosData.length === 0
        ? '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">Sin mensajes</td></tr>'
        : contactosData.map(c => `
            <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.negocio}</td>
                <td>${c.email}</td>
                <td>${c.tipo || '-'}</td>
                <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.mensaje}</td>
                <td><span class="badge badge-${c.estado}">${c.estado}</span></td>
                <td>
                    <div class="acciones">
                        ${c.estado === 'nuevo' ? `<button class="btn btn-sm btn-success" onclick="marcarLeido('${c.id}')">✅ Leído</button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="eliminarContacto('${c.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

async function marcarLeido(id) {
    await updateDoc(doc(db, 'wlp_contactos', id), { estado: 'leido' });
}

async function eliminarContacto(id) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await deleteDoc(doc(db, 'wlp_contactos', id));
}

// =============================================
// PORTAL CLIENTE - LOGIN
// =============================================
const formLoginCliente = document.getElementById('form-login-cliente');
if (formLoginCliente) {
    if (sessionStorage.getItem('wlp_cliente_id')) {
        mostrarPortalCliente(sessionStorage.getItem('wlp_cliente_id'));
    }

    formLoginCliente.addEventListener('submit', async e => {
        e.preventDefault();
        const codigo = document.getElementById('codigo-acceso').value.trim();
        const snap = await getDocs(colClientes);
        const clientes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const cliente = clientes.find(c => c.codigo === codigo);

        if (cliente) {
            sessionStorage.setItem('wlp_cliente_id', cliente.id);
            mostrarPortalCliente(cliente.id);
        } else {
            document.getElementById('login-cliente-error').style.display = 'block';
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

    // Cargar datos del cliente
    const snap = await getDocs(colClientes);
    const cliente = snap.docs.map(d => ({ id: d.id, ...d.data() })).find(c => c.id === clienteId);
    if (!cliente) return;

    document.getElementById('cliente-bienvenida').textContent = `Bienvenido/a, ${cliente.negocio}`;

    document.getElementById('cliente-web-info').innerHTML = `
        <h3>🌐 Tu web</h3>
        <p><strong>Negocio:</strong> ${cliente.negocio}</p>
        <p><strong>Tipo:</strong> ${cliente.tipo}</p>
        ${cliente.url ? `<p><strong>URL:</strong> <a href="${cliente.url}" target="_blank">${cliente.url}</a></p>` : '<p><em>Tu web estará disponible pronto.</em></p>'}
    `;

    // Chat en tiempo real
    const chatCol = collection(db, 'wlp_chats', clienteId, 'mensajes');
    onSnapshot(query(chatCol, orderBy('timestamp', 'asc')), snap => {
        const msgs = document.getElementById('chat-mensajes-cliente');
        if (!msgs) return;
        const mensajes = snap.docs.map(d => d.data());
        if (mensajes.length === 0) {
            msgs.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px">Sin mensajes aún. ¡Escríbeme!</div>';
        } else {
            msgs.innerHTML = mensajes.map(m => `
                <div class="chat-msg ${m.autor === 'cliente' ? 'yo' : 'cliente'}">
                    ${m.texto}
                    <div class="chat-msg-meta">${m.hora}</div>
                </div>
            `).join('');
            msgs.scrollTop = msgs.scrollHeight;
        }
    });

    document.getElementById('form-chat-cliente').addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('chat-input-cliente');
        const texto = input.value.trim();
        if (!texto) return;
        input.value = '';
        await addDoc(collection(db, 'wlp_chats', clienteId, 'mensajes'), {
            texto,
            autor: 'cliente',
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
    });
}

// Cerrar modales al click fuera
window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
});

console.log('✅ WebLocal Pro cargado con Firebase');

// =============================================
// PANEL - SOCIOS Y TRABAJADORES
// =============================================
function renderTablaSocios() {
    const tbody = document.getElementById('tbody-socios');
    if (!tbody) return;
    tbody.innerHTML = sociosData.length === 0
        ? '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">Sin socios ni trabajadores</td></tr>'
        : sociosData.map(s => `
            <tr>
                <td><strong>${s.nombre}</strong></td>
                <td>${s.email}</td>
                <td>${s.rol}</td>
                <td>${s.comision ? s.comision + '%' : '0%'}</td>
                <td><span class="badge badge-${s.estado.toLowerCase().replace(/ /g, '-')}">${s.estado}</span></td>
                <td>
                    <div class="acciones">
                        <button class="btn btn-sm btn-outline" onclick="editarSocio('${s.id}')">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarSocio('${s.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function abrirModalSocio(id = null) {
    document.getElementById('modal-socio').style.display = 'flex';
    document.getElementById('form-socio').reset();
    document.getElementById('s-id').value = id || '';
    document.getElementById('modal-socio-titulo').textContent = id ? 'Editar Socio / Trabajador' : 'Nuevo Socio / Trabajador';
    if (id) {
        const s = sociosData.find(x => x.id === id);
        if (s) {
            document.getElementById('s-nombre').value = s.nombre;
            document.getElementById('s-email').value = s.email;
            document.getElementById('s-rol').value = s.rol;
            document.getElementById('s-comision').value = s.comision || '';
            document.getElementById('s-estado').value = s.estado || 'Activo';
            document.getElementById('s-perm-finanzas').checked = s.permFinanzas || false;
            document.getElementById('s-perm-clientes').checked = s.permClientes || false;
            document.getElementById('s-perm-contenido').checked = s.permContenido || false;
        }
    }
}

function cerrarModalSocio() {
    document.getElementById('modal-socio').style.display = 'none';
}

function editarSocio(id) {
    abrirModalSocio(id);
}

async function eliminarSocio(id) {
    if (!confirm('¿Eliminar este miembro del equipo?')) return;
    await deleteDoc(doc(db, 'wlp_socios', id));
}

// Escucha el envío del formulario para crear o actualizar en Firestore
document.getElementById('form-socio')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('s-id').value;
    const data = {
        nombre: document.getElementById('s-nombre').value,
        email: document.getElementById('s-email').value,
        rol: document.getElementById('s-rol').value,
        comision: document.getElementById('s-comision').value,
        estado: document.getElementById('s-estado').value,
        permFinanzas: document.getElementById('s-perm-finanzas').checked,
        permClientes: document.getElementById('s-perm-clientes').checked,
        permContenido: document.getElementById('s-perm-contenido').checked,
        timestamp: Date.now()
    };
    if (id) {
        await updateDoc(doc(db, 'wlp_socios', id), data);
    } else {
        await addDoc(colSocios, data);
    }
    cerrarModalSocio();
});

// Nota: Al usar type="module" en tu script, exponemos las funciones al objeto global window 
// para asegurar que tus botones HTML inline (onclick) las encuentren perfectamente sin errores.
window.abrirModalSocio = abrirModalSocio;
window.cerrarModalSocio = cerrarModalSocio;
window.editarSocio = editarSocio;
window.eliminarSocio = eliminarSocio;

// =============================================
// EXPONER FUNCIONES AL ÁMBITO GLOBAL
// =============================================
window.cerrarSesion = cerrarSesion;
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
window.cerrarSesionCliente = cerrarSesionCliente;
window.mostrarPortalCliente = mostrarPortalCliente;