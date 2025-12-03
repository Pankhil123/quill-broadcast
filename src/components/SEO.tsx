import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedAt?: string;
}

const DEFAULT_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/4bXe7awH3pSiDB1JtOrDCDgH9Ou1/social-images/social-1763627030579-White BG.png';

export function SEO({
  title,
  description,
  keywords = 'trading, pattern analysis, market analysis, commodities, cryptocurrencies, indices, equities, financial markets, chart analysis',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedAt,
}: SEOProps) {
  const fullTitle = title.includes('ToadToe') ? title : `${title} | ToadToe`;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || 'ToadToe'} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ToadToe" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@ToadToe" />

      {/* Article specific */}
      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
    </Helmet>
  );
}
