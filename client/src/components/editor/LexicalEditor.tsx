import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { MentionNode } from "./nodes/MentionNode";
import { MentionsPlugin } from "./MentionPlugin";
import { ToolbarPlugin } from "./ToolbarPlugin";

const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  mention: "inline-block bg-primary/10 rounded px-1 py-0.5 text-primary font-medium",
};

const onError = (error: Error) => {
  console.error(error);
};

function Placeholder() {
  return (
    <div className="absolute top-[1.125rem] left-[1.125rem] text-gray-400">
      Start typing or use @ to mention someone...
    </div>
  );
}

const initialConfig = {
  namespace: "MyEditor",
  theme,
  onError,
  nodes: [MentionNode],
  editorState: null,
  editable: true,
  // Add atomic node deletion behavior
  nodeOverrides: {
    text: {
      atomicDelete: true,
    },
  },
};

export default function LexicalEditor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative bg-white rounded-lg border">
        <ToolbarPlugin />
        <div className="relative min-h-[200px] px-4 py-3">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-[200px]" />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <MentionsPlugin />
          <HistoryPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}