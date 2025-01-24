import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline } from "lucide-react";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: "bold" | "italic" | "underline") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format);
      }
    });
  };

  return (
    <div className="border-b p-2 flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => formatText("bold")}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => formatText("italic")}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => formatText("underline")}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>
    </div>
  );
}