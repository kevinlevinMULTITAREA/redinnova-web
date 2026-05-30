// ===== DESCARGA DE PDF PARA REGISTRO DIARIO =====

/**
 * Descarga un registro individual como PDF
 * @param {Object} registryData - Datos del registro a descargar
 */
function downloadSingleRegistryPDF(registryData) {
    // ✅ VERIFICACIÓN DE LOGIN REQUERIDO
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para descargar');
        abrirLoginSeguro();
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Configuración
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 15;
        
        // ===== HEADER =====
        doc.setFillColor(0, 188, 212);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Logo y título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('REDINNOVA', 15, 15);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Registro Diario de Ingreso y Salida', 15, 23);
        doc.text(new Date().toLocaleDateString('es-ES'), 180, 23, { align: 'right' });
        
        yPosition = 45;
        
        // ===== SECCIÓN DE DATOS DEL EMPLEADO =====
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('DATOS DEL EMPLEADO', 15, yPosition);
        
        // Línea divisoria
        doc.setDrawColor(0, 188, 212);
        doc.setLineWidth(0.5);
        doc.line(15, yPosition + 2, 195, yPosition + 2);
        
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        // Datos personales
        const infoData = [
            { label: 'Nombre Completo:', value: registryData.nombre || '-' },
            { label: 'Servicio/Puesto:', value: registryData.servicio || '-' },
            { label: 'Fecha:', value: registryData.fecha || '-' },
        ];
        
        infoData.forEach(item => {
            doc.setFont(undefined, 'bold');
            doc.text(`${item.label}`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(item.value, 65, yPosition);
            yPosition += 7;
        });
        
        yPosition += 5;
        
        // ===== SECCIÓN DE HORARIOS =====
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('HORARIOS Y JORNADA', 15, yPosition);
        
        doc.setLineWidth(0.5);
        doc.line(15, yPosition + 2, 195, yPosition + 2);
        
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        // Tabla de horarios
        const horarios = [
            { label: 'Hora de Ingreso:', value: registryData.horaIngreso || '-' },
            { label: 'Almuerzo (Salida):', value: registryData.almuerzoSalida || '-' },
            { label: 'Almuerzo (Ingreso):', value: registryData.almuerzoIngreso || '-' },
            { label: 'Hora de Salida:', value: registryData.horaSalida || '-' },
        ];
        
        horarios.forEach(item => {
            doc.setFont(undefined, 'bold');
            doc.text(`${item.label}`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(item.value, 65, yPosition);
            yPosition += 7;
        });
        
        yPosition += 5;
        
        // ===== SECCIÓN DETALLE DE AVANCE =====
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('DETALLE DE AVANCE', 15, yPosition);
        
        doc.setLineWidth(0.5);
        doc.line(15, yPosition + 2, 195, yPosition + 2);
        
        yPosition += 8;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        
        // Envolver texto largo
        const detalleLines = doc.splitTextToSize(
            registryData.detalleAvance || 'Sin detalle registrado',
            170
        );
        
        detalleLines.forEach(line => {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 15;
            }
            doc.text(line, 15, yPosition);
            yPosition += 6;
        });
        
        yPosition += 5;
        
        // ===== SECCIÓN OBSERVACIONES =====
        if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 15;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('OBSERVACIONES', 15, yPosition);
        
        doc.setLineWidth(0.5);
        doc.line(15, yPosition + 2, 195, yPosition + 2);
        
        yPosition += 8;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        
        const obsLines = doc.splitTextToSize(
            registryData.observaciones || 'Sin observaciones adicionales',
            170
        );
        
        obsLines.forEach(line => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 15;
            }
            doc.text(line, 15, yPosition);
            yPosition += 6;
        });
        
        // ===== FOOTER =====
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont(undefined, 'normal');
        doc.text(
            `Generado por Redinnova | ${new Date().toLocaleString('es-ES')}`,
            15,
            pageHeight - 8
        );
        
        // Línea del footer
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(15, pageHeight - 10, 195, pageHeight - 10);
        
        // ===== DESCARGAR =====
        const fileName = `Registro_${registryData.nombre.replace(/\s+/g, '_')}_${registryData.fecha}.pdf`;
        doc.save(fileName);
        
        mostrarNotificacionSegura(`📄 PDF descargado: ${registryData.nombre}`);
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, `PDF descargado: ${fileName}`, 'info');
    } catch (error) {
        console.error('Error al generar PDF individual:', error);
        mostrarNotificacionSegura('❌ Error al generar PDF: ' + error.message);
    }
}

/**
 * Descarga todos los registros como un PDF combinado
 */
