import { useEffect } from 'react';

/**
 * useSEO — sets page-level meta tags dynamically for React SPA.
 * Call this at the top of any page component.
 */
const useSEO = ({ title, description, canonical, ogImage, keywords, schema }) => {
  const schemaStr = schema ? JSON.stringify(schema) : null;

  useEffect(() => {
    // Title
    if (title) document.title = title;

    const setMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description, 'name');
    }
    if (keywords) setMeta('keywords', keywords);
    if (title) {
      setMeta('og:title', title, 'property');
      setMeta('twitter:title', title, 'name');
    }
    if (ogImage) {
      setMeta('og:image', ogImage, 'property');
      setMeta('twitter:image', ogImage, 'name');
    }

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // JSON-LD schema
    if (schemaStr) {
      const id = 'page-schema';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = schemaStr;
    }
  }, [title, description, canonical, ogImage, keywords, schemaStr]);
};

export default useSEO;
