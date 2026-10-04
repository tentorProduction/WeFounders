"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction, type OnboardingActionState } from "@/actions/onboarding";
import { ArrowRight, Check, WarningCircle, CircleNotch } from "@phosphor-icons/react";

interface RoleOption {
  id: string;
  label: string;
  desc: string;
}

interface OnboardingFormProps {
  roles: RoleOption[];
  initialBio?: string;
}

export function OnboardingForm({ roles, initialBio = "" }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState<OnboardingActionState, FormData>(
    completeOnboardingAction,
    null
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [bio, setBio] = useState(initialBio);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
    if (clientError) setClientError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (selectedRoles.length === 0) {
      e.preventDefault();
      setClientError("Please select at least one primary role.");
      return;
    }

    if (bio.trim().length < 20) {
      e.preventDefault();
      setClientError(
        `Bio must be at least 20 characters long. Current count: ${bio.trim().length}.`
      );
      return;
    }

    setClientError(null);
  };

  const bioLength = bio.trim().length;
  const isBioValid = bioLength >= 20;
  const activeError = clientError || state?.error;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* Error Alert Banner */}
      {activeError && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-[16px] bg-[#FFF5F4] border border-[#FF4B3E]/30 text-[#DC2626] text-xs font-medium animate-fade-in-up"
        >
          <WarningCircle size={18} weight="fill" className="shrink-0 text-[#FF4B3E]" />
          <span>{activeError}</span>
        </div>
      )}

      {/* 1. Primary Roles (Compulsory) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B]">
            Your Primary Roles <span className="text-[#FF4B3E]">*</span>
          </label>
          <span className="text-[11px] font-medium text-[#666A73]">
            {selectedRoles.length > 0 ? (
              <span className="text-[#059669] flex items-center gap-1 font-semibold">
                <Check size={12} weight="bold" />
                {selectedRoles.length} selected
              </span>
            ) : (
              <span className="text-[#FF4B3E]">Select at least one</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {roles.map((role) => {
            const isChecked = selectedRoles.includes(role.id);
            return (
              <label
                key={role.id}
                className={`flex items-start gap-3.5 p-3.5 rounded-[16px] border cursor-pointer transition-all ${
                  isChecked
                    ? "border-[#FF4B3E] bg-[#FFF5F4] shadow-xs"
                    : "border-[#DADDE1] bg-[#F8F9FA] hover:border-[#17181B]"
                }`}
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={role.id}
                  checked={isChecked}
                  onChange={() => handleRoleToggle(role.id)}
                  className="mt-1 h-4 w-4 rounded accent-[#FF4B3E] cursor-pointer"
                />
                <div>
                  <div className="text-sm font-semibold text-[#17181B]">{role.label}</div>
                  <div className="text-xs text-[#666A73]">{role.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#DADDE1] pt-6 space-y-5">
        {/* 2. Bio (Compulsory, Minimum 20 Characters) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B]">
              Bio <span className="text-[#FF4B3E]">*</span>
            </label>
            <span
              className={`text-[11px] font-mono font-medium ${
                isBioValid ? "text-[#059669]" : "text-[#D97706]"
              }`}
            >
              {bioLength} / 20 characters {isBioValid ? "(✓ Requirement met)" : "(minimum 20)"}
            </span>
          </div>

          <textarea
            name="bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (clientError) setClientError(null);
            }}
            required
            minLength={20}
            rows={3}
            placeholder="Introduce yourself: what are you building, testing, or exploring on WeFounders?"
            className={`w-full rounded-[14px] border px-4 py-2.5 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:outline-none transition-colors ${
              bioLength > 0 && !isBioValid
                ? "border-[#F59E0B] focus:border-[#FF4B3E]"
                : "border-[#DADDE1] focus:border-[#FF4B3E]"
            }`}
          />
          <p className="mt-1 text-[11px] text-[#666A73]">
            A meaningful bio helps founders and collaborators connect with you.
          </p>
        </div>

        {/* 3. Location & 4. Portfolio/GitHub (Both Compulsory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
              Location <span className="text-[#FF4B3E]">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. San Francisco, London, Tokyo, or Remote"
              className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
              Portfolio or GitHub <span className="text-[#FF4B3E]">*</span>
            </label>
            <input
              type="text"
              name="portfolioUrl"
              required
              placeholder="https://github.com/yourhandle or portfolio URL"
              className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
            />
          </div>
        </div>

        {/* 5. Top Skills or Stack (Compulsory) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#17181B] mb-1.5">
            Top Skills or Tech Stack <span className="text-[#FF4B3E]">*</span>
          </label>
          <input
            type="text"
            name="skills"
            required
            placeholder="e.g. Next.js, TypeScript, Python, Figma, Product Growth"
            className="w-full rounded-[14px] border border-[#DADDE1] px-4 py-2 text-sm text-[#17181B] placeholder-[#A0A4AB] focus:border-[#FF4B3E] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-[#666A73]">
            Separate multiple skills with commas.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DADDE1]">
        <button
          type="submit"
          disabled={isPending}
          className="ink-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 font-archivo text-sm font-semibold rounded-full disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <CircleNotch size={16} weight="bold" className="animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Complete Setup & Launch</span>
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </button>

        <span className="text-xs text-[#666A73] text-center sm:text-right">
          <span className="text-[#FF4B3E] font-bold">*</span> All fields are compulsory. You can update your profile anytime.
        </span>
      </div>
    </form>
  );
}
