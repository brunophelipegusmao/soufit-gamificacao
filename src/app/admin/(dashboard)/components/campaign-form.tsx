"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { slugify } from "@/lib/slug";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateCampaignMutation } from "@/hooks/mutations/use-create-campaign-mutation";
import {
  createCampaignSchema,
  type CreateCampaignInput,
} from "@/api/actions/create-campaign/schema";
import { MissionsSection } from "./missions-section";
import { VenuesSection } from "./venues-section";

export type MissionFormValue = CreateCampaignInput["missions"][number] & {
  isDefault?: boolean;
};

export type CampaignFormValues = Omit<CreateCampaignInput, "missions"> & {
  missions: MissionFormValue[];
};

const DEFAULT_MISSIONS: MissionFormValue[] = [
  { title: "Cadastro", description: "", xp_value: 100, validation_type: "auto", repeatable: false, max_per_day: 1, active: true, isDefault: true },
  { title: "Primeiro login", description: "", xp_value: 50, validation_type: "auto", repeatable: false, max_per_day: 1, active: true, isDefault: true },
  { title: "Check-in", description: "", xp_value: 20, validation_type: "qr", repeatable: true, max_per_day: 1, active: true, isDefault: true },
  { title: "Aula", description: "", xp_value: 30, validation_type: "qr", repeatable: true, max_per_day: 1, active: true, isDefault: true },
  { title: "Story", description: "", xp_value: 80, validation_type: "manual", repeatable: true, max_per_day: 1, active: true, isDefault: true },
  { title: "Feed", description: "", xp_value: 150, validation_type: "manual", repeatable: true, max_per_day: 1, active: true, isDefault: true },
  { title: "Seguir perfil", description: "Print mostrando que seguiu o perfil no Instagram, aprovado no painel.", xp_value: 30, validation_type: "manual", repeatable: false, max_per_day: 1, active: true, isDefault: true },
  { title: "Quiz", description: "", xp_value: 40, validation_type: "auto", repeatable: false, max_per_day: 1, active: true, isDefault: true },
  { title: "Indicação", description: "", xp_value: 100, validation_type: "auto", repeatable: true, max_per_day: 1, active: true, isDefault: true },
  { title: "Compra", description: "", xp_value: 200, validation_type: "manual", repeatable: true, max_per_day: 1, active: true, isDefault: true },
];

export function CampaignForm() {
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: "",
      slug: "",
      brand_name: "",
      logo_url: "",
      primary_color: "#00c853",
      contract_starts_at: "",
      contract_ends_at: "",
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
    update: updateMission,
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
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Nova campanha</h1>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? "Criando..." : "Criar campanha"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Campanha</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Título" htmlFor="title" error={errors.title?.message}>
              <Input id="title" {...register("title")} />
            </Field>

            <Field label="Slug" htmlFor="slug" error={errors.slug?.message}>
              <Input
                id="slug"
                {...slugField}
                onChange={(e) => {
                  setSlugTouched(true);
                  slugField.onChange(e);
                }}
              />
            </Field>

            <Field label="Marca" htmlFor="brand_name" error={errors.brand_name?.message}>
              <Input id="brand_name" {...register("brand_name")} />
            </Field>

            <Field label="Logo (URL)" htmlFor="logo_url" error={errors.logo_url?.message}>
              <Input id="logo_url" type="url" {...register("logo_url")} />
            </Field>

            <Field label="Cor principal" htmlFor="primary_color">
              <Input
                id="primary_color"
                type="color"
                className="h-9 p-1"
                {...register("primary_color")}
              />
            </Field>

            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm font-medium sm:mt-6 cursor-pointer">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  Ativa
                </label>
              )}
            />

            <Field label="Início da contratação" htmlFor="contract_starts_at" error={errors.contract_starts_at?.message}>
              <Input id="contract_starts_at" type="date" {...register("contract_starts_at")} />
            </Field>

            <Field label="Fim da contratação" htmlFor="contract_ends_at" error={errors.contract_ends_at?.message}>
              <Input id="contract_ends_at" type="date" {...register("contract_ends_at")} />
            </Field>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Admin da campanha (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Field label="Email" htmlFor="admin_email" error={errors.admin_email?.message}>
              <Input
                id="admin_email"
                type="email"
                placeholder="admin@academia.com"
                {...register("admin_email")}
              />
            </Field>
            <p className="text-sm text-muted-foreground">
              Se preenchido, a pessoa recebe um convite por email pra definir a
              própria senha e acessar só esta campanha.
            </p>
          </CardContent>
        </Card>

        <VenuesSection
          className="lg:col-span-6"
          register={register}
          control={control}
          venueFields={venueFields}
          appendVenue={appendVenue}
          removeVenue={removeVenue}
          errors={errors}
        />

        <MissionsSection
          className="lg:col-span-6"
          missionFields={missionFields}
          appendMission={appendMission}
          updateMission={updateMission}
          removeMission={removeMission}
          getValues={getValues}
          errors={errors}
        />
      </div>
    </form>
  );
}