function downloadAllRegistriesPDF() {
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para descargar');
        abrirLoginSeguro();
        return;
    }

    try {
        const selectedDate = document.getElementById('registryDate').value;
        let registros = dailyRegistryData;
        
        if (selectedDate) {
            registros = dailyRegistryData.filter(r => r.fecha === selectedDate);
        }

        if (registros.length === 0) {
            mostrarNotificacionSegura('⚠️ No hay registros para descargar');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 15;
        
        const addHeader = (isFirst) => {
            if (!isFirst) {
                doc.addPage();
            }
            
            doc.setFillColor(0, 188, 212);
            doc.rect(0, 0, pageWidth, 30, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('REDINNOVA', 15, 12);
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text('Reporte de Registro Diario', 15, 20);
            
            if (selectedDate) {
                doc.text(`Fecha: ${selectedDate}`, 120, 20);
            }
            
            yPosition = 40;
        };
        
        addHeader(true);
        
        registros.forEach((registro, index) => {
            if (yPosition > pageHeight - 60) {
                addHeader(false);
            }
            
            doc.setFillColor(240, 240, 240);
            doc.rect(15, yPosition - 2, 180, 8, 'F');
            
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(11);
            doc.text(`${index + 1}. ${registro.nombre} - ${registro.servicio}`, 18, yPosition + 2);
            
            yPosition += 10;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            
            const registroInfo = [
                `Fecha: ${registro.fecha}`,
                `Ingreso: ${registro.horaIngreso || '-'} | Almuerzo Salida: ${registro.almuerzoSalida || '-'}`,
                `Almuerzo Ingreso: ${registro.almuerzoIngreso || '-'} | Salida: ${registro.horaSalida || '-'}`,
                `Detalle: ${(registro.detalleAvance || '-').substring(0, 100)}...`,
            ];
            
            registroInfo.forEach(info => {
                if (yPosition > pageHeight - 15) {
                    addHeader(false);
                }
                doc.text(info, 18, yPosition);
                yPosition += 5;
            });
            
            yPosition += 5;
        });
        
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setDrawColor(0, 188, 212);
        doc.setLineWidth(0.5);
        doc.line(15, yPosition, 195, yPosition);
        
        yPosition += 8;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text('RESUMEN DEL REPORTE', 15, yPosition);
        
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.text(`Total de registros: ${registros.length}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Usuario: ${usuarioActualSeguro?.nombre || 'Sistema'}`, 15, yPosition);
        
        const fileName = `Reporte_Registro_Diario_${selectedDate || new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        closeDownloadOptions();
        mostrarNotificacionSegura(`📊 Reporte PDF generado: ${registros.length} registros`);
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, `PDF descargado: ${fileName}`, 'info');
    } catch (error) {
        console.error('Error al generar PDF completo:', error);
        mostrarNotificacionSegura('❌ Error al generar PDF: ' + error.message);
    }
}

/**
 * Descarga en formato Excel/CSV
 */
function downloadRegistriesAsExcel() {
    if (!usuarioActualSeguro) {
        mostrarNotificacionSegura('🔐 Debes iniciar sesión para descargar');
        abrirLoginSeguro();
        return;
    }

    try {
        const selectedDate = document.getElementById('registryDate').value;
        let registros = dailyRegistryData;
        
        if (selectedDate) {
            registros = dailyRegistryData.filter(r => r.fecha === selectedDate);
        }

        if (registros.length === 0) {
            mostrarNotificacionSegura('⚠️ No hay registros para descargar');
            return;
        }

        let csv = 'NOMBRE,SERVICIO,FECHA,H. INGRESO,DETALLE DE AVANCE,ALMUERZO SALIDA,ALMUERZO INGRESO,H. SALIDA,OBSERVACIONES\n';
        
        registros.forEach(r => {
            const detalle = (r.detalleAvance || '').replace(/"/g, '""');
            const obs = (r.observaciones || '').replace(/"/g, '""');
            csv += `"${r.nombre}","${r.servicio}","${r.fecha}","${r.horaIngreso}","${detalle}","${r.almuerzoSalida}","${r.almuerzoIngreso}","${r.horaSalida}","${obs}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `registro_diario_${selectedDate || new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        closeDownloadOptions();
        mostrarNotificacionSegura('📥 Archivo Excel descargado');
        registrarLogSeguridadSeguro(usuarioActualSeguro.usuario, 'Archivo Excel descargado', 'info');
    } catch (error) {
        console.error('Error al generar Excel:', error);
        mostrarNotificacionSegura('❌ Error al descargar Excel: ' + error.message);
    }
}

/**
 * Muestra opciones de descarga
 */
function showDownloadOptions(registros, selectedDate) {
    const modal = document.createElement('div');
    modal.style.cssText = `
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
    modal.id = 'downloadOptionsModal';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 2.5rem; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom: 1.5rem; color: #1a1a1a; text-align: center;">
                <i class="fas fa-download" style="color: #ff6b6b; margin-right: 0.5rem;"></i>
                Opciones de Descarga
            </h3>
            
            <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                <button onclick="downloadRegistriesAsExcel()" style="
                    padding: 1rem;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    transition: all 0.3s;
                    font-size: 1rem;
                ">
                    <i class="fas fa-file-excel"></i> Descargar como Excel (CSV)
                </button>
                
                <button onclick="downloadAllRegistriesPDF()" style="
                    padding: 1rem;
                    background: linear-gradient(135deg, #ff6b6b, #ff5252);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    transition: all 0.3s;
                    font-size: 1rem;
                ">
                    <i class="fas fa-file-pdf"></i> Descargar Todos como PDF
                </button>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
                Total de registros: <strong>${registros.length}</strong>
            </p>
            
            <button onclick="closeDownloadOptions()" style="
                width: 100%;
                padding: 0.8rem;
                background: #999;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            ">
                <i class="fas fa-times"></i> Cerrar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Cierra el modal de opciones de descarga
 */
function closeDownloadOptions() {
    const modal = document.getElementById('downloadOptionsModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

// ===== AGREGAR ANIMACIÓN FADEOUT =====
if (!document.getElementById('fadeOutStyle')) {
    const style = document.createElement('style');
    style.id = 'fadeOutStyle';
    style.innerHTML = `
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}