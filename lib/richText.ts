import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

/**
 * Converts Payload CMS Lexical rich text to HTML string
 */
export async function serializeRichText(lexicalData: SerializedEditorState): Promise<string> {
  if (!lexicalData) return '';
  
  try {
    const html = await convertLexicalToHTMLAsync({
      data: lexicalData,
    });
    return html;
  } catch (error) {
    console.error('Error converting Lexical to HTML:', error);
    return '';
  }
}

/**
 * Extracts plain text from Payload CMS Lexical rich text, preserving newlines
 */
export async function extractPlainText(lexicalData: SerializedEditorState): Promise<string> {
  if (!lexicalData) return '';
  
  try {
    const html = await serializeRichText(lexicalData);
    // Convert block-level elements to newlines before stripping tags
    let plainText = html
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines
      .replace(/<\/p>/gi, '\n') // Convert closing </p> tags to newlines
      .replace(/<\/div>/gi, '\n') // Convert closing </div> tags to newlines
      .replace(/<\/li>/gi, '\n') // Convert closing </li> tags to newlines
      .replace(/<[^>]*>/g, '') // Remove all remaining HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space (but preserve newlines)
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace 3+ consecutive newlines with 2
      .trim();
    return plainText;
  } catch (error) {
    console.error('Error extracting plain text from Lexical:', error);
    return '';
  }
}

