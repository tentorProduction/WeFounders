"use client";

import { useState } from "react";
import { QuestSubmissionModal } from "@/components/quests/quest-submission-modal";
import { Flask } from "@phosphor-icons/react";

export function QuestActionButton({
  questId,
  questTitle,
  reward,
  testerNameHint,
  isFull,
}: {
  questId: string;
  questTitle: string;
  reward?: string | null;
  testerNameHint?: string;
  isFull: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={isFull}
        onClick={() => setIsOpen(true)}
        className="ink-button inline-flex items-center gap-2 px-6 py-3 font-archivo text-sm font-semibold rounded-full disabled:opacity-50"
      >
        <Flask size={18} weight="fill" />
        <span>{isFull ? "Quest Full" : "Submit Quest Report"}</span>
      </button>

      <QuestSubmissionModal
        questId={questId}
        questTitle={questTitle}
        reward={reward}
        testerNameHint={testerNameHint}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
