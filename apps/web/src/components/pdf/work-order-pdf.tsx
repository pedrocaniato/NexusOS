import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Registrar fonte moderna (opcional se quiser Inter, mas Helvetica/sans-serif é mais seguro para começar)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#50C878',
    paddingBottom: 10,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B8C3D',
    letterSpacing: -1,
  },
  osTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#50C878',
  },
  osNumber: {
    fontSize: 14,
    color: '#D4A017',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7', // border-zinc-200
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#50C878',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#f4f4f5',
    paddingBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 5,
    marginTop: 30,
    textAlign: 'center',
  },
  totalSection: {
    alignSelf: 'flex-end',
    width: '30%',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B8C3D',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 5,
    marginTop: 5,
  }
});

const statusColors: Record<string, string> = {
  ENTRADA: '#38bdf8',
  ORCAMENTO: '#fbbf24',
  ABERTO: '#f97316',
  ANDAMENTO: '#0ea5e9',
  CONCLUIDO: '#10b981',
  FATURADO: '#9ef01a',
  CANCELADO: '#ef4444',
};

export const WorkOrderPdf = ({ os }: { os: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>NexusOS</Text>
          <View style={{ width: 2, height: 30, backgroundColor: '#FFD700' }} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.osTitle}>Ordem de Serviço</Text>
          <Text style={styles.osNumber}>#{os.id.toString().padStart(4, '0')}</Text>
        </View>
      </View>

      {/* Seção 1: Status e Datas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo da OS</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Status Atual</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[os.status] || '#ccc' }]}>
              <Text>{os.status}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Data de Entrada</Text>
            <Text style={styles.value}>{new Date(os.entryDate).toLocaleDateString()} {new Date(os.entryDate).toLocaleTimeString()}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Prioridade</Text>
            <Text style={[styles.value, { color: os.priority === 'HIGH' ? '#ef4444' : '#333' }]}>{os.priority}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Prazo Estimado</Text>
            <Text style={styles.value}>{os.deadline ? new Date(os.deadline).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Seção 2: Dados do Cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Cliente</Text>
        <View style={styles.grid}>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <Text style={styles.label}>Nome / Razão Social</Text>
            <Text style={[styles.value, { fontSize: 12, fontWeight: 'bold' }]}>{os.customer.name}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>CPF / CNPJ</Text>
            <Text style={styles.value}>{os.customer.document || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{os.customer.phone || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{os.customer.email || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Seção 3: Equipamento e Relato */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do Equipamento</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Equipamento</Text>
            <Text style={styles.value}>{os.equipment}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Marca / Modelo</Text>
            <Text style={styles.value}>{os.brandModel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Nº de Série</Text>
            <Text style={styles.value}>{os.serialNumber || 'N/A'}</Text>
          </View>
        </View>
        <View style={{ marginTop: 10, padding: 8, backgroundColor: '#fdfcf0', borderLeft: 3, borderLeftColor: '#FFD700' }}>
          <Text style={styles.label}>Relato do Cliente</Text>
          <Text style={[styles.value, { fontStyle: 'italic' }]}>"{os.clientReport}"</Text>
        </View>
        {(os.technicalAnalysis || os.equipmentRef?.observations) && (
          <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f0fdf4', borderLeft: 3, borderLeftColor: '#50C878' }}>
            <Text style={styles.label}>Laudo Técnico / Histórico do Equipamento</Text>
            {os.technicalAnalysis && <Text style={[styles.value, { marginBottom: 5 }]}>{os.technicalAnalysis}</Text>}
            {os.equipmentRef?.observations && (
              <Text style={[styles.value, { fontSize: 8, color: '#666' }]}>
                Obs. Permanentes: {os.equipmentRef.observations}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Seção 4: Itens e Serviços (se houver) */}
      {(os.products?.length > 0 || os.services?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peças e Serviços</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.label, styles.colDesc]}>Descrição</Text>
              <Text style={[styles.label, styles.colQty]}>Qtd</Text>
              <Text style={[styles.label, styles.colPrice]}>Unitário</Text>
              <Text style={[styles.label, styles.colTotal]}>Total</Text>
            </View>
            
            {os.products.map((item: any, i: number) => (
              <View key={`p-${i}`} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.product.name}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>R$ {item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colTotal}>R$ {(item.quantity * item.unitPrice).toFixed(2)}</Text>
              </View>
            ))}

            {os.services.map((item: any, i: number) => (
              <View key={`s-${i}`} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.service.name}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>R$ {item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colTotal}>R$ {(item.quantity * item.unitPrice).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>R$ {os.totalValue.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
              <Text style={{ fontWeight: 'bold' }}>R$ {os.totalValue.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.signatureBox}>
          <Text style={styles.label}>Assinatura do Técnico</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.label}>Assinatura do Cliente</Text>
        </View>
      </View>

      <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#a1a1aa', fontSize: 8 }}>
        Gerado automaticamente pelo NexusOS em {new Date().toLocaleString()} - www.nexusos.com
      </Text>
    </Page>
  </Document>
);
