// script.js

// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAnZflJdnUOvpauAM8VROWLlvMo9JUujg",
    authDomain: "formualriofundacion.firebaseapp.com",
    projectId: "formualriofundacion",
    storageBucket: "formualriofundacion.firebasestorage.app",
    messagingSenderId: "715126519393",
    appId: "1:715126519393:web:1fba3a3c34593bf23fdc20",
    measurementId: "G-PZL2MHGXWK"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Variables globales
let isSubmitting = false;

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insertar al inicio del formulario
    const form = document.getElementById('solicitudForm');
    form.insertBefore(messageDiv, form.firstChild);

    // Auto-remover después de 5 segundos (excepto loading)
    if (type !== 'loading') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Scroll al mensaje
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función para validar cédula dominicana (formato básico)
function validarCedula(cedula) {
    // Remover guiones y espacios
    cedula = cedula.replace(/[-\s]/g, '');
    
    // Verificar que tenga 11 dígitos
    if (!/^\d{11}$/.test(cedula)) {
        return false;
    }
    
    return true;
}

// Función para validar teléfono dominicano
function validarTelefono(telefono) {
    // Remover espacios, guiones y paréntesis
    telefono = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Verificar formato dominicano (809, 829, 849 + 7 dígitos)
    return /^(809|829|849)\d{7}$/.test(telefono);
}

// Función para validar email
function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar todos los campos
function validarFormulario(formData) {
    const errores = [];

    console.log('Validando formulario con datos:', formData);

    // Validaciones requeridas
    if (!formData.nombreEstudiante || !formData.nombreEstudiante.trim()) {
        errores.push('El nombre del estudiante es requerido');
    }

    if (!formData.edadEstudiante || formData.edadEstudiante < 15 || formData.edadEstudiante > 25) {
        errores.push('La edad del estudiante debe estar entre 15 y 25 años');
    }

    if (!formData.cedulaEstudiante || !validarCedula(formData.cedulaEstudiante)) {
        errores.push('La cédula del estudiante debe tener 11 dígitos');
    }

    if (!formData.telefonoEstudiante || !validarTelefono(formData.telefonoEstudiante)) {
        errores.push('El teléfono del estudiante debe ser válido (809, 829, o 849 + 7 dígitos)');
    }

    if (!formData.emailEstudiante || !validarEmail(formData.emailEstudiante)) {
        errores.push('El correo electrónico del estudiante no es válido');
    }

    if (!formData.liceo || !formData.liceo.trim()) {
        errores.push('El liceo es requerido');
    }

    if (!formData.grado) {
        errores.push('El grado escolar es requerido');
    }

    if (!formData.indiceCalificaciones || formData.indiceCalificaciones < 0 || formData.indiceCalificaciones > 100) {
        errores.push('El índice de calificaciones debe estar entre 0 y 100');
    }

    if (!formData.universidadDeseada || !formData.universidadDeseada.trim()) {
        errores.push('La universidad deseada es requerida');
    }

    if (!formData.carreraDeseada || !formData.carreraDeseada.trim()) {
        errores.push('La carrera deseada es requerida');
    }

    // Validaciones de padre/tutor 1
    if (!formData.nombrePadre1 || !formData.nombrePadre1.trim()) {
        errores.push('El nombre del padre/tutor 1 es requerido');
    }

    if (!formData.cedulaPadre1 || !validarCedula(formData.cedulaPadre1)) {
        errores.push('La cédula del padre/tutor 1 debe tener 11 dígitos');
    }

    if (!formData.telefonoPadre1 || !validarTelefono(formData.telefonoPadre1)) {
        errores.push('El teléfono del padre/tutor 1 debe ser válido');
    }

    // Si hay datos del padre 2, validarlos
    if (formData.nombrePadre2 && formData.nombrePadre2.trim() || 
        formData.cedulaPadre2 && formData.cedulaPadre2.trim() || 
        formData.telefonoPadre2 && formData.telefonoPadre2.trim()) {
        
        if (formData.cedulaPadre2 && formData.cedulaPadre2.trim() && !validarCedula(formData.cedulaPadre2)) {
            errores.push('La cédula del padre/tutor 2 debe tener 11 dígitos');
        }
        if (formData.telefonoPadre2 && formData.telefonoPadre2.trim() && !validarTelefono(formData.telefonoPadre2)) {
            errores.push('El teléfono del padre/tutor 2 debe ser válido');
        }
    }

    if (!formData.motivacion || !formData.motivacion.trim()) {
        errores.push('La motivación es requerida');
    }

    // ✅ CORRECCIÓN: Validación del checkbox de autorización
    if (!formData.autorizacion) {
        errores.push('Debe autorizar el uso de sus datos personales');
    }

    console.log('Errores encontrados:', errores);
    return errores;
}

