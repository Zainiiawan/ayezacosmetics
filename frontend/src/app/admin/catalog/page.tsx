'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, X, Tag, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import { categoryApi, brandApi, Category, Brand } from '@/lib/api/categoryApi';

type Tab = 'categories' | 'brands';

export default function AdminCatalogPage() {
  const [tab, setTab] = useState<Tab>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, brs] = await Promise.all([categoryApi.getAll(), brandApi.getAll()]);
      setCategories(cats);
      setBrands(brs);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item: Category | Brand) => {
    setEditingId(item._id);
    setName(item.name);
    setDescription(item.description || '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = { name: name.trim(), description: description.trim() || undefined };
      if (tab === 'categories') {
        if (editingId) await categoryApi.update(editingId, payload);
        else await categoryApi.create(payload);
      } else {
        if (editingId) await brandApi.update(editingId, payload);
        else await brandApi.create(payload);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Disable this ${tab === 'categories' ? 'category' : 'brand'}?`)) return;
    try {
      if (tab === 'categories') await categoryApi.delete(id);
      else await brandApi.delete(id);
      await fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const items = tab === 'categories' ? categories : brands;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-black">Catalog</h1>
              <p className="text-gray-600">Manage categories and brands</p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add {tab === 'categories' ? 'Category' : 'Brand'}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'categories' ? 'bg-rose-gold text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setTab('brands')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'brands' ? 'bg-rose-gold text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-4 h-4" />
            Brands ({brands.length})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No {tab} yet.{' '}
              <button onClick={openCreate} className="text-rose-gold hover:underline">
                Add one
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  {tab === 'categories' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-black">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{item.slug}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    {tab === 'categories' && (
                      <td className="px-6 py-4 text-gray-600">{(item as Category).productCount ?? 0}</td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => void handleDelete(item._id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold">
                {editingId ? 'Edit' : 'Add'} {tab === 'categories' ? 'Category' : 'Brand'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-rose-gold focus:ring-2 focus:ring-rose-gold focus:ring-opacity-20"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-rose-gold focus:ring-2 focus:ring-rose-gold focus:ring-opacity-20"
                  rows={3}
                  placeholder="Short description"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
