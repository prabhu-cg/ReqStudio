import type { DocText } from '@/types/document'
import { toSpans } from '../lib/blocks'

/**
 * Renders inline document text.
 *
 * Newlines inside a value are preserved — free-text answers are frequently
 * written as short paragraphs and lose their meaning when collapsed.
 */
export function DocInline({ text }: { text: DocText }) {
  if (typeof text === 'string') {
    return <span className="whitespace-pre-wrap">{text}</span>
  }

  return (
    <>
      {toSpans(text).map((span, index) => {
        const content = <span className="whitespace-pre-wrap">{span.text}</span>

        if (span.href) {
          return (
            <a
              key={index}
              href={span.href}
              className="text-primary-text underline underline-offset-2"
            >
              {span.text}
            </a>
          )
        }

        if (span.bold) return <strong key={index}>{content}</strong>
        if (span.italic) return <em key={index}>{content}</em>
        return <span key={index}>{content}</span>
      })}
    </>
  )
}
