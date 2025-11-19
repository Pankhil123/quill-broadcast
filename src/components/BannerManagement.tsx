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
import { Trash2, Plus } from 'lucide-react';

const BANNER_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'top', label: 'Top Banner' },
  { value: 'interstitial', label: 'Interstitial Banner' },
  { value: 'sidebar', label: 'Sidebar Banner' },
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
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    banner_type: 'hero' | 'top' | 'interstitial' | 'sidebar';
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

  const { data: banners, isLoading } = useQuery({
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
      toast.success('Banner created successfully');
      setShowForm(false);
      setFormData({
        title: '',
        banner_type: 'hero',
        image_url: '',
        link_url: '',
        section: '',
        active: true,
      });
    },
    onError: () => {
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
      toast.success('Banner deleted successfully');
    },
    onError: () => {
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
      toast.success('Banner status updated');
    },
    onError: () => {
      toast.error('Failed to update banner');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBanner.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading banners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banner Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {showForm && (
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
                />
              </div>

              <div>
                <Label htmlFor="banner_type">Banner Type</Label>
                <Select
                  value={formData.banner_type}
                  onValueChange={(value: 'hero' | 'top' | 'interstitial' | 'sidebar') => setFormData({ ...formData, banner_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANNER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="link_url">Link URL (Optional)</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
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

              <div className="flex gap-4">
                <Button type="submit">Create Banner</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {banners?.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <h3 className="font-semibold">{banner.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {BANNER_TYPES.find(t => t.value === banner.banner_type)?.label} • 
                  {banner.section ? ` ${SECTIONS.find(s => s.value === banner.section)?.label}` : ' All Pages'}
                </p>
                <a href={banner.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  View Image
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${banner.id}`}>Active</Label>
                  <Switch
                    id={`active-${banner.id}`}
                    checked={banner.active}
                    onCheckedChange={(checked) => toggleBanner.mutate({ id: banner.id, active: checked })}
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
        ))}
      </div>
    </div>
  );
}
