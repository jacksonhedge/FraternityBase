import { useState, useEffect } from 'react';
import {
  Rocket,
  CheckCircle2,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Database,
  Lock
} from 'lucide-react';

type Status = 'completed' | 'in-progress' | 'planned' | 'on-hold';
type Category = 'features' | 'data';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: Status;
  quarter?: string;
  category: Category;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

const RoadmapAdmin = () => {
  const [activeTab, setActiveTab] = useState<Category>('features');
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RoadmapItem>>({
    title: '',
    description: '',
    status: 'planned',
    quarter: '',
    icon: 'Rocket'
  });

  useEffect(() => {
    fetchRoadmapItems();
  }, []);

  const fetchRoadmapItems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roadmap`);
      if (!response.ok) throw new Error('Failed to fetch roadmap items');
      const data: RoadmapItem[] = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching roadmap items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roadmap/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          status: editingItem.status,
          quarter: editingItem.quarter,
          category: editingItem.category,
          icon: editingItem.icon
        }),
      });

      if (!response.ok) throw new Error('Failed to update roadmap item');
      const updatedItem = await response.json();
      setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating roadmap item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roadmap/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete roadmap item');
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newItem.title || '',
          description: newItem.description || '',
          status: newItem.status || 'planned',
          quarter: newItem.quarter,
          category: activeTab,
          icon: newItem.icon || 'Rocket'
        }),
      });

      if (!response.ok) throw new Error('Failed to create roadmap item');
      const createdItem = await response.json();
      setItems([...items, createdItem]);
      setShowAddModal(false);
      setNewItem({
        title: '',
        description: '',
        status: 'planned',
        quarter: '',
        icon: 'Rocket'
      });
    } catch (error) {
      console.error('Error creating roadmap item:', error);
      alert('Failed to create item. Please try again.');
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />Completed
        </span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />In Progress
        </span>;
      case 'planned':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          <Target className="w-3 h-3 mr-1" />Planned
        </span>;
      case 'on-hold':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <Lock className="w-3 h-3 mr-1" />On Hold
        </span>;
    }
  };

  const filteredItems = items.filter(item => item.category === activeTab);

  if (loading) {
    return <div className="text-gray-400">Loading roadmap...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Product Roadmap Management</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'features'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Rocket className="w-4 h-4" />
          Features ({items.filter(i => i.category === 'features').length})
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Database className="w-4 h-4" />
          Data Coverage ({items.filter(i => i.category === 'data').length})
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No items yet. Click "Add Item" to create one.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isEditing = editingItem?.id === item.id;

            return (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="Title"
                    />
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      rows={3}
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editingItem.quarter || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, quarter: e.target.value })}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        placeholder="Quarter"
                      />
                      <select
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as Status })}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                      <input
                        type="text"
                        value={editingItem.icon || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        placeholder="Icon"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          {getStatusBadge(item.status)}
                        </div>
                        {item.quarter && (
                          <span className="text-xs text-gray-400">{item.quarter}</span>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-blue-400 hover:bg-gray-700 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-400 hover:bg-gray-700 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add Roadmap Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Feature or data item title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Detailed description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quarter</label>
                  <input
                    type="text"
                    value={newItem.quarter}
                    onChange={(e) => setNewItem({ ...newItem, quarter: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., Q1 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as Status })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Icon (optional)</label>
                <input
                  type="text"
                  value={newItem.icon}
                  onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Rocket, Target, etc."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddItem}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapAdmin;