// ✅ CORRECCIÓN: Función mejorada para recopilar datos del formulario
function recopilarDatos() {
    const form = document.getElementById('solicitudForm');
    const datos = {};
    
    // Obtener todos los inputs, selects y textareas
    const campos = form.querySelectorAll('input, select, textarea');
    
    campos.forEach(campo => {
        if (campo.name) {
            if (campo.type === 'checkbox') {
                datos[campo.name] = campo.checked;
            } else if (campo.type === 'radio') {
                if (campo.checked) {
                    datos[campo.name] = campo.value;
                }
            } else {
                // CORRECCIÓN: Limpiar formato de números para campos de ingresos
                if (campo.id && (campo.id.includes('ingresos') || campo.id.includes('Ingresos'))) {
                    // Remover comas y guardar solo el número
                    const numeroLimpio = campo.value.replace(/[^\d]/g, '');
                    datos[campo.name] = numeroLimpio ? parseInt(numeroLimpio, 10) : 0;
                } else {
                    datos[campo.name] = campo.value;
                }
            }
        }
    });
    
    console.log('Datos recopilados:', datos);
    return datos;
}

// Función para guardar en Firebase
async function guardarEnFirebase(datos) {
    try {
        console.log('Intentando guardar datos en Firebase...', datos);
        
        // Crear número de solicitud único
        const numeroSolicitud = `FUTRAVIF-${Date.now()}`;
        
        // Agregar timestamp y datos adicionales
        const datosCompletos = {
            ...datos,
            fechaEnvio: serverTimestamp(),
            estado: 'pendiente',
            numeroSolicitud: numeroSolicitud,
            fechaCreacion: new Date().toISOString()
        };

        console.log('Datos completos a enviar:', datosCompletos);

        // Verificar conexión a Firebase
        if (!db) {
            throw new Error('No se pudo conectar a Firebase Firestore');
        }

        // Guardar en la colección 'solicitudes'
        const docRef = await addDoc(collection(db, 'solicitudes'), datosCompletos);
        
        console.log('Documento guardado exitosamente con ID:', docRef.id);
        
        return {
            success: true,
            id: docRef.id,
            numeroSolicitud: numeroSolicitud
        };
    } catch (error) {
        console.error('Error detallado al guardar en Firebase:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje de error:', error.message);
        
        // Determinar el tipo de error
        let mensajeError = 'Error desconocido';
        
        if (error.code === 'permission-denied') {
            mensajeError = 'Permisos denegados. Las reglas de Firestore no permiten escribir datos.';
        } else if (error.code === 'unavailable') {
            mensajeError = 'Servicio no disponible. Inténtelo más tarde.';
        } else if (error.code === 'failed-precondition') {
            mensajeError = 'Error de configuración del sistema.';
        } else if (error.message.includes('network')) {
            mensajeError = 'Error de conexión. Verifique su internet.';
        } else {
            mensajeError = error.message || 'Error al enviar la solicitud';
        }
        
        return {
            success: false,
            error: mensajeError,
            originalError: error
        };
    }
}

