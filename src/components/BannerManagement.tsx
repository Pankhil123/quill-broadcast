import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';

const BANNER_TYPES = [
  { value: 'hero', label: 'Hero Banner', description: 'Large banner below header', size: '1920x600px' },
  { value: 'header', label: 'Header Banner', description: 'Full-width banner at top', size: '1920x120px' },
  { value: 'interstitial', label: 'Interstitial Banner', description: 'Between content sections', size: '1200x400px' },
];

const SECTIONS = [
  { value: '', label: 'All Pages' },
  { value: 'commodities', label: 'Commodities' },
  { value: 'cryptocurrencies', label: 'Cryptocurrencies' },
  { value: 'indices', label: 'Indices' },
  { value: 'equities', label: 'Equities' },
  { value: 'others', label: 'Others' },
];

export function BannerManagement() {
  try {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<{
      title: string;
      banner_type: 'hero' | 'header' | 'interstitial';
      image_url: string;
      link_url: string;
      section: string;
      active: boolean;
    }>({
      title: '',
      banner_type: 'hero',
      image_url: '',
      link_url: '',
      section: '',
      active: true,
    });

    const { data: banners, isLoading, error } = useQuery({
      queryKey: ['banners-admin'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        return data;
      },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);

        setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
        toast.success('Image uploaded successfully');
      } catch (err) {
        console.error('Banner image upload error:', err);
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };

    const createBanner = useMutation({
      mutationFn: async (newBanner: typeof formData) => {
        const { data, error } = await supabase
          .from('banners')
          .insert([newBanner])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
        queryClient.invalidateQueries({ queryKey: ['banners'] });
        toast.success('Banner created successfully');
        setFormData({
          title: '',
          banner_type: 'hero',
          image_url: '',
          link_url: '',
          section: '',
          active: true,
        });
      },
      onError: (err) => {
        console.error('Create banner error:', err);
        toast.error('Failed to create banner');
      },
    });

    const deleteBanner = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('banners')
          .delete()
          .eq('id', id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
        queryClient.invalidateQueries({ queryKey: ['banners'] });
        toast.success('Banner deleted successfully');
      },
      onError: (err) => {
        console.error('Delete banner error:', err);
        toast.error('Failed to delete banner');
      },
    });

    const toggleBanner = useMutation({
      mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
        const { error } = await supabase
          .from('banners')
          .update({ active })
          .eq('id', id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
        queryClient.invalidateQueries({ queryKey: ['banners'] });
        toast.success('Banner status updated');
      },
      onError: (err) => {
        console.error('Toggle banner error:', err);
        toast.error('Failed to update banner');
      },
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.image_url) {
        toast.error('Please upload a banner image');
        return;
      }

      createBanner.mutate(formData);
    };

    if (isLoading) {
      return <div>Loading banners...</div>;
    }

    if (error) {
      console.error('Load banners error:', error);
      return <div>Failed to load banners.</div>;
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Banner Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Upload and manage promotional banners for different areas of the site.
          </p>
        </div>

        {/* Banner Size Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Banner Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {BANNER_TYPES.map((type) => (
                <div key={type.value} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{type.label}:</span>
                  <span className="text-muted-foreground">{type.size} ({type.description})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Always show form to avoid any toggle issues */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Summer Sale Banner"
                />
              </div>

              <div>
                <Label htmlFor="banner_type">Banner Type</Label>
                <Select
                  value={formData.banner_type}
                  onValueChange={(value: 'hero' | 'header' | 'interstitial') =>
                    setFormData({ ...formData, banner_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANNER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} - {type.size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Banner Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button type="button" disabled={uploading} variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  {formData.image_url && (
                    <div className="relative w-full h-32 border rounded overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt="Banner preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="link_url">Link URL (Optional)</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="section">Display On</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData({ ...formData, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <Button type="submit" disabled={uploading || !formData.image_url}>
                Create Banner
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing banners list */}
        <div className="grid gap-4">
          {banners && banners.length > 0 ? (
            banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-32 h-20 border rounded overflow-hidden flex-shrink-0">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{banner.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {BANNER_TYPES.find((t) => t.value === banner.banner_type)?.label} •
                        {banner.section ? ` ${SECTIONS.find((s) => s.value === banner.section)?.label}` : ' All Pages'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${banner.id}`}>Active</Label>
                      <Switch
                        id={`active-${banner.id}`}
                        checked={banner.active}
                        onCheckedChange={(checked) =>
                          toggleBanner.mutate({ id: banner.id, active: checked })
                        }
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteBanner.mutate(banner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No banners created yet. Use the form above to add your first banner.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error('BannerManagement render error:', err);
    return <div>Something went wrong while loading the banner manager.</div>;
  }
}
