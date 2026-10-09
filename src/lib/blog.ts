import { format } from "date-fns";

import clientSideFileProcessing from "../content/blog/client-side-file-processing-online-privacy.md?raw";
import webrtcP2pFileSharing from "../content/blog/webrtc-p2p-file-sharing-faster-more-private.md?raw";

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  author: string;
  published: string;
  publishedLabel: string;
  readingTime: string;
  tags: string[];
  category: string;
  body: string;
}

interface RawPost {
  slug: string;
  source: string;
}

function parseFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { data: {}, body: source.trim() };

  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    data[key] = value;
  }

  return { data, body: source.slice(match[0].length).trim() };
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((tag) => tag.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function toLabel(published: string): string {
  if (!published) return "";
  return format(new Date(`${published}T00:00:00`), "MMM d, yyyy");
}

function buildPost({ slug: fallbackSlug, source }: RawPost): BlogPost {
  const { data, body } = parseFrontmatter(source);
  const tags = parseTags(data["tags"]);
  const published = data["published"] ?? "";
  const title = data["title"] ?? "";

  return {
    slug: data["slug"] ?? fallbackSlug,
    title,
    metaTitle: data["meta_title"] ?? title,
    metaDescription: data["meta_description"] ?? "",
    author: data["author"] ?? "Dropoff Team",
    published,
    publishedLabel: toLabel(published),
    readingTime: data["reading_time"] ?? "",
    tags,
    category: data["category"] ?? titleCase(tags[0] ?? "General"),
    // The article title is rendered by the page, so drop the duplicate H1.
    body: body.replace(/^#\s+.*\r?\n+/, "").trim(),
  };
}

const RAW_POSTS: RawPost[] = [
  { slug: "client-side-file-processing-online-privacy", source: clientSideFileProcessing },
  { slug: "webrtc-p2p-file-sharing-faster-more-private", source: webrtcP2pFileSharing },
];

export const blogPosts: BlogPost[] = RAW_POSTS.map(buildPost).sort((a, b) =>
  a.published < b.published ? 1 : -1,
);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
