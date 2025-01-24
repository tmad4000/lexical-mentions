import { useCallback, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { $getSelection, $isRangeSelection, TextNode } from "lexical";
import {
  $createMentionNode,
  $isMentionNode,
} from "./nodes/MentionNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Card } from "@/components/ui/card";
import { mockUsers } from "@/lib/mockUsers";

const SUGGESTION_LIST_LENGTH = 5;

export function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionString, setMentionString] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const suggestions = useMemo(() => {
    if (mentionString === null) return [];
    return mockUsers
      .filter((user) =>
        mentionString === "" ? true : user.name.toLowerCase().includes(mentionString.toLowerCase())
      )
      .slice(0, SUGGESTION_LIST_LENGTH);
  }, [mentionString]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  const insertMention = useCallback(
    (user: { name: string; id: string }) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const node = selection.anchor.getNode();
        if (!(node instanceof TextNode)) return;

        const textContent = node.getTextContent();
        const currentOffset = selection.anchor.offset;

        // Find the position of the @ symbol
        const mentionStart = textContent.lastIndexOf('@', currentOffset);
        if (mentionStart === -1) return;

        // Create a new selection from @ to current position
        const mentionNode = $createMentionNode(user.name, user.id);
        selection.setTextNodeRange(node, mentionStart, currentOffset);

        // Replace the selected text with the mention
        selection.insertNodes([mentionNode]);
      });
      setMentionString(null);
    },
    [editor]
  );

  const checkForMentionMatch = useCallback((text: string) => {
    const mentionMatch = /@(\w*)$/;
    const match = text.match(mentionMatch);
    if (text.endsWith('@')) return '';
    return match ? match[1] : null;
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mentionString === null || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          e.stopPropagation();
          insertMention(suggestions[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          setMentionString(null);
          break;
      }
    };

    // Use capture phase to handle events before they reach the editor
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [mentionString, suggestions, selectedIndex, insertMention]);

  editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const node = selection.anchor.getNode();
      const textContent = node.getTextContent().slice(0, selection.anchor.offset);
      const mentionMatch = checkForMentionMatch(textContent);

      if (mentionMatch !== null) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          });
        }
        setMentionString(mentionMatch);
      } else {
        setMentionString(null);
      }
    });
  });

  return mentionString !== null && mentionPosition && suggestions.length > 0
    ? createPortal(
        <Card
          className="absolute z-50 w-64 shadow-lg"
          style={{
            top: mentionPosition.top + 8,
            left: mentionPosition.left,
          }}
        >
          <ul className="py-2">
            {suggestions.map((user, index) => (
              <li
                key={user.id}
                className={`px-4 py-2 cursor-pointer ${
                  index === selectedIndex ? 'bg-primary/10' : 'hover:bg-primary/10'
                }`}
                onClick={() => insertMention(user)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </Card>,
        document.body
      )
    : null;
}