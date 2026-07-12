import { transformMarkdownUrl } from "@/lib/markdown/markdown-url";
import { env } from "env";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import Media from "../modules/realms/media";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        urlTransform={(url) =>
          transformMarkdownUrl(url, env.VITE_PUBLIC_IPFS_GATEWAY)
        }
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1 className="realm-prose-h1" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="realm-prose-h2 first:mt-0" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="realm-prose-h3" {...props} />
          ),
          h4: ({ node: _node, ...props }) => (
            <h4 className="realm-prose-h4" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p
              className="mb-4 leading-7 [&:not(:first-child)]:mt-6"
              {...props}
            />
          ),
          a: ({ node: _node, ...props }) => (
            <a
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
              {...props}
            />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-muted mt-6 border-l-2 pl-6 italic"
              {...props}
            />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
          ),
          li: ({ node: _node, ...props }) => <li {...props} />,
          table: ({ node: _node, ...props }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node: _node, ...props }) => <thead {...props} />,
          tbody: ({ node: _node, ...props }) => <tbody {...props} />,
          tr: ({ node: _node, ...props }) => (
            <tr className="even:bg-muted m-0 border-t p-0" {...props} />
          ),
          th: ({ node: _node, ...props }) => (
            <th
              className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
              {...props}
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td
              className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
              {...props}
            />
          ),
          hr: ({ node: _node, ...props }) => (
            <hr className="my-4 md:my-8" {...props} />
          ),
          img: ({ node: _node, alt, src }) => {
            if (!src) {
              return null;
            }
            return (
              <Media
                src={src}
                className="mx-auto rounded-md border"
                alt={alt ?? "Markdown image"}
              />
            );
          },
          code: ({ node: _node, ...props }) => (
            <code
              className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm"
              {...props}
            />
          ),
          pre: ({ node: _node, ...props }) => (
            <pre
              className="mt-6 mb-4 overflow-x-auto rounded-lg border bg-black p-4 text-white"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
