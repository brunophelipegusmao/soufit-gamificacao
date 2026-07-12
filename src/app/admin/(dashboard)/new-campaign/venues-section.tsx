"use client";

import { useState } from "react";
import type {
  Control,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPagination } from "@/app/admin/list-pagination";
import type { CampaignFormValues } from "./campaign-form";

const PAGE_SIZE = 5;

export function VenuesSection({
  className,
  register,
  control,
  venueFields,
  appendVenue,
  removeVenue,
  errors,
}: {
  className?: string;
  register: UseFormRegister<CampaignFormValues>;
  control: Control<CampaignFormValues>;
  venueFields: CampaignFormValues["venues"];
  appendVenue: UseFieldArrayAppend<CampaignFormValues, "venues">;
  removeVenue: UseFieldArrayRemove;
  errors: FieldErrors<CampaignFormValues>;
}) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(venueFields.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageVenues = venueFields.slice(pageStart, pageStart + PAGE_SIZE);

  function handleAppendVenue() {
    appendVenue({ name: "", city: "", state: "" });
    setPage(Math.floor(venueFields.length / PAGE_SIZE));
  }

  function handleRemoveVenue(index: number) {
    removeVenue(index);
    const remaining = venueFields.length - 1;
    const lastPage = Math.max(0, Math.ceil(remaining / PAGE_SIZE) - 1);
    if (page > lastPage) setPage(lastPage);
  }

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Academias parceiras</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={handleAppendVenue}>
          <PlusIcon /> Adicionar academia
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {errors.venues?.message && (
          <p className="text-sm text-destructive">{errors.venues.message}</p>
        )}

        {venueFields.length > 0 && (
          <div className="hidden text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[2fr_1fr_80px_auto] sm:gap-2">
            <span>Nome</span>
            <span>Cidade</span>
            <span>UF</span>
            <span />
          </div>
        )}

        {pageVenues.map((field, i) => {
          const index = pageStart + i;
          return (
            <div key={index}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_80px_auto]">
                <Input placeholder="Nome" {...register(`venues.${index}.name`)} />
                <Input placeholder="Cidade" {...register(`venues.${index}.city`)} />
                <Controller
                  control={control}
                  name={`venues.${index}.state`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="UF"
                      maxLength={2}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={venueFields.length === 1}
                  onClick={() => handleRemoveVenue(index)}
                  className="text-destructive"
                >
                  <Trash2Icon />
                </Button>
              </div>
              {errors.venues?.[index]?.name?.message && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.venues[index]?.name?.message}
                </p>
              )}
            </div>
          );
        })}

        <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}
