"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format";
import { ArrowRightIcon } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitContactFormMutation } from "@/hooks/mutations/use-submit-contact-form-mutation";
import {
  contactFormSchema,
  studentsRangeOptions,
  type ContactFormInput,
} from "@/api/actions/submit-contact-form/schema";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      gymName: "",
      email: "",
      phone: "",
      studentsRange: studentsRangeOptions[0].value,
      message: "",
    },
  });

  const { mutate, isPending, isSuccess, error } = useSubmitContactFormMutation();

  return (
    <Card className="rounded-2xl border border-white/10 p-8">
      <CardContent className="p-0">
        <form
          onSubmit={handleSubmit((data) => mutate(data, { onSuccess: () => reset() }))}
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Nome" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="Seu nome" {...register("name")} />
            </Field>
            <Field label="Academia / Box" htmlFor="gymName" error={errors.gymName?.message}>
              <Input id="gymName" placeholder="Nome do local" {...register("gymName")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                {...register("email")}
              />
            </Field>
            <Field label="Telefone" htmlFor="phone" error={errors.phone?.message}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <PatternFormat
                    id="phone"
                    customInput={Input}
                    format="(##) #####-####"
                    mask="_"
                    placeholder="(11) 90000-0000"
                    value={field.value}
                    onValueChange={(values) => field.onChange(values.formattedValue)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Field>
          </div>

          <Field
            label="Número de alunos"
            htmlFor="studentsRange"
            error={errors.studentsRange?.message}
          >
            <Controller
              control={control}
              name="studentsRange"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="studentsRange" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Mensagem" htmlFor="message" error={errors.message?.message}>
            <Textarea
              id="message"
              rows={4}
              placeholder="Conte um pouco sobre sua academia e o que você procura"
              {...register("message")}
            />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-accent text-background px-8 py-4 h-auto gap-2 font-bold hover:bg-primary green-glow disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Solicitar demonstração gratuita"}
            <ArrowRightIcon size={18} />
          </Button>

          {isSuccess && (
            <p className="text-sm text-primary text-center">
              Mensagem enviada! Nossa equipe vai te responder em breve.
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive text-center">
              {error.message}
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Sem compromisso. Resposta em até 24 horas úteis.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
