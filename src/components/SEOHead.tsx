/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  schemaJson?: object;
}

export default function SEOHead({ title, description, canonicalPath = "/", schemaJson }: SEOProps) {
  useEffect(() => {
    // Update Document Title
    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    const fullUrl = `https://guanandi.com.br${canonicalPath}`;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Update Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", fullUrl);

    // Update JSON-LD Script tag if provided
    const existingSchema = document.getElementById("route-schema-json");
    if (schemaJson) {
      if (existingSchema) {
        existingSchema.textContent = JSON.stringify(schemaJson);
      } else {
        const script = document.createElement("script");
        script.id = "route-schema-json";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schemaJson);
        document.head.appendChild(script);
      }
    } else if (existingSchema) {
      existingSchema.remove();
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [title, description, canonicalPath, schemaJson]);

  return null;
}
