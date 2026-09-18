import { createFileRoute } from "@tanstack/react-router";
import { marked } from "marked";
import { Shell } from "../components/shell";
import termsMarkdown from "../content/terms.md?raw";

const termsHtml = marked.parse(termsMarkdown);

export const Route = createFileRoute("/terms")({
    head: () => ({
        meta: [
            { title: "Terms – dropoff.lol" },
            { name: "description", content: "Terms for using dropoff.lol." },
        ],
    }),
    component: Terms,
});

function Terms() {
    return (
        <Shell>
            <section className="pt-[58px] sm:pt-16">
                <h1 className="font-serif text-[40px] font-normal leading-[1.1] sm:text-[42px]">Terms of use</h1>
                <div className="terms-content mt-8" dangerouslySetInnerHTML={{ __html: termsHtml }} />
                <a href="/" className="mt-8 inline-block text-sm font-medium underline underline-offset-4">
                    Back to dropoff.lol
                </a>
            </section>
        </Shell>
    );
}