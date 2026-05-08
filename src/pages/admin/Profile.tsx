// ============================================================
// Profile.tsx — Admin Profile Page (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { useState, useEffect } from "react";
import { Camera, Mail, Shield, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ImageWithFallback } from "../../components/Assets/ImageWithFallback";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { toast } from "sonner";
import { fetchAdminProfile, updateAdminProfile, updateAdminImage } from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";

interface AdminProfileProps {
  logout: () => void;
  userRole: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  profile_image?: string;
}

// ─── Pure mapper ─────────────────────────────────────────────

const mapProfile = (data: any): ProfileData => ({
  firstName: data.full_name?.split(" ")[0] ?? "",
  lastName: data.full_name?.split(" ").slice(1).join(" ") ?? "",
  email: data.email ?? "",
  phone: data.phone ?? "",
  linkedin: data.linkedin ?? "",
  location: data.location ?? "",
  profile_image: data.profile_image ?? "",
});

// ─── Main Component ──────────────────────────────────────────

export default function AdminProfile({ logout }: AdminProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileData>({ firstName: "", lastName: "", email: "", phone: "", linkedin: "", location: "" });
  const [formData, setFormData] = useState<ProfileData>({ ...originalData });

  useEffect(() => {
    fetchAdminProfile()
      .then((data: any) => {
        const mapped = mapProfile(data);
        setOriginalData(mapped);
        setFormData(mapped);
      })
      .catch(() => toast.error("Failed to load profile data"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    try {
      const data: any = await updateAdminImage(file);
      toast.success("Image updated successfully");
      setFormData((prev) => ({ ...prev, profile_image: data.profile_image }));
    } catch {
      toast.error("Image upload failed");
    } finally {
      setPreviewImage(null);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) setFormData({ ...originalData });
    setIsEditing((prev) => !prev);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const result: any = await updateAdminProfile({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        linkedin: formData.linkedin,
        location: formData.location,
      });
      const updated = mapProfile(result.data);
      setOriginalData(updated);
      setFormData(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc =
    previewImage ??
    (formData.profile_image
      ? `${formData.profile_image}?t=${Date.now()}`
      : "https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=200");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/profile")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Admin Profile</h1>
                <p className="text-gray-600">Manage your admin profile information</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-profile" />
            </div>
          </header>

          <main className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-violet-600" />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {/* Avatar Card */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <ImageWithFallback src={avatarSrc} alt="Admin" className="w-24 h-24 rounded-full object-cover" />
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gradient-to-r from-violet-600 to-cyan-500 p-2 rounded-full text-white cursor-pointer hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                          <Camera className="h-4 w-4" />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl">{formData.firstName} {formData.lastName}</h2>
                          <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-800 rounded-full">
                            <Shield className="h-4 w-4" /><span className="text-sm">Admin</span>
                          </div>
                        </div>
                        <p className="text-gray-600">{formData.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Form */}
                <Card className="mb-6">
                  <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {(["firstName", "lastName"] as const).map((field) => (
                        <div key={field} className="space-y-2">
                          <Label htmlFor={field}>{field === "firstName" ? "First Name" : "Last Name"}</Label>
                          <Input id={field} value={formData[field]} onChange={(e) => handleInputChange(field, e.target.value)} disabled={!isEditing} />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="email" className="pl-10 bg-gray-50" value={formData.email} disabled />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input defaultValue="Admin" disabled className="bg-gray-50" />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      {!isEditing ? (
                        <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300" onClick={handleEditToggle}>
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>Cancel</Button>
                          <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300" onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}