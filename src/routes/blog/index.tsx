import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PAGE_HEADING, Shell } from "../../components/shell";
import { blogPosts, type BlogPost } from "../../lib/blog";
import { SITE_NAME, SITE_URL, canonical, jsonLd, ogUrl } from "../../lib/seo";

const BLOG_DESCRIPTION =
  "Guides and notes on private, browser-based file sharing, and how to keep your documents on your own device.";

const ALL_CATEGORIES = "All";

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
  const categories = [
    ALL_CATEGORIES,
    ...Array.from(new Set(blogPosts.map((post) => post.category))),
  ];
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const visiblePosts =
    activeCategory === ALL_CATEGORIES
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);
  const [featured, ...rest] = visiblePosts;

  return (
    <Shell>
      <section className="py-20 lg:py-28">
        <h1 className={`max-w-3xl text-balance ${PAGE_HEADING}`}>Blog</h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]">
          {BLOG_DESCRIPTION}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {featured ? <FeaturedPost post={featured} /> : null}
          {rest.length > 0 ? (
            <div className="flex flex-col border-t border-border">
              {rest.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      <span>{post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.published}>{post.publishedLabel}</time>
    </div>
  );
}

function ReadMore() {
  return (
    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
      Read more
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </span>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group block rounded-3xl border border-border bg-card p-6 transition-colors hover:border-foreground/25 sm:p-8"
    >
      <PostMeta post={post} />
      <h2 className="mt-4 text-balance text-2xl font-light leading-[1.15] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {post.title}
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
        {post.metaDescription}
      </p>
      <ReadMore />
    </a>
  );
}

function PostRow({ post }: { post: BlogPost }) {
  return (
    <a href={`/blog/${post.slug}`} className="group flex flex-col border-b border-border py-7">
      <PostMeta post={post} />
      <h3 className="mt-2 text-xl font-light leading-snug tracking-tight text-foreground sm:text-2xl">
        {post.title}
      </h3>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
        {post.metaDescription}
      </p>
      <ReadMore />
    </a>
  );
}
