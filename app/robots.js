import { SITE_URL } from "@/lib/site";

/**
 * The demo has no private data on the server, but crawl rules still keep
 * account screens and developer tools out of search results.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dev",
          "/styleguide",
          "/signin",
          "/signup",
          "/dashboard",
          "/bookings",
          "/checkout",
          "/owner",
          "/admin",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
