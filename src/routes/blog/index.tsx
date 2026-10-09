import { createFileRoute } from "@tanstack/react-router";
import { PAGE_HEADING, Shell } from "../../components/shell";
import { blogPosts, type BlogPost } from "../../lib/blog";
import { SITE_NAME, SITE_URL, canonical, jsonLd, ogUrl } from "../../lib/seo";

const BLOG_DESCRIPTION =
  "Guides and notes on private, browser-based file sharing, and how to keep your documents on your own device.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog – dropoff" },
      { name: "description", content: BLOG_DESCRIPTION },
      { property: "og:title", content: "Blog – dropoff" },
      { property: "og:description", content: BLOG_DESCRIPTION },
      { property: "og:type", content: "website" },
      ogUrl("/blog"),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/blog")],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${SITE_URL}/blog#blog`,
        url: `${SITE_URL}/blog`,
        name: `${SITE_NAME} Blog`,
        description: BLOG_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        blogPost: blogPosts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: `${SITE_URL}/blog/${post.slug}`,
          datePublished: post.published,
          author: { "@type": "Organization", name: post.author },
        })),
      }),
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [featured, ...rest] = blogPosts;

  return (
    <Shell>
      <section className="py-20 lg:py-28">
        <p className="eyebrow">Blog</p>
        <h1 className={`mt-3 max-w-3xl text-balance ${PAGE_HEADING}`}>Blog</h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]">
          {BLOG_DESCRIPTION}
        </p>

        <div className="mt-12 flex flex-col gap-5">
          {featured ? <PostCard post={featured} featured /> : null}
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group block rounded-3xl border border-border bg-card p-6 transition-colors hover:border-foreground/25 sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span>{post.category}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={post.published}>{post.publishedLabel}</time>
        {post.readingTime ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} read</span>
          </>
        ) : null}
      </div>

      <h2
        className={`mt-4 text-balance font-light leading-[1.15] tracking-tight text-foreground ${
          featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
        }`}
      >
        {post.title}
      </h2>

      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
        {post.metaDescription}
      </p>

      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        Read article
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </a>
  );
}
