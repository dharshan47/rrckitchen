import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  wrapper: ({ children }) => (
    <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-6">
      {children}
    </div>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium text-foreground mt-6 mb-2">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2">{children}</ul>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
