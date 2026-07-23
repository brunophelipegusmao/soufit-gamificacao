"use client";

import { useState } from "react";
import type {
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
  UseFormGetValues,
} from "react-hook-form";
import { ListChecksIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPagination } from "@/app/admin/(dashboard)/components/list-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateCampaignInput } from "@/api/actions/create-campaign/schema";
import type { CampaignFormValues, MissionFormValue } from "./campaign-form";

const PAGE_SIZE = 5;

const VALIDATION_TYPES = [
  { value: "qr", label: "qr" },
  { value: "manual", label: "manual" },
  { value: "auto", label: "auto" },
] as const;

const EMPTY_MISSION_DRAFT: MissionFormValue = {
  title: "",
  description: "",
  xp_value: 0,
  validation_type: "manual",
  repeatable: false,
  max_per_day: 1,
  active: true,
  isDefault: false,
};

export function MissionsSection({
  className,
  missionFields,
  appendMission,
  updateMission,
  removeMission,
  getValues,
  errors,
}: {
  className?: string;
  missionFields: MissionFormValue[];
  appendMission: UseFieldArrayAppend<CampaignFormValues, "missions">;
  updateMission: UseFieldArrayUpdate<CampaignFormValues, "missions">;
  removeMission: UseFieldArrayRemove;
  getValues: UseFormGetValues<CampaignFormValues>;
  errors: FieldErrors<CampaignFormValues>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<MissionFormValue>(EMPTY_MISSION_DRAFT);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(missionFields.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageMissions = missionFields.slice(pageStart, pageStart + PAGE_SIZE);

  function openAddMissionDialog() {
    setEditingIndex(null);
    setDraft(EMPTY_MISSION_DRAFT);
    setDialogOpen(true);
  }

  function openEditMissionDialog(index: number) {
    setEditingIndex(index);
    setDraft(getValues(`missions.${index}`));
    setDialogOpen(true);
  }

  function handleSaveMission() {
    if (!draft.title.trim()) return;
    if (editingIndex === null) {
      appendMission(draft);
      setPage(Math.floor(missionFields.length / PAGE_SIZE));
    } else {
      updateMission(editingIndex, draft);
    }
    setDialogOpen(false);
  }

  function handleRemoveMission(index: number) {
    removeMission(index);
    const remaining = missionFields.length - 1;
    const lastPage = Math.max(0, Math.ceil(remaining / PAGE_SIZE) - 1);
    if (page > lastPage) setPage(lastPage);
  }

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Missões</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openAddMissionDialog}
        >
          <PlusIcon /> Adicionar missão
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {errors.missions?.message && (
          <p className="text-sm text-destructive">{errors.missions.message}</p>
        )}

        {pageMissions.map((mission, i) => {
          const index = pageStart + i;
          return (
            <div key={index}>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListChecksIcon className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {mission.title || "Sem título"}
                    </p>
                    {mission.isDefault && (
                      <Badge variant="secondary">Padrão</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {mission.validation_type} ·{" "}
                    {mission.repeatable ? "repetível" : "única vez"} · máx{" "}
                    {mission.max_per_day}/dia
                  </p>
                </div>

                <Badge variant="outline" className="shrink-0">
                  +{mission.xp_value}xp
                </Badge>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => openEditMissionDialog(index)}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-destructive"
                  disabled={missionFields.length === 1}
                  onClick={() => handleRemoveMission(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              {errors.missions?.[index]?.title?.message && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.missions[index]?.title?.message}
                </p>
              )}
            </div>
          );
        })}

        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex === null ? "Nova missão" : "Editar missão"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes da missão para esta campanha.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Título" htmlFor="mission-title">
              <Input
                id="mission-title"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
              />
            </Field>

            <Field label="Descrição" htmlFor="mission-description">
              <Textarea
                id="mission-description"
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="XP" htmlFor="mission-xp">
                <Input
                  id="mission-xp"
                  type="number"
                  value={draft.xp_value}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      xp_value: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Máx/dia" htmlFor="mission-max">
                <Input
                  id="mission-max"
                  type="number"
                  value={draft.max_per_day}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      max_per_day: Number(e.target.value),
                    }))
                  }
                />
              </Field>
            </div>

            <Field label="Tipo de validação" htmlFor="mission-validation">
              <Select
                value={draft.validation_type}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    validation_type:
                      v as CreateCampaignInput["missions"][number]["validation_type"],
                  }))
                }
              >
                <SelectTrigger id="mission-validation" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALIDATION_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Checkbox
                checked={draft.repeatable}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({ ...d, repeatable: checked === true }))
                }
              />
              Repetível
            </label>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              type="button"
              onClick={handleSaveMission}
              disabled={!draft.title.trim()}
            >
              {editingIndex === null ? "Adicionar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
