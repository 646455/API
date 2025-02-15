// Importar las librerías necesarias
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

// Función para validar el archivo cargado
function validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'text/plain'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
        return 'El archivo no es del tipo correcto. Por favor, carga un archivo JPG, PNG o TXT.';
    }

    if (file.size > maxSize) {
        return 'El archivo es demasiado grande. El tamaño máximo permitido es 5 MB.';
    }

    return null;
}

// Función para convertir archivos a PDF
async function convertToPDF(file) {
    const pdfDoc = await PDFDocument.create();
    const pdfPage = pdfDoc.addPage([500, 500]);

    if (file.type.startsWith('image/')) {
        const imageBytes = await file.arrayBuffer();
        const image = await pdfDoc.embedPng(imageBytes);
        const { width, height } = image.scale(1);
        pdfPage.drawImage(image, { x: 0, y: 500 - height, width, height });
    } else if (file.type === 'text/plain') {
        const text = await file.text();
        pdfPage.drawText(text, { x: 50, y: 450, size: 12 });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

// Función para dividir archivos TXT
function splitTXT(file, criteria) {
    const text = file.text();
    const parts = [];

    if (criteria.type === 'lines') {
        const lines = text.split('\n');
        const linesPerPart = criteria.value;
        for (let i = 0; i < lines.length; i += linesPerPart) {
            parts.push(lines.slice(i, i + linesPerPart).join('\n'));
        }
    } else if (criteria.type === 'words') {
        const words = text.split(' ');
        const wordsPerPart = criteria.value;
        for (let i = 0; i < words.length; i += wordsPerPart) {
            parts.push(words.slice(i, i + wordsPerPart).join(' '));
        }
    } else if (criteria.type === 'size') {
        const sizePerPart = criteria.value * 1024; // Convertir KB a bytes
        let currentPart = '';
        for (let i = 0; i < text.length; i++) {
            if (currentPart.length + text[i].length > sizePerPart) {
                parts.push(currentPart);
                currentPart = '';
            }
            currentPart += text[i];
        }
        if (currentPart) {
            parts.push(currentPart);
        }
    }

    return parts;
}

// Función para manejar la carga de archivos
function handleFileUpload(event) {
    const file = event.target.files[0];
    const errorMessage = validateFile(file);

    if (errorMessage) {
        displayMessage(errorMessage, 'error');
        return;
    }

    displayMessage(`Archivo cargado: ${file.name}`, 'success');
}

// Función para manejar la conversión a PDF
async function handleConvertToPDF() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        displayMessage('Por favor, carga un archivo primero.', 'error');
        return;
    }

    const pdfBytes = await convertToPDF(file);

    // Descargar el archivo PDF generado usando FileSaver.js
    saveAs(new Blob([pdfBytes]), 'archivo.pdf');
}

// Función para manejar la división de archivos TXT
function handleSplitTXT() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        displayMessage('Por favor, carga un archivo primero.', 'error');
        return;
    }

    const criteria = getSplitCriteria(); // Implementar la lógica para obtener los criterios seleccionados

    const parts = splitTXT(file, criteria);

    // Descargar las partes generadas como archivos TXT separados
    parts.forEach((part, index) => {
        saveAs(new Blob([part]), `parte-${index + 1}.txt`);
    });
}

// Función para mostrar mensajes de retroalimentación
function displayMessage(message, type) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add(type);
    messagesDiv.appendChild(messageElement);
}

// Función para obtener los criterios seleccionados para dividir el archivo TXT
function getSplitCriteria() {
    // Implementar la lógica para obtener los criterios seleccionados por el usuario
    // return criteria;
}

// Agregar eventos a los botones
document.getElementById('convert-to-pdf').addEventListener('click', handleConvertToPDF);
document.getElementById('split-txt').addEventListener('click', handleSplitTXT);

// Agregar evento a la carga de archivos
document.getElementById('file-input').addEventListener('change', handleFileUpload);