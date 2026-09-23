import React, { useEffect } from 'react';
import { ToolDefinition, CategoryInfo } from '../types';

interface SEOHeadProps {
  tool?: ToolDefinition | null;
  category?: CategoryInfo | null;
  mode?: 'home' | 'tool' | 'category' | 'pdf' | 'audit';
}

export const SEOHead: React.FC<SEOHeadProps> = ({ tool, category, mode = 'home' }) => {
  useEffect(() => {
    let title = 'SmartTools Hub - All-in-One Calculators, Converters & Universal PDF Export';
    let description =
      'Free high-speed Calculators, Converters & Useful Data Tools. Calculate EMI, SIP, Income Tax, GST, Age, BMI, GPA, Currency & download official PDF reports instantly.';
    let canonicalUrl = window.location.origin;

    if (mode === 'tool' && tool) {
      title = `${tool.name} – Free Calculator & Instant PDF Report | SmartTools Hub`;
      description = `${tool.description} Fast, mobile-first, 100% accurate calculation with step-by-step formula and 1-click official PDF export.`;
      canonicalUrl = `${window.location.origin}${tool.route}`;
    } else if (mode === 'category' && category) {
      title = `${category.name} Calculators & Online Tools | SmartTools Hub`;
      description = `Explore free online ${category.name.toLowerCase()} calculators and converters. Instant calculations, data analysis, and universal PDF export without signing up.`;
      canonicalUrl = `${window.location.origin}/${category.id}`;
    } else if (mode === 'pdf') {
      title = 'PDF Studio – Merge, Split, Rotate & Watermark In-Browser | SmartTools Hub';
      description = 'Zero-server, 100% private in-browser PDF utilities. Merge, split, convert photos to PDF, rotate, and watermark documents locally without cloud uploads.';
      canonicalUrl = `${window.location.origin}/pdf-tools`;
    } else if (mode === 'audit') {
      title = 'SEO & Crawl Architecture Audit System | SmartTools Hub DevTools';
      description = 'Internal development audit checking indexability, duplicate metadata, canonicalization, orphan pages, and crawl graph health.';
      canonicalUrl = `${window.location.origin}/__seo-audit`;
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Canonical Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Update OpenGraph Tags
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:type': 'website',
      'og:site_name': 'SmartTools Hub',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:card': 'summary_large_image',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (property.startsWith('twitter:')) {
          tag.setAttribute('name', property);
        } else {
          tag.setAttribute('property', property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // 5. Inject / Update JSON-LD Structured Data
    const scriptId = 'smarttools-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredDataArray: any[] = [];

    // Global WebSite Schema
    structuredDataArray.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SmartTools Hub',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    if (mode === 'tool' && tool) {
      // WebApplication Schema
      structuredDataArray.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: tool.name,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        url: canonicalUrl,
        description: tool.description,
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      });

      // BreadcrumbList Schema
      structuredDataArray.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: window.location.origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: category?.name || tool.category,
            item: `${window.location.origin}/${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: canonicalUrl,
          },
        ],
      });

      // FAQPage Schema if FAQs exist
      if (tool.faqs && tool.faqs.length > 0) {
        structuredDataArray.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        });
      }
    }

    scriptTag.text = JSON.stringify(structuredDataArray);
  }, [tool, category, mode]);

  return null;
};
