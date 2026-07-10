"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { slugify } from "@/lib/slug";
import { Field } from "@/components/ui/field";
import { useCreateCampaignMutation } from "@/hooks/mutations/use-create-campaign-mutation";
import {
  createCampaignSchema,
  type CreateCampaignInput,
} from "@/actions/create-campaign/schema";

const DEFAULT_MISSIONS: CreateCampaignInput["missions"] = [
  { title: "Cadastro", description: "", xp_value: 100, validation_type: "auto", repeatable: false, max_per_day: 1, active: true },
  { title: "Primeiro login", description: "", xp_value: 50, validation_type: "auto", repeatable: false, max_per_day: 1, active: true },
  { title: "Check-in", description: "", xp_value: 20, validation_type: "qr", repeatable: true, max_per_day: 1, active: true },
  { title: "Aula", description: "", xp_value: 30, validation_type: "qr", repeatable: true, max_per_day: 1, active: true },
  { title: "Story", description: "", xp_value: 80, validation_type: "manual", repeatable: true, max_per_day: 1, active: true },
  { title: "Feed", description: "", xp_value: 150, validation_type: "manual", repeatable: true, max_per_day: 1, active: true },
  { title: "Seguir perfil", description: "Print mostrando que seguiu o perfil no Instagram, aprovado no painel.", xp_value: 30, validation_type: "manual", repeatable: false, max_per_day: 1, active: true },
  { title: "Quiz", description: "", xp_value: 40, validation_type: "auto", repeatable: false, max_per_day: 1, active: true },
  { title: "Indicação", description: "", xp_value: 100, validation_type: "auto", repeatable: true, max_per_day: 1, active: true },
  { title: "Compra", description: "", xp_value: 200, validation_type: "manual", repeatable: true, max_per_day: 1, active: true },
];

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export function CampaignForm() {
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: "",
      slug: "",
      brand_name: "",
      logo_url: "",
      primary_color: "#00c853",
      starts_at: "",
      ends_at: "",
      active: true,
      admin_email: "",
      venues: [{ name: "", city: "", state: "" }],
      missions: DEFAULT_MISSIONS,
    },
  });

  const {
    fields: venueFields,
    append: appendVenue,
    remove: removeVenue,
  } = useFieldArray({ control, name: "venues" });

  const {
    fields: missionFields,
    append: appendMission,
    remove: removeMission,
  } = useFieldArray({ control, name: "missions" });

  const { mutate, isPending, error } = useCreateCampaignMutation();

  const title = watch("title");
  const slugField = register("slug");

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(title || ""));
  }, [title, slugTouched, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-10"
    >
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Campanha</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Título" htmlFor="title" error={errors.title?.message}>
            <input id="title" className={inputClass} {...register("title")} />
          </Field>

          <Field label="Slug" htmlFor="slug" error={errors.slug?.message}>
            <input
              id="slug"
              className={inputClass}
              {...slugField}
              onChange={(e) => {
                setSlugTouched(true);
                slugField.onChange(e);
              }}
            />
          </Field>

          <Field label="Marca" htmlFor="brand_name" error={errors.brand_name?.message}>
            <input id="brand_name" className={inputClass} {...register("brand_name")} />
          </Field>

          <Field label="Logo (URL)" htmlFor="logo_url" error={errors.logo_url?.message}>
            <input id="logo_url" type="url" className={inputClass} {...register("logo_url")} />
          </Field>

          <Field label="Cor principal" htmlFor="primary_color">
            <input
              id="primary_color"
              type="color"
              className={`${inputClass} h-11 p-1`}
              {...register("primary_color")}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium sm:mt-6">
            <input type="checkbox" {...register("active")} />
            Ativa
          </label>

          <Field label="Início" htmlFor="starts_at" error={errors.starts_at?.message}>
            <input id="starts_at" type="date" className={inputClass} {...register("starts_at")} />
          </Field>

          <Field label="Fim" htmlFor="ends_at" error={errors.ends_at?.message}>
            <input id="ends_at" type="date" className={inputClass} {...register("ends_at")} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Academias parceiras</h2>
          <button
            type="button"
            onClick={() => appendVenue({ name: "", city: "", state: "" })}
            className="text-sm underline"
          >
            + adicionar academia
          </button>
        </div>
        {errors.venues?.message && (
          <p className="text-sm text-red-600">{errors.venues.message}</p>
        )}

        {venueFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_80px_auto]"
          >
            <input
              placeholder="Nome"
              className={inputClass}
              {...register(`venues.${index}.name`)}
            />
            <input
              placeholder="Cidade"
              className={inputClass}
              {...register(`venues.${index}.city`)}
            />
            <Controller
              control={control}
              name={`venues.${index}.state`}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="UF"
                  maxLength={2}
                  className={inputClass}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              )}
            />
            <button
              type="button"
              disabled={venueFields.length === 1}
              onClick={() => removeVenue(index)}
              className="text-sm text-red-600 disabled:opacity-30"
            >
              remover
            </button>
            {errors.venues?.[index]?.name?.message && (
              <p className="col-span-full text-sm text-red-600">
                {errors.venues[index]?.name?.message}
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Missões</h2>
          <button
            type="button"
            onClick={() =>
              appendMission({
                title: "",
                description: "",
                xp_value: 0,
                validation_type: "manual",
                repeatable: false,
                max_per_day: 1,
                active: true,
              })
            }
            className="text-sm underline"
          >
            + adicionar missão
          </button>
        </div>
        {errors.missions?.message && (
          <p className="text-sm text-red-600">{errors.missions.message}</p>
        )}

        <div className="flex flex-col gap-3">
          {missionFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-2 gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-6"
            >
              <input
                placeholder="Título"
                className={`${inputClass} col-span-2`}
                {...register(`missions.${index}.title`)}
              />
              <input
                type="number"
                placeholder="XP"
                className={inputClass}
                {...register(`missions.${index}.xp_value`, { valueAsNumber: true })}
              />
              <select
                className={inputClass}
                {...register(`missions.${index}.validation_type`)}
              >
                <option value="qr">qr</option>
                <option value="manual">manual</option>
                <option value="auto">auto</option>
              </select>
              <input
                type="number"
                placeholder="Máx/dia"
                className={inputClass}
                {...register(`missions.${index}.max_per_day`, { valueAsNumber: true })}
              />
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input type="checkbox" {...register(`missions.${index}.repeatable`)} />
                  repetível
                </label>
                <button
                  type="button"
                  onClick={() => removeMission(index)}
                  className="ml-auto text-red-600"
                >
                  remover
                </button>
              </div>
              {errors.missions?.[index]?.title?.message && (
                <p className="col-span-full text-sm text-red-600">
                  {errors.missions[index]?.title?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Admin da campanha (opcional)</h2>
        <Field
          label="Email"
          htmlFor="admin_email"
          error={errors.admin_email?.message}
        >
          <input
            id="admin_email"
            type="email"
            placeholder="admin@academia.com"
            className={inputClass}
            {...register("admin_email")}
          />
        </Field>
        <p className="text-sm text-zinc-500">
          Se preenchido, a pessoa recebe um convite por email pra definir a
          própria senha e acessar só esta campanha.
        </p>
      </section>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending ? "Criando..." : "Criar campanha"}
      </button>
    </form>
  );
}