// Función principal para manejar el envío del formulario
async function manejarEnvio(event) {
    event.preventDefault();
    
    console.log('🚀 Iniciando proceso de envío del formulario');
    
    if (isSubmitting) {
        console.log('⏳ Ya se está procesando una solicitud');
        return;
    }

    isSubmitting = true;

    try {
        // Mostrar mensaje de carga
        showMessage('Procesando solicitud, por favor espere...', 'loading');

        // Recopilar datos
        console.log('📝 Recopilando datos del formulario...');
        const datos = recopilarDatos();

        // Validar datos
        console.log('✅ Validando datos...');
        const errores = validarFormulario(datos);
        
        if (errores.length > 0) {
            console.log('❌ Errores de validación encontrados:', errores);
            showMessage(`Errores encontrados:\n• ${errores.join('\n• ')}`, 'error');
            return;
        }

        console.log('✅ Datos válidos, guardando en Firebase...');

        // Guardar en Firebase
        const resultado = await guardarEnFirebase(datos);

        if (resultado.success) {
            console.log('🎉 Solicitud guardada exitosamente');
            showMessage(
                `¡Solicitud enviada exitosamente! Su número de solicitud es: ${resultado.numeroSolicitud}. En breve nos pondremos en contacto con usted.`,
                'success'
            );
            
            // Limpiar formulario
            document.getElementById('solicitudForm').reset();
            
            // Scroll al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.log('❌ Error al guardar:', resultado.error);
            showMessage(
                `Error al enviar la solicitud: ${resultado.error}. Por favor, inténtelo nuevamente.`,
                'error'
            );
        }

    } catch (error) {
        console.error('💥 Error inesperado:', error);
        showMessage('Error inesperado. Por favor, inténtelo nuevamente.', 'error');
    } finally {
        isSubmitting = false;
        console.log('🏁 Proceso de envío finalizado');
    }
}

// Función para formatear inputs en tiempo real
function configurarFormateadores() {
    // Formatear cédulas
    const cedulaInputs = document.querySelectorAll('#cedulaEstudiante, #cedulaPadre1, #cedulaPadre2');
    cedulaInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            // Formatear como XXX-XXXXXXX-X
            if (value.length > 3 && value.length <= 10) {
                value = value.replace(/(\d{3})(\d+)/, '$1-$2');
            } else if (value.length === 11) {
                value = value.replace(/(\d{3})(\d{7})(\d{1})/, '$1-$2-$3');
            }
            
            e.target.value = value;
        });
    });

    // Formatear teléfonos
    const telefonoInputs = document.querySelectorAll('#telefonoEstudiante, #telefonoPadre1, #telefonoPadre2');
    telefonoInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            
            // Formatear como (XXX) XXX-XXXX
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d+)/, '($1) $2');
            }
            
            e.target.value = value;
        });
    });

    // Formatear índice de calificaciones
    const indiceInput = document.getElementById('indiceCalificaciones');
    if (indiceInput) {
        indiceInput.addEventListener('input', function(e) {
            let value = parseFloat(e.target.value);
            if (value > 100) e.target.value = 100;
            if (value < 0) e.target.value = 0;
        });
    }

    // Formatear ingresos - VERSIÓN CORREGIDA
    const ingresosInputs = document.querySelectorAll('#ingresosPadre1, #ingresosPadre2');
    ingresosInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        // Obtener solo los números del valor actual
        let value = e.target.value.replace(/[^\d]/g, '');
        
        // Si hay valor numérico, formatearlo
        if (value && value !== '0') {
            // Convertir a número y formatear con comas
            const numericValue = parseInt(value, 10);
            if (!isNaN(numericValue)) {
                e.target.value = numericValue.toLocaleString('es-DO');
            }
        } else if (value === '') {
            // Si está vacío, dejarlo vacío
            e.target.value = '';
        }
    });
    
    // También manejar cuando el usuario sale del campo (blur)
    input.addEventListener('blur', function(e) {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value && value !== '0') {
            const numericValue = parseInt(value, 10);
            if (!isNaN(numericValue)) {
                e.target.value = numericValue.toLocaleString('es-DO');
            }
        }
    });
});
}

