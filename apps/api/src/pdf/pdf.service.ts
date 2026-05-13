import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateWorkOrderPdf(os: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Header
        doc
          .fontSize(20)
          .text('NexusOS - Ordem de Servico', { align: 'center' })
          .moveDown();

        doc
          .fontSize(12)
          .text(`OS #: ${os?.id?.toString().padStart(4, '0') || 'N/A'}`)
          .text(`Status: ${os?.status || 'N/A'}`)
          .text(`Data: ${new Date().toLocaleDateString('pt-BR')}`)
          .moveDown();

        // Customer
        doc
          .fontSize(14)
          .text('Dados do Cliente')
          .fontSize(12)
          .text(`Nome: ${os?.customer?.name || 'N/A'}`)
          .moveDown();

        // Equipment
        doc
          .fontSize(14)
          .text('Equipamento')
          .fontSize(12)
          .text(`Modelo: ${os?.equipment || 'N/A'} - ${os?.brandModel || 'N/A'}`)
          .text(`Relato: ${os?.clientReport || 'N/A'}`)
          .moveDown();

        // Values
        doc
          .fontSize(14)
          .text('Valores')
          .fontSize(12)
          .text(`Total: R$ ${os?.totalValue?.toFixed(2) || '0.00'}`)
          .moveDown();

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
