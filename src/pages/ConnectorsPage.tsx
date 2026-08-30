import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, Trash2, LockOpen, Search, X } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import {
  getConnectors,
  createConnector,
  deleteConnector,
  authorizeConnector,
  type Connector,
} from '../services/connectorService';

const availableSystems = [
  { id: 'google_fit', label: 'Google Fit' },
  { id: 'cerner', label: 'Cerner' },
];

export function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadConnectors = async () => {
    setIsLoading(true);
    try {
      const data = await getConnectors();
      setConnectors(data);
    } catch {
      setSnackbar({ message: 'Failed to load connectors', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnectors();
  }, []);

  useEffect(() => {
    if (snackbar) {
      const t = setTimeout(() => setSnackbar(null), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar]);

  const filtered = connectors.filter((c) => {
    const matchesSearch = c.ehr_system.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.is_active) ||
      (filterStatus === 'inactive' && !c.is_active);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: connectors.length,
    active: connectors.filter((c) => c.is_active).length,
    authorized: connectors.filter((c) => c.is_authorized).length,
  };

  const handleAdd = async () => {
    if (!selectedSystem) return;
    setIsProcessing(true);
    try {
      await createConnector({ ehr_system: selectedSystem, is_active: true });
      setSnackbar({ message: 'Connector added', type: 'success' });
      setShowAddModal(false);
      setSelectedSystem('');
      await loadConnectors();
    } catch {
      setSnackbar({ message: 'Failed to add connector', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (ehrSystem: string) => {
    setIsProcessing(true);
    try {
      await deleteConnector(ehrSystem);
      setSnackbar({ message: 'Connector deleted', type: 'success' });
      setDeleteConfirm(null);
      await loadConnectors();
    } catch {
      setSnackbar({ message: 'Failed to delete connector', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthorize = async (ehrSystem: string) => {
    setIsProcessing(true);
    try {
      const response = await authorizeConnector(ehrSystem);
      if (response.authorization_url) {
        window.open(response.authorization_url, '_blank');
      }
    } catch {
      setSnackbar({ message: 'Failed to start authorization', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connectors</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your health data connections</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Authorized', value: stats.authorized },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search connectors..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No connectors found</p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map((connector) => (
              <motion.div
                key={connector.ehr_system}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {connector.ehr_system.replace(/_/g, ' ')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={connector.is_active ? 'success' : 'default'}>
                        {connector.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={connector.is_authorized ? 'info' : 'warning'}>
                        {connector.is_authorized ? 'Authorized' : 'Not Authorized'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!connector.is_authorized && (
                      <button
                        onClick={() => handleAuthorize(connector.ehr_system)}
                        disabled={isProcessing}
                        className="p-2 rounded-lg bg-[#6F42C1]/10 text-[#6F42C1] hover:bg-[#6F42C1]/20"
                        title="Authorize"
                      >
                        <LockOpen className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(connector.ehr_system)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => !isProcessing && setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Connector</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-6"
              >
                <option value="">Select a system...</option>
                {availableSystems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAdd} isLoading={isProcessing} disabled={!selectedSystem}>
                  Add
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Connector</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this connector?
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDelete(deleteConfirm)}
                  isLoading={isProcessing}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto px-4 py-3 rounded-xl text-sm text-white z-50 ${
              snackbar.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {snackbar.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
