
import React from "react";
import { Textarea } from "@/components/ui/textarea";

const NotesSection = ({
  notes,
  setNotes
}: {
  notes: string;
  setNotes: (v: string) => void;
}) => (
  <div className="mb-6">
    <h3 className="title-small mb-2">Add Notes</h3>
    <Textarea
      placeholder="How was your workout? Note any PRs or areas to improve..."
      className="bg-gray-900 border-gray-700 h-32"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </div>
);

export default NotesSection;
