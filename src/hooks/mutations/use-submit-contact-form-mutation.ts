"use client";

import { useMutation } from "@tanstack/react-query";
import { submitContactForm } from "@/actions/submit-contact-form";
import type { ContactFormInput } from "@/actions/submit-contact-form/schema";

export const submitContactFormMutationKey = ["submit-contact-form"] as const;

export function useSubmitContactFormMutation() {
  return useMutation({
    mutationKey: submitContactFormMutationKey,
    mutationFn: (input: ContactFormInput) => submitContactForm(input),
  });
}
