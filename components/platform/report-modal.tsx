"use client";

import { useState, useTransition } from "react";
import { submitReportAction } from "@/actions/reports";
import { Flag, X, Check } from "@phosphor-icons/react";

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "startup" | "comment" | "user" | "quest" | "collab";
  targetId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitReportAction(targetType, targetId, reason, details);
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
        }, 1500);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] text-[#A0A4AB] hover:text-[#DC2626] transition-colors"
        title="Report issue or spam"
      >
        <Flag size={12} />
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-xl border border-[#DADDE1] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-archivo text-base font-bold text-[#17181B]">Report Content</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#666A73] hover:text-[#17181B]"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 text-center space-y-2">
                <Check size={28} weight="bold" className="mx-auto text-[#059669]" />
                <p className="text-sm font-bold text-[#17181B]">Report Submitted</p>
                <p className="text-xs text-[#666A73]">Our moderation team will review this listing shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#17181B] mb-1">Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-[12px] border border-[#DADDE1] px-3 py-2 text-xs text-[#17181B] focus:outline-none"
                  >
                    <option value="spam">Spam / Advertising</option>
                    <option value="misleading">Misleading or false information</option>
                    <option value="fraud">Fraud / Scam</option>
                    <option value="broken">Broken link / Not working</option>
                    <option value="abuse">Harassment or abusive content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17181B] mb-1">Additional details (Optional)</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    placeholder="Provide any context that helps moderators..."
                    className="w-full rounded-[12px] border border-[#DADDE1] px-3 py-2 text-xs text-[#17181B] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#666A73] hover:text-[#17181B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="ink-button px-4 py-2 text-xs font-semibold rounded-full bg-[#DC2626] text-white"
                  >
                    {isPending ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
