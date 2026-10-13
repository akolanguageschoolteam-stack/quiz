"use client";

import DOMPurify from "dompurify";
import type { Config } from "dompurify";
import katex from "katex";
import { useMemo } from "react";

const DOMPURIFY_CONFIG: Config = {
    ALLOWED_TAGS: [
        "p", "br", "b", "i", "em", "strong", "u", "s", "ul", "ol", "li",
        "a", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "span", "div",
        "table", "thead", "tbody", "tr", "th", "td", "img",
    ],
    ALLOWED_ATTR: [
        "href", "target", "rel",
        "src", "alt", "width", "height",
        "class", "data-math-placeholder",
    ],
    FORBID_ATTR: ["style", "onerror", "onload"],
    ALLOW_DATA_ATTR: false,
};

const MATH_PLACEHOLDER_ATTR = "data-math-placeholder";

/** Renders one <span data-type="mathEquation" data-latex="..."> node to trusted KaTeX markup. */
const renderMathNode = (node: Element): string => {
    const latex = node.getAttribute("data-latex") ?? "";
    const displayMode = node.getAttribute("data-display") === "true";
    try {
        return katex.renderToString(latex, { throwOnError: false, displayMode });
    } catch {
        return latex;
    }
};

const MathContent = ({ content, className }: { content: string; className?: string }) => {
    const html = useMemo(() => {
        if (!content) return "";
        if (typeof window === "undefined") return content.replace(/<[^>]+>/g, "");

        const doc = new DOMParser().parseFromString(content, "text/html");
        const mathNodes = Array.from(doc.querySelectorAll('[data-type="mathEquation"]'));

        const renderedByIndex: string[] = mathNodes.map(renderMathNode);
        mathNodes.forEach((node, idx) => {
            const placeholder = doc.createElement("span");
            placeholder.setAttribute(MATH_PLACEHOLDER_ATTR, String(idx));
            node.replaceWith(placeholder);
        });

        const sanitized = DOMPurify.sanitize(doc.body.innerHTML, DOMPURIFY_CONFIG);
        const output = new DOMParser().parseFromString(sanitized, "text/html");
        output.querySelectorAll(`[${MATH_PLACEHOLDER_ATTR}]`).forEach((placeholder) => {
            const idx = Number(placeholder.getAttribute(MATH_PLACEHOLDER_ATTR));
            placeholder.outerHTML = renderedByIndex[idx] ?? "";
        });

        return output.body.innerHTML;
    }, [content]);

    return (
        <div
            className={`math-content break-words whitespace-normal leading-relaxed w-full ${className ?? ""}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default MathContent;
