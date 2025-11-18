import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BannerDisplayProps {
  type: 'hero' | 'top' | 'interstitial' | 'sidebar';
  section?: string;
}

export function BannerDisplay({ type, section }: BannerDisplayProps) {
  const { data: banners } = useQuery({
    queryKey: ['banners', type, section],
    queryFn: async () => {
      let query = supabase
        .from('banners')
        .select('*')
        .eq('banner_type', type)
        .eq('active', true);

      // Filter by section: null/empty means all pages, or match specific section
      if (section) {
        query = query.or(`section.is.null,section.eq.${section}`);
      } else {
        query = query.is('section', null);
      }

      const { data, error } = await query.order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (!banners || banners.length === 0) {
    return null;
  }

  const renderBanner = (banner: typeof banners[0]) => {
    const content = (
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-full h-auto object-cover"
      />
    );

    if (banner.link_url) {
      return (
        <a
          key={banner.id}
          href={banner.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      );
    }

    return <div key={banner.id}>{content}</div>;
  };

  if (type === 'hero') {
    return (
      <div className="w-full mb-8">
        {banners.map(renderBanner)}
      </div>
    );
  }

  if (type === 'top') {
    return (
      <div className="w-full bg-card border-b border-border mb-4">
        <div className="max-w-6xl mx-auto">
          {banners.map(renderBanner)}
        </div>
      </div>
    );
  }

  if (type === 'interstitial') {
    return (
      <div className="w-full my-8 p-4 bg-muted/50 rounded-lg">
        {banners.map(renderBanner)}
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className="space-y-4">
        {banners.map(renderBanner)}
      </div>
    );
  }

  return null;
}
