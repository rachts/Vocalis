import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              style={vscDarkPlus as any}
              language={match[1]}
              PreTag="div"
              className="rounded-md border border-white/10 my-4 bg-surface-container-low"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={cn("bg-white/10 px-1 py-0.5 rounded text-sm text-primary-fixed", className)}>
              {children}
            </code>
          )
        },
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto w-full my-4">
              <table {...props} className="w-full text-sm text-left border-collapse">
                {children}
              </table>
            </div>
          )
        },
        th({ children, ...props }) {
          return <th {...props} className="border-b border-white/20 p-2 font-mono text-primary/80 uppercase tracking-wider">{children}</th>
        },
        td({ children, ...props }) {
          return <td {...props} className="border-b border-white/10 p-2 text-on-surface-variant">{children}</td>
        },
        p({ children, ...props }) {
          return (
            <p {...props} className="mb-4 last:mb-0 inline-block w-full">
              {children}
            </p>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
