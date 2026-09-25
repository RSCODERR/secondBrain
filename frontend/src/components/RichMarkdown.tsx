import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

/**
 * Toggles a markdown task list item between [ ] and [x] at the given task index (0-based)
 */
export function toggleMarkdownTask(markdown: string, targetIndex: number): string {
  let currentIndex = 0;
  let inCodeBlock = false;

  const lines = markdown.split(/(\r?\n)/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!inCodeBlock) {
      const match = line.match(/^(\s*(?:[-*+]|\d+\.)\s*\[)([ xX])(\])/);
      if (match) {
        if (currentIndex === targetIndex) {
          const newCheck = (match[2] === "x" || match[2] === "X") ? " " : "x";
          lines[i] = `${match[1]}${newCheck}${match[3]}${line.slice(match[0].length)}`;
          return lines.join("");
        }
        currentIndex++;
      }
    }
  }
  return markdown;
}

interface RichMarkdownProps {
  content: string;
  className?: string;
  onToggleTask?: (updatedMarkdown: string, taskIndex: number) => void;
}

/**
 * Custom CodeBlock wrapper with language tag and 1-click copy button
 */
function CodeBlock({
  language,
  code,
  children,
}: {
  language?: string;
  code: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/code relative my-3 rounded-xl overflow-hidden border border-stone-800/80 dark:border-emerald-950/90 bg-[#0d120e] shadow-md text-stone-100">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#090d0a] border-b border-stone-800/60 text-[11px] font-mono select-none">
        <div className="flex items-center gap-2 text-stone-400">
          <span className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </span>
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] ml-1">
            {language || "code"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copy code to clipboard"
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-stone-400 hover:text-white bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <svg
                className="w-3 h-3 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3 text-stone-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block Content */}
      <div className="p-3.5 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function RichMarkdown({ content, className = "", onToggleTask }: RichMarkdownProps) {
  if (!content) return null;

  let checkboxCount = 0;

  return (
    <div
      className={`rich-markdown-content break-words text-stone-800 dark:text-stone-200 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Custom Code component
          code({ className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || "");
            const lang = match ? match[1] : "";
            const isMultiLine = String(children).includes("\n");

            if (match || isMultiLine) {
              return (
                <CodeBlock
                  language={lang}
                  code={String(children).replace(/\n$/, "")}
                >
                  <code className={codeClass} {...props}>
                    {children}
                  </code>
                </CodeBlock>
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-stone-200/70 dark:bg-[#18261e] border border-stone-300/60 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Prevent double <pre> nesting
          pre({ children }) {
            return <>{children}</>;
          },

          // Task lists checkboxes with interactive 1-click toggle
          input({ type, checked }) {
            if (type === "checkbox") {
              const isChecked = Boolean(checked);
              const taskIdx = checkboxCount++;
              return (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  disabled={!onToggleTask}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onToggleTask) {
                      const next = toggleMarkdownTask(content, taskIdx);
                      onToggleTask(next, taskIdx);
                    }
                  }}
                  className={`relative inline-flex items-center justify-center w-4 h-4 rounded-[5px] border transition-all duration-150 mr-2 mt-0.5 shrink-0 select-none align-middle ${
                    onToggleTask
                      ? "cursor-pointer hover:scale-110 active:scale-90 hover:border-emerald-500"
                      : "cursor-default pointer-events-none opacity-80"
                  } ${
                    isChecked
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs dark:bg-emerald-500 dark:border-emerald-500"
                      : "bg-white dark:bg-[#142217] border-stone-300 dark:border-emerald-800/90 hover:border-emerald-500 dark:hover:border-emerald-400"
                  }`}
                  title={
                    onToggleTask
                      ? isChecked
                        ? "Mark as incomplete"
                        : "Mark as complete"
                      : undefined
                  }
                >
                  {isChecked && (
                    <svg
                      className="w-2.5 h-2.5 text-white stroke-[3.5]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  )}
                </button>
              );
            }
            return null;
          },

          // List item with task list styling
          li({ className: liClass, children, ...props }) {
            const isTask = liClass?.includes("task-list-item");
            return (
              <li
                className={`my-1 text-sm leading-relaxed ${
                  isTask ? "list-none flex items-start" : ""
                }`}
                {...props}
              >
                {children}
              </li>
            );
          },

          // Tables
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-stone-200 dark:border-emerald-950/80 shadow-2xs">
                <table
                  className="min-w-full divide-y divide-stone-200 dark:divide-emerald-950/80 text-left text-xs"
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="px-3.5 py-2 bg-stone-100/90 dark:bg-[#142017] font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td
                className="px-3.5 py-2 text-stone-700 dark:text-stone-300 border-t border-stone-100 dark:border-emerald-950/50"
                {...props}
              >
                {children}
              </td>
            );
          },

          // Blockquotes
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="my-3 pl-3.5 border-l-3 border-emerald-500 dark:border-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 py-1.5 rounded-r-lg italic text-stone-700 dark:text-stone-300 text-sm"
                {...props}
              >
                {children}
              </blockquote>
            );
          },

          // Links
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-semibold underline underline-offset-2 break-all inline-flex items-center gap-0.5"
                {...props}
              >
                <span>{children}</span>
                <svg
                  className="w-3 h-3 inline-block shrink-0 opacity-70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </a>
            );
          },

          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-4 mb-2 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-3.5 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-3 mb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-2.5 mb-1">
              {children}
            </h4>
          ),

          // Paragraphs & Lists
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200 my-2 break-words">
              {children}
            </p>
          ),
          ul({ className: ulClass, children, ...props }) {
            const isTaskList = ulClass?.includes("contains-task-list");
            return (
              <ul
                className={`my-2 space-y-1 text-sm text-stone-800 dark:text-stone-200 ${
                  isTaskList ? "list-none pl-0" : "list-disc list-inside"
                }`}
                {...props}
              >
                {children}
              </ul>
            );
          },
          ol({ className: olClass, children, ...props }) {
            const isTaskList = olClass?.includes("contains-task-list");
            return (
              <ol
                className={`my-2 space-y-1 text-sm text-stone-800 dark:text-stone-200 ${
                  isTaskList ? "list-none pl-0" : "list-decimal list-inside"
                }`}
                {...props}
              >
                {children}
              </ol>
            );
          },
          hr: () => (
            <hr className="my-4 border-stone-200 dark:border-emerald-950/70" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
