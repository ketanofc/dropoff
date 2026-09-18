import * as React from "react";
import { cn } from "../lib/utils";

type TextAnimateProps = {
    animation?: "blurIn";
    as?: keyof React.JSX.IntrinsicElements;
    children: React.ReactNode;
    className?: string;
};

function animateTextNode(node: React.ReactNode, keyPrefix: string): React.ReactNode {
    if (typeof node === "string") {
        let characterIndex = 0;
        return node.split(/(\s+)/).map((segment, segmentIndex) => {
            if (/\s+/.test(segment)) return segment;
            const characters = Array.from(segment).map((character) => {
                const index = characterIndex++;
                return (
                    <span
                        key={`${keyPrefix}-${index}`}
                        className="text-animate-blur-in"
                        style={{ animationDelay: `${index * 28}ms` }}
                    >
                        {character}
                    </span>
                );
            });
            return (
                <span key={`${keyPrefix}-word-${segmentIndex}`} className="text-animate-word">
                    {characters}
                </span>
            );
        });
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return React.cloneElement(node, {
            children: React.Children.map(node.props.children, (child, index) =>
                animateTextNode(child, `${keyPrefix}-${index}`),
            ),
        });
    }

    return node;
}

export function TextAnimate({ animation = "blurIn", as = "span", children, className }: TextAnimateProps) {
    const Component = as;

    return React.createElement(
        Component,
        { className: cn(animation === "blurIn" && "text-animate", className) },
        React.Children.map(children, (child, index) => animateTextNode(child, `${index}`)),
    );
}