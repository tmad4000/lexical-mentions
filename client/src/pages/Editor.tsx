import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LexicalEditor from "@/components/editor/LexicalEditor";

export default function Editor() {
  return (
    <div className="min-h-screen w-full p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Lexical Rich Text Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LexicalEditor />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
