import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  TextModeType,
} from "lexical";

import { $createTextNode, $getSelection, TextNode } from "lexical";

export type SerializedMentionNode = Spread<
  {
    mention: string;
    mentionName: string;
    type: "mention";
    version: 1;
    text: string;
    format: number;
    detail: number;
    style: string;
    mode: TextModeType;
  },
  SerializedLexicalNode
>;

export class MentionNode extends TextNode {
  __mention: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }

  constructor(mention: string, text: string, key?: NodeKey) {
    super(text, key);
    this.__mention = mention;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = config.theme.mention;
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  splitText(): TextNode {
    return this;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mention: this.__mention,
      mentionName: this.__text,
      type: "mention",
      version: 1,
      text: this.__text,
      format: this.getFormat(),
      detail: this.getDetail(),
      style: this.getStyle(),
      mode: this.getMode(),
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mention, serializedNode.mentionName);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }
}

function convertMentionElement(domNode: HTMLElement): DOMConversionOutput {
  const textContent = domNode.textContent;
  if (textContent !== null) {
    const node = $createMentionNode(textContent, textContent);
    return { node };
  }
  return { node: $createTextNode(domNode.textContent || "") };
}

export function $createMentionNode(mentionName: string, mention: string): MentionNode {
  const mentionNode = new MentionNode(mention, mentionName);
  mentionNode.setMode("token").toggleDirectionless();
  return mentionNode;
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}