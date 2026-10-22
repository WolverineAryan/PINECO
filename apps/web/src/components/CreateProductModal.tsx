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
  const { workspaceId, reloadProducts, setActiveProduct } = useRole();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E8E8DC] shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8DC]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F6C324]/20 text-[#191919] flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-[#191919]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#191919]">New Product Folder</h2>
              <p className="text-[11px] text-slate-500">Create an isolated brand compliance workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#191919]">Product / Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex AI, Pineco Mobile, Enterprise Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6C324] bg-[#FFFFF0]/40 text-[#191919]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#191919]">Category / Domain</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6C324] bg-white text-[#191919]"
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
            <label className="text-xs font-semibold text-[#191919]">Product Description & Scope</label>
            <textarea
              rows={3}
              placeholder="Brief summary of what this product is and target market..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6C324] bg-[#FFFFF0]/40 text-[#191919] resize-none"
            />
          </div>

          <div className="p-3 bg-[#FFFFF0] border border-[#F6C324]/40 rounded-xl text-[11px] text-slate-600 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-[#F6C324] shrink-0 mt-0.5" />
            <p>
              This folder will store isolated brand guidelines, prohibited terminology, verified facts, and review histories specifically for this product.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-5 py-2 text-xs font-bold bg-[#F6C324] hover:bg-[#E5B520] text-[#191919] rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {saving ? 'Creating Folder...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
