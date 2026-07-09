"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slug";
import { createCampaign } from "./actions";

type Venue = { name: string; city: string; state: string };

type Mission = {
  title: string;
  description: string;
  xp_value: number;
  validation_type: "qr" | "manual" | "auto";
  repeatable: boolean;
  max_per_day: number;
  active: boolean;
};

const DEFAULT_MISSIONS: Mission[] = [
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
  const [state, action, pending] = useActionState(createCampaign, undefined);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [venues, setVenues] = useState<Venue[]>([
    { name: "", city: "", state: "" },
  ]);
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateVenue(index: number, patch: Partial<Venue>) {
    setVenues((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  function updateMission(index: number, patch: Partial<Mission>) {
    setMissions((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    );
  }

  return (
    <form action={action} className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Campanha</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Título
            <input
              name="title"
              required
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Slug
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Marca
            <input name="brand_name" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Logo (URL)
            <input name="logo_url" type="url" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Cor principal
            <input
              name="primary_color"
              type="color"
              defaultValue="#00c853"
              className={`${inputClass} h-11 p-1`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium sm:mt-6">
            <input name="active" type="checkbox" defaultChecked />
            Ativa
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Início
            <input name="starts_at" type="date" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Fim
            <input name="ends_at" type="date" required className={inputClass} />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Academias parceiras</h2>
          <button
            type="button"
            onClick={() =>
              setVenues((prev) => [...prev, { name: "", city: "", state: "" }])
            }
            className="text-sm underline"
          >
            + adicionar academia
          </button>
        </div>

        {venues.map((venue, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_80px_auto]">
            <input
              placeholder="Nome"
              value={venue.name}
              onChange={(e) => updateVenue(index, { name: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Cidade"
              value={venue.city}
              onChange={(e) => updateVenue(index, { city: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="UF"
              maxLength={2}
              value={venue.state}
              onChange={(e) =>
                updateVenue(index, { state: e.target.value.toUpperCase() })
              }
              className={inputClass}
            />
            <button
              type="button"
              disabled={venues.length === 1}
              onClick={() =>
                setVenues((prev) => prev.filter((_, i) => i !== index))
              }
              className="text-sm text-red-600 disabled:opacity-30"
            >
              remover
            </button>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Missões</h2>
          <button
            type="button"
            onClick={() =>
              setMissions((prev) => [
                ...prev,
                {
                  title: "",
                  description: "",
                  xp_value: 0,
                  validation_type: "manual",
                  repeatable: false,
                  max_per_day: 1,
                  active: true,
                },
              ])
            }
            className="text-sm underline"
          >
            + adicionar missão
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {missions.map((mission, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-6"
            >
              <input
                placeholder="Título"
                value={mission.title}
                onChange={(e) => updateMission(index, { title: e.target.value })}
                className={`${inputClass} col-span-2`}
              />
              <input
                type="number"
                placeholder="XP"
                value={mission.xp_value}
                onChange={(e) =>
                  updateMission(index, { xp_value: Number(e.target.value) })
                }
                className={inputClass}
              />
              <select
                value={mission.validation_type}
                onChange={(e) =>
                  updateMission(index, {
                    validation_type: e.target.value as Mission["validation_type"],
                  })
                }
                className={inputClass}
              >
                <option value="qr">qr</option>
                <option value="manual">manual</option>
                <option value="auto">auto</option>
              </select>
              <input
                type="number"
                placeholder="Máx/dia"
                value={mission.max_per_day}
                onChange={(e) =>
                  updateMission(index, { max_per_day: Number(e.target.value) })
                }
                className={inputClass}
              />
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={mission.repeatable}
                    onChange={(e) =>
                      updateMission(index, { repeatable: e.target.checked })
                    }
                  />
                  repetível
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setMissions((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="ml-auto text-red-600"
                >
                  remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Admin da campanha (opcional)</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="admin_email"
            type="email"
            placeholder="admin@academia.com"
            className={inputClass}
          />
        </label>
        <p className="text-sm text-zinc-500">
          Se preenchido, a pessoa recebe um convite por email pra definir a
          própria senha e acessar só esta campanha.
        </p>
      </section>

      <input type="hidden" name="venues" value={JSON.stringify(venues)} />
      <input type="hidden" name="missions" value={JSON.stringify(missions)} />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Criando..." : "Criar campanha"}
      </button>
    </form>
  );
}
