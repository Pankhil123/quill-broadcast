import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BannerDisplayProps {
  type: 'hero' | 'header' | 'interstitial';
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

      // Filter by section: 'all' or null means all pages, or match specific section
      if (section) {
        query = query.or(`section.eq.all,section.eq.${section}`);
      } else {
        query = query.eq('section', 'all');
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
        className="w-full h-auto object-cover rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
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
      <div className="w-full mb-8 max-w-6xl mx-auto px-4">
        {banners.map(renderBanner)}
      </div>
    );
  }

  if (type === 'header') {
    return (
      <div className="w-full bg-gradient-to-b from-card to-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {banners.map(renderBanner)}
        </div>
      </div>
    );
  }

  if (type === 'interstitial') {
    return (
      <div className="w-full my-8 max-w-4xl mx-auto px-4">
        {banners.map(renderBanner)}
      </div>
    );
  }

  return null;
}
