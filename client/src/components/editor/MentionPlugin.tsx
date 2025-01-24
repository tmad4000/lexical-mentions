import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { $getSelection, $isRangeSelection } from "lexical";
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
  const [mentionString, setMentionString] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const suggestions = useMemo(() => {
    if (!mentionString) return [];
    return mockUsers
      .filter((user) =>
        user.name.toLowerCase().includes(mentionString.toLowerCase())
      )
      .slice(0, SUGGESTION_LIST_LENGTH);
  }, [mentionString]);

  const insertMention = useCallback(
    (user: { name: string; id: string }) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const mentionNode = $createMentionNode(user.name, user.id);
        selection.insertNodes([mentionNode]);
      });
      setMentionString(null);
    },
    [editor]
  );

  const checkForMentionMatch = useCallback((text: string) => {
    const mentionMatch = /@(\w+)$/;
    const match = text.match(mentionMatch);
    return match ? match[1] : null;
  }, []);

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

  return mentionString && mentionPosition && suggestions.length > 0
    ? createPortal(
        <Card
          className="absolute z-50 w-64 shadow-lg"
          style={{
            top: mentionPosition.top + 8,
            left: mentionPosition.left,
          }}
        >
          <ul className="py-2">
            {suggestions.map((user) => (
              <li
                key={user.id}
                className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
                onClick={() => insertMention(user)}
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