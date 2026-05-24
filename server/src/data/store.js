const { encryptField, decryptField } = require('../services/encryption');

const users = [
  {
    id: 'u-admin-1',
    email: 'admin@ford.demo',
    passwordHash: '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe6gKZmFqJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    role: 'administrador',
    name: 'Admin Ford',
  },
  {
    id: 'u-analyst-1',
    email: 'analista@ford.demo',
    passwordHash: '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe6gKZmFqJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    role: 'analista',
    name: 'Analista Mercado',
  },
  {
    id: 'u-user-1',
    email: 'usuario@ford.demo',
    passwordHash: '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe6gKZmFqJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    role: 'usuario',
    name: 'Cliente Demo',
  },
];

const leads = [];
const maintenanceHistory = [];
const refreshTokens = new Map();
const auditLogs = [];

const vehicles = [
  {
    marca: 'Ford',
    modelo: 'Ranger Raptor',
    versao: '2026',
    preco: 'R$ 466.500',
  },
];

function addLead(lead) {
  const record = {
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...lead,
    customerEmail: encryptField(lead.customerEmail),
    customerPhone: encryptField(lead.customerPhone),
    customerName: encryptField(lead.customerName),
  };
  leads.push(record);
  return record;
}

function getLeadsForRole(role) {
  return leads.map((l) => {
    if (role === 'administrador' || role === 'analista') {
      return {
        ...l,
        customerEmail: decryptField(l.customerEmail),
        customerPhone: decryptField(l.customerPhone),
        customerName: decryptField(l.customerName),
      };
    }
    return { id: l.id, createdAt: l.createdAt, vehicleInterest: l.vehicleInterest };
  });
}

function addMaintenance(record) {
  const entry = {
    id: `maint-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...record,
    notes: encryptField(record.notes),
    vin: encryptField(record.vin),
  };
  maintenanceHistory.push(entry);
  return entry;
}

module.exports = {
  users,
  leads,
  maintenanceHistory,
  refreshTokens,
  auditLogs,
  vehicles,
  addLead,
  getLeadsForRole,
  addMaintenance,
};
