"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Subdomain {
  id: string;
  name: string;
  title: string;
  description: string | null;
  logoUrl: string | null;
  themeColor: string | null;
  isActive: boolean;
  settings: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubdomainsPage() {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    logoUrl: "",
    themeColor: "#3b82f6",
    isActive: true,
  });

  useEffect(() => {
    fetchSubdomains();
  }, []);

  const fetchSubdomains = async () => {
    try {
      const res = await fetch("/api/admin/subdomains");
      if (!res.ok) throw new Error("Failed to fetch subdomains");
      const data = await res.json();
      setSubdomains(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const url = editingId 
        ? `/api/admin/subdomains/${editingId}`
        : "/api/admin/subdomains";
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save subdomain");
      }
      
      await fetchSubdomains();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        title: "",
        description: "",
        logoUrl: "",
        themeColor: "#3b82f6",
        isActive: true,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (subdomain: Subdomain) => {
    setFormData({
      name: subdomain.name,
      title: subdomain.title,
      description: subdomain.description || "",
      logoUrl: subdomain.logoUrl || "",
      themeColor: subdomain.themeColor || "#3b82f6",
      isActive: subdomain.isActive,
    });
    setEditingId(subdomain.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subdomain?")) return;
    
    try {
      const res = await fetch(`/api/admin/subdomains/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete subdomain");
      
      await fetchSubdomains();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      title: "",
      description: "",
      logoUrl: "",
      themeColor: "#3b82f6",
      isActive: true,
    });
    setError("");
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subdomain Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage subdomains for the Heptapus Group website
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          + Add Subdomain
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Subdomain" : "New Subdomain"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subdomain Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="flux"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                  disabled={!!editingId}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  e.g., "flux" for flux.heptapusgroup.com
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="HeptaFlux"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Energy & Thermal Systems Division"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="h-10 w-20 border border-border rounded-lg bg-background cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Title</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Theme</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subdomains.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No subdomains found. Click "Add Subdomain" to create one.
                </td>
              </tr>
            ) : (
              subdomains.map((subdomain) => (
                <tr key={subdomain.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-mono">{subdomain.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {subdomain.name}.heptapusgroup.com
                    </div>
                  </td>
                  <td className="px-4 py-3">{subdomain.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {subdomain.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: subdomain.themeColor || "#3b82f6" }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      subdomain.isActive 
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                    }`}>
                      {subdomain.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`https://${subdomain.name}.heptapusgroup.com`}
                        target="_blank"
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-accent transition-colors no-underline"
                      >
                        Visit
                      </Link>
                      <button
                        onClick={() => handleEdit(subdomain)}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-accent transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subdomain.id)}
                        className="px-3 py-1 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
