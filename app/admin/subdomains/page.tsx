"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Feature {
  title: string;
  desc: string;
}

interface SubdomainSettings {
  tagline?: string;
  contactEmail?: string;
  themeKey?: string;
  features?: Feature[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  aboutText?: string;
  heroImage?: string;
}

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

function parseSettings(raw: string | null): SubdomainSettings {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

export default function SubdomainsPage() {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "settings" | "features" | "social">("general");
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    logoUrl: "",
    themeColor: "#3b82f6",
    isActive: true,
  });

  const [settingsData, setSettingsData] = useState<SubdomainSettings>({
    tagline: "",
    contactEmail: "",
    themeKey: "",
    features: [{ title: "", desc: "" }],
    socialLinks: {},
    aboutText: "",
    heroImage: "",
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

      // Clean up features: remove empty ones
      const cleanFeatures = (settingsData.features || []).filter(
        (f) => f.title.trim() || f.desc.trim()
      );

      const payload = {
        ...formData,
        settings: {
          ...settingsData,
          features: cleanFeatures,
        },
      };
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save subdomain");
      }
      
      await fetchSubdomains();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setActiveTab("general");
    setFormData({
      name: "",
      title: "",
      description: "",
      logoUrl: "",
      themeColor: "#3b82f6",
      isActive: true,
    });
    setSettingsData({
      tagline: "",
      contactEmail: "",
      themeKey: "",
      features: [{ title: "", desc: "" }],
      socialLinks: {},
      aboutText: "",
      heroImage: "",
    });
    setError("");
  };

  const handleEdit = (subdomain: Subdomain) => {
    const settings = parseSettings(subdomain.settings);
    setFormData({
      name: subdomain.name,
      title: subdomain.title,
      description: subdomain.description || "",
      logoUrl: subdomain.logoUrl || "",
      themeColor: subdomain.themeColor || "#3b82f6",
      isActive: subdomain.isActive,
    });
    setSettingsData({
      tagline: settings.tagline || "",
      contactEmail: settings.contactEmail || "",
      themeKey: settings.themeKey || "",
      features: settings.features?.length ? settings.features : [{ title: "", desc: "" }],
      socialLinks: settings.socialLinks || {},
      aboutText: settings.aboutText || "",
      heroImage: settings.heroImage || "",
    });
    setEditingId(subdomain.id);
    setActiveTab("general");
    setShowForm(true);
  };

  const addFeature = () => {
    setSettingsData({
      ...settingsData,
      features: [...(settingsData.features || []), { title: "", desc: "" }],
    });
  };

  const removeFeature = (index: number) => {
    const updated = [...(settingsData.features || [])];
    updated.splice(index, 1);
    setSettingsData({ ...settingsData, features: updated });
  };

  const updateFeature = (index: number, field: "title" | "desc", value: string) => {
    const updated = [...(settingsData.features || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettingsData({ ...settingsData, features: updated });
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
    resetForm();
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

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {(["general", "settings", "features", "social"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "general" && "General"}
                {tab === "settings" && "Settings"}
                {tab === "features" && "Features"}
                {tab === "social" && "Social & Links"}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Tab */}
            {activeTab === "general" && (
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
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settingsData.tagline || ""}
                    onChange={(e) => setSettingsData({ ...settingsData, tagline: e.target.value })}
                    placeholder="Energy Systems"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Short tagline displayed on the hero section</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settingsData.contactEmail || ""}
                    onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
                    placeholder="flux@heptapusgroup.com"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Theme Key</label>
                  <select
                    value={settingsData.themeKey || ""}
                    onChange={(e) => setSettingsData({ ...settingsData, themeKey: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="">Select a theme</option>
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="software">Software</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="security">Security</option>
                    <option value="qa">QA / Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                  <input
                    type="url"
                    value={settingsData.heroImage || ""}
                    onChange={(e) => setSettingsData({ ...settingsData, heroImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">About Text</label>
                  <textarea
                    value={settingsData.aboutText || ""}
                    onChange={(e) => setSettingsData({ ...settingsData, aboutText: e.target.value })}
                    placeholder="Detailed description about this division..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Displayed on the About page for this subdomain</p>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === "features" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add features/services that will appear on the subdomain landing page. You can add up to 6 features.
                </p>
                {(settingsData.features || []).map((feature, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 border border-border rounded-lg bg-background">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-muted-foreground">
                          Feature Title
                        </label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, "title", e.target.value)}
                          placeholder="e.g., Network Architecture"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-muted-foreground">
                          Description
                        </label>
                        <input
                          type="text"
                          value={feature.desc}
                          onChange={(e) => updateFeature(index, "desc", e.target.value)}
                          placeholder="e.g., Scalable and secure network infrastructure design"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="mt-5 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove feature"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {(settingsData.features?.length || 0) < 6 && (
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Feature
                  </button>
                )}
              </div>
            )}

            {/* Social & Links Tab */}
            {activeTab === "social" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub</label>
                  <input
                    type="url"
                    value={settingsData.socialLinks?.github || ""}
                    onChange={(e) => setSettingsData({
                      ...settingsData,
                      socialLinks: { ...settingsData.socialLinks, github: e.target.value },
                    })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={settingsData.socialLinks?.linkedin || ""}
                    onChange={(e) => setSettingsData({
                      ...settingsData,
                      socialLinks: { ...settingsData.socialLinks, linkedin: e.target.value },
                    })}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter / X</label>
                  <input
                    type="url"
                    value={settingsData.socialLinks?.twitter || ""}
                    onChange={(e) => setSettingsData({
                      ...settingsData,
                      socialLinks: { ...settingsData.socialLinks, twitter: e.target.value },
                    })}
                    placeholder="https://x.com/..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <input
                    type="url"
                    value={settingsData.socialLinks?.instagram || ""}
                    onChange={(e) => setSettingsData({
                      ...settingsData,
                      socialLinks: { ...settingsData.socialLinks, instagram: e.target.value },
                    })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={settingsData.socialLinks?.website || ""}
                    onChange={(e) => setSettingsData({
                      ...settingsData,
                      socialLinks: { ...settingsData.socialLinks, website: e.target.value },
                    })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            )}
            
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
              <th className="text-left px-4 py-3 font-semibold">Tagline</th>
              <th className="text-left px-4 py-3 font-semibold">Theme</th>
              <th className="text-left px-4 py-3 font-semibold">Features</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subdomains.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No subdomains found. Click "Add Subdomain" to create one.
                </td>
              </tr>
            ) : (
              subdomains.map((subdomain) => {
                const settings = parseSettings(subdomain.settings);
                return (
                  <tr key={subdomain.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold">{subdomain.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {subdomain.name}.heptapusgroup.com
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{subdomain.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {subdomain.description || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {settings.tagline || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: subdomain.themeColor || "#3b82f6" }}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {subdomain.themeColor || "#3b82f6"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {settings.features?.length || 0} features
                      </span>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
