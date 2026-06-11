const PDFDocument = require('pdfkit');

function formatBirthDate(isoDate) {
  const [year, month, day] = isoDate.split('-');

  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}/${month}/${year}`;
}

function formatCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
}

function buildTemplateParagraphs(data) {
  return [
    'PRIMERA. COMPARECIENTE.',
    `Yo, ${data.fullName}, nacido el ${formatBirthDate(data.birthDate)}, de nacionalidad ${data.nationality}, estado civil ${data.civilStatus}, con domicilio en ${data.address} e identificado con el documento ${data.idNumber}, declaro que otorgo este testamento de manera libre y consciente.`,
    'SEGUNDA. HEREDEROS PRINCIPALES.',
    `Instituyo como herederos principales a: ${data.heirs}.`,
    'TERCERA. LEGADO ESPECIAL.',
    `Adicionalmente, establezco el siguiente legado especial: ${data.specialLegacy}.`,
    'CUARTA. DESIGNACION DE ALBACEA.',
    `Nombro como albacea a ${data.executorName}, con relacion o parentesco: ${data.executorRelation}, para que administre y ejecute este testamento conforme a derecho.`,
    'QUINTA. TUTORIA.',
    `En caso de ser necesario, designo como tutor a ${data.guardianName}, quien se hara cargo de: ${data.guardianScope}.`,
    'SEXTA. CLAUSULA FINAL.',
    'Este documento corresponde a un borrador generado digitalmente con base en la informacion proporcionada por el testador y debera revisarse y protocolizarse ante notario para su plena validez juridica.',
  ];
}

function createWillPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 56,
      info: {
        Title: 'Testamento - Borrador',
        Author: 'Plataforma de Testamentos',
      },
    });

    const chunks = [];

    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    doc.on('error', (error) => {
      reject(error);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    doc.font('Times-Bold').fontSize(18).text('TESTAMENTO ABIERTO - BORRADOR', {
      align: 'center',
    });

    doc.moveDown(0.5);
    doc.font('Times-Roman').fontSize(10).text(`Fecha de emision: ${formatCurrentDate()}`, {
      align: 'right',
    });

    doc.moveDown();

    const paragraphs = buildTemplateParagraphs(data);

    paragraphs.forEach((paragraph) => {
      const isTitle = paragraph === paragraph.toUpperCase();

      doc.font(isTitle ? 'Times-Bold' : 'Times-Roman').fontSize(isTitle ? 12 : 11).text(paragraph, {
        align: isTitle ? 'left' : 'justify',
        lineGap: 3,
      });

      doc.moveDown(isTitle ? 0.4 : 0.9);
    });

    doc.moveDown(2);
    doc.font('Times-Roman').fontSize(11).text('Firma del testador: ______________________________');
    doc.moveDown(1.2);
    doc.text('Firma del notario: _______________________________');

    doc.end();
  });
}

module.exports = {
  createWillPdfBuffer,
};