// Función para configurar validación en tiempo real
function configurarValidacionTiempoReal() {
    const form = document.getElementById('solicitudForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validarCampoIndividual(this);
        });
        
        input.addEventListener('input', function() {
            // Remover estilos de error cuando el usuario empiece a escribir
            this.classList.remove('error');
            ocultarErrorCampo(this);
        });
    });
}

// Función para validar campo individual
function validarCampoIndividual(campo) {
    const valor = campo.value.trim();
    let esValido = true;
    let mensajeError = '';

    // Validaciones específicas por tipo de campo
    if (campo.hasAttribute('required') && !valor) {
        esValido = false;
        mensajeError = 'Este campo es requerido';
    } else if (campo.type === 'email' && valor && !validarEmail(valor)) {
        esValido = false;
        mensajeError = 'Formato de email inválido';
    } else if (campo.id.includes('cedula') && valor && !validarCedula(valor)) {
        esValido = false;
        mensajeError = 'Cédula debe tener 11 dígitos';
    } else if (campo.id.includes('telefono') && valor && !validarTelefono(valor.replace(/[\s\-\(\)]/g, ''))) {
        esValido = false;
        mensajeError = 'Teléfono inválido';
    } else if (campo.id === 'edadEstudiante' && valor && (valor < 15 || valor > 25)) {
        esValido = false;
        mensajeError = 'Edad debe estar entre 15 y 25 años';
    } else if (campo.id === 'indiceCalificaciones' && valor && (valor < 0 || valor > 100)) {
        esValido = false;
        mensajeError = 'Índice debe estar entre 0 y 100';
    }

    // Aplicar estilos visuales
    if (!esValido) {
        campo.classList.add('error');
        mostrarErrorCampo(campo, mensajeError);
    } else {
        campo.classList.remove('error');
        ocultarErrorCampo(campo);
    }

    return esValido;
}

// Función para mostrar error en campo específico
function mostrarErrorCampo(campo, mensaje) {
    // Remover error anterior si existe
    ocultarErrorCampo(campo);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = mensaje;
    errorDiv.style.color = '#f44336';
    errorDiv.style.fontSize = '0.8em';
    errorDiv.style.marginTop = '5px';
    
    campo.parentNode.appendChild(errorDiv);
}

// Función para ocultar error de campo específico
function ocultarErrorCampo(campo) {
    const errorExistente = campo.parentNode.querySelector('.field-error');
    if (errorExistente) {
        errorExistente.remove();
    }
}

// Función para configurar autocompletado inteligente
function configurarAutocompletado() {
    // Lista de universidades dominicanas populares
    const universidades = [
        'Universidad Autónoma de Santo Domingo (UASD)',
        'Pontificia Universidad Católica Madre y Maestra (PUCMM)',
        'Universidad Nacional Pedro Henríquez Ureña (UNPHU)',
        'Universidad Iberoamericana (UNIBE)',
        'Universidad Tecnológica de Santiago (UTESA)',
        'Universidad del Caribe (UNICARIBE)',
        'Universidad Católica Santo Domingo (UCSD)',
        'Universidad Dominicana O&M',
        'Instituto Tecnológico de Santo Domingo (INTEC)',
        'Universidad Católica Nordestana (UCNE)'
    ];

    // Configurar autocompletado para universidad
    const universidadInput = document.getElementById('universidadDeseada');
    if (universidadInput) {
        configurarDatalist(universidadInput, universidades, 'universidades-list');
    }

    // Lista de carreras populares
    const carreras = [
        'Medicina',
        'Ingeniería Civil',
        'Ingeniería Industrial',
        'Ingeniería de Sistemas',
        'Derecho',
        'Administración de Empresas',
        'Contabilidad',
        'Psicología',
        'Arquitectura',
        'Enfermería',
        'Odontología',
        'Educación',
        'Comunicación Social',
        'Marketing',
        'Ingeniería Eléctrica',
        'Ingeniería Mecánica',
        'Turismo',
        'Diseño Gráfico',
        'Informática',
        'Economía'
    ];

    // Configurar autocompletado para carrera
    const carreraInput = document.getElementById('carreraDeseada');
    if (carreraInput) {
        configurarDatalist(carreraInput, carreras, 'carreras-list');
    }
}

// Función auxiliar para configurar datalist
function configurarDatalist(input, opciones, listId) {
    // Crear datalist si no existe
    let datalist = document.getElementById(listId);
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = listId;
        document.body.appendChild(datalist);
    }

    // Agregar opciones
    opciones.forEach(opcion => {
        const option = document.createElement('option');
        option.value = opcion;
        datalist.appendChild(option);
    });

    // Asociar con el input
    input.setAttribute('list', listId);
}

// Función para configurar navegación con teclado
function configurarNavegacionTeclado() {
    const form = document.getElementById('solicitudForm');
    
    if (form) {
        form.addEventListener('keydown', function(e) {
            // Ctrl + Enter para enviar
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
            
            // Escape para limpiar campo actual
            if (e.key === 'Escape') {
                if (document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA') {
                    document.activeElement.value = '';
                }
            }
        });
    }
}

// Función para guardar progreso local (sin localStorage)
let progresoFormulario = {};

function guardarProgreso() {
    try {
        const datos = recopilarDatos();
        progresoFormulario = { ...datos };
    } catch (error) {
        console.log('Error al guardar progreso:', error);
    }
}

function cargarProgreso() {
    try {
        if (Object.keys(progresoFormulario).length > 0) {
            Object.entries(progresoFormulario).forEach(([key, value]) => {
                const campo = document.querySelector(`[name="${key}"]`);
                if (campo) {
                    if (campo.type === 'checkbox') {
                        campo.checked = value;
                    } else {
                        campo.value = value;
                    }
                }
            });
        }
    } catch (error) {
        console.log('Error al cargar progreso:', error);
    }
}

// Función de inicialización
function inicializar() {
    try {
        console.log('🔥 Iniciando configuración de Firebase...');
        
        // Verificar que Firebase se haya inicializado correctamente
        if (!app) {
            console.error('❌ Error: Firebase app no se inicializó correctamente');
            showMessage('Error de configuración del sistema. Contacte al administrador.', 'error');
            return;
        }
        
        if (!db) {
            console.error('❌ Error: Firestore no se inicializó correctamente');
            showMessage('Error de base de datos. Contacte al administrador.', 'error');
            return;
        }
        
        console.log('✅ Firebase inicializado correctamente');
        console.log('📱 App:', app);
        console.log('🗄️ Database:', db);
        
        // Configurar event listeners
        const form = document.getElementById('solicitudForm');
        if (form) {
            form.addEventListener('submit', manejarEnvio);
            console.log('✅ Event listener del formulario configurado');
        } else {
            console.error('❌ Error: No se encontró el formulario con ID "solicitudForm"');
            return;
        }

        // Configurar formateadores
        configurarFormateadores();
        
        // Configurar validación en tiempo real
        configurarValidacionTiempoReal();
        
        // Configurar autocompletado
        configurarAutocompletado();
        
        // Configurar navegación con teclado
        configurarNavegacionTeclado();

        // Guardar progreso cada 30 segundos
        setInterval(guardarProgreso, 30000);

        // Cargar progreso previo si existe
        cargarProgreso();

        console.log('🎉 Formulario FUTRAVIF inicializado correctamente');
        
        // Mostrar mensaje de éxito en la inicialización
        showMessage('Sistema cargado correctamente. Puede llenar el formulario.', 'success');
        
    } catch (error) {
        console.error('💥 Error crítico al inicializar:', error);
        showMessage('Error crítico del sistema. Recargue la página.', 'error');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}