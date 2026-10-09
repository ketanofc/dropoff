import { createFileRoute, notFound } from "@tanstack/react-router";
import { marked } from "marked";
import { Button } from "../../components/ui/button";
import { PAGE_HEADING, Shell } from "../../components/shell";
import { getPostBySlug } from "../../lib/blog";
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE, jsonLd } from "../../lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: (ctx) => {
    const post = getPostBySlug(ctx.params.slug);
    const url = `${SITE_URL}/blog/${ctx.params.slug}`;

    if (!post) {
      return { meta: [{ title: "Article not found – dropoff" }] };
    }

    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { name: "author", content: post.author },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: SOCIAL_IMAGE },
        { property: "article:published_time", content: post.published },
        { property: "article:author", content: post.author },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.metaDescription },
        { name: "twitter:image", content: SOCIAL_IMAGE },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          headline: post.title,
          description: post.metaDescription,
          url,
          datePublished: post.published,
          dateModified: post.published,
          author: { "@type": "Organization", name: post.author },
          publisher: { "@id": `${SITE_URL}/#organization` },
          isPartOf: { "@id": `${SITE_URL}/blog#blog` },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          image: SOCIAL_IMAGE,
          keywords: post.tags.join(", "),
          inLanguage: "en",
        }),
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const html = marked.parse(post.body);

  return (
    <Shell>
      <article className="py-16 lg:py-24">
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> All articles
        </a>

        <p className="eyebrow mt-10">{post.category}</p>
        <h1 className={`mt-3 max-w-3xl text-balance ${PAGE_HEADING}`}>{post.title}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.published}>{post.publishedLabel}</time>
          {post.readingTime ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} read</span>
            </>
          ) : null}
        </div>

        <div className="blog-content mt-10 max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-14 max-w-2xl border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Ready to send a file without uploading it anywhere?
          </p>
          <a href="/" className="mt-4 inline-block">
            <Button>Send a file with {SITE_NAME}</Button>
          </a>
        </div>
      </article>
    </Shell>
  );
}
