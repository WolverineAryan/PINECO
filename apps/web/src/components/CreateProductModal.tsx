'use client';

import React, { useState } from 'react';
import { FolderPlus, X, Sparkles, Building, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { useRole } from './RoleContext';
import { useToast } from './Toast';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const { workspaceId, reloadProducts, setActiveProduct, hasPermission, role } = useRole();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cloud Platform');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const newProd = await api.createProduct({
        name: name.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
        workspace_id: workspaceId,
      });

      success('Product Folder Created', `Governance space ready for ${newProd.name}`);
      await reloadProducts();
      setActiveProduct(newProd);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toastError('Creation Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black">New Product Folder</h2>
              <p className="text-[11px] text-neutral-500">Create an isolated brand compliance workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Product / Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex AI, Pineco Mobile, Enterprise Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Category / Domain</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black bg-white text-black"
            >
              <option value="Cloud Platform">Cloud Platform / SaaS</option>
              <option value="Mobile App">Mobile Application</option>
              <option value="Hardware">Hardware / Device</option>
              <option value="Financial Services">Financial & Fintech</option>
              <option value="Health & Bio">Healthcare & Pharma</option>
              <option value="Corporate Brand">Corporate Parent Brand</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Product Description & Scope</label>
            <textarea
              rows={3}
              placeholder="Brief summary of what this product is and target market..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black bg-white text-black resize-none"
            />
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <p>
              This folder will store isolated brand guidelines, prohibited terminology, verified facts, and review histories specifically for this product.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !hasPermission('canManageWorkspace')}
              className="px-5 py-2.5 text-xs font-bold bg-black hover:bg-neutral-800 text-white rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {saving ? 'Creating Folder...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
