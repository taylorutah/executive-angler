'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RecipeBuilder, type RecipeStep } from '@/components/flies/RecipeBuilder'
import FlyImageUploader from '@/components/flies/FlyImageUploader'
import { ChevronDown, ArrowLeft } from 'lucide-react'

const FLY_TYPES = [
  'Nymph',
  'Dry Fly',
  'Streamer',
  'Wet Fly',
  'Emerger',
  'Terrestrial',
  'Egg',
  'Other'
]

const FLY_SOURCES = ['tied', 'bought', 'gifted'] as const;

const inputClass =
  'w-full h-9 bg-[#0D1117] border border-[#30363D] rounded-md px-2.5 text-[13px] text-[#F0F6FC] placeholder-[#6E7681] outline-none focus:border-[#E8923A] transition-colors'
const labelClass =
  'block text-[10px] font-bold uppercase tracking-widest text-[#6E7681] mb-1'

export default function NewFlyPatternPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([])
  const [source, setSource] = useState<typeof FLY_SOURCES[number]>('tied')
  const [useSimpleMode, setUseSimpleMode] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    if (imageFile) {
      formData.set('image', imageFile)
    } else {
      formData.delete('image')
    }

    if (!useSimpleMode && recipeSteps.length > 0) {
      formData.set(
        'recipe_steps',
        JSON.stringify(
          recipeSteps.map((s, i) => ({
            role: s.role,
            material_id: s.material?.id || null,
            material_name: s.materialName || s.material?.name || '',
            step_position: i + 1,
            color_choice: s.colorChoice || null,
            size_choice: s.sizeChoice || null,
            quantity: s.quantity || null,
            weight: s.weightChoice || null,
            material_type: s.materialTypeChoice || null,
            finish: s.finishChoice || null,
            notes: s.notes || null,
            is_optional: s.isOptional,
          }))
        )
      )
      formData.set('has_structured_recipe', 'true')
    }

    try {
      const response = await fetch('/api/fishing/flies', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create fly pattern')
      }

      router.push('/journal/flies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] pt-4 pb-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/journal/flies"
            className="inline-flex items-center gap-1.5 text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Fly Patterns
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
            New Pattern
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-end justify-between border-b border-[#21262D] pb-3 mb-4">
          <div>
            <h1 className="font-heading text-2xl text-[#F0F6FC] leading-tight">
              New Fly Pattern
            </h1>
            <p className="text-[12px] text-[#6E7681] mt-0.5">
              Build your recipe from 500+ tying materials
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-md mb-3 text-[13px]">
            {error}
          </div>
        )}

        <form id="new-fly-form" onSubmit={handleSubmit} className="space-y-3">
          {/* Two-column layout: form (left) + photo (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
            {/* MAIN COLUMN */}
            <div className="space-y-3 min-w-0">
              {/* Pattern Info */}
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                    Pattern Info
                  </h2>
                </header>
                <div className="p-3 grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="name" className={labelClass}>
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Perdigon, Pheasant Tail, Woolly Bugger"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label htmlFor="type" className={labelClass}>
                      Type <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="type"
                        name="type"
                        required
                        className={`${inputClass} appearance-none cursor-pointer pr-7`}
                        defaultValue=""
                      >
                        <option value="">Select…</option>
                        {FLY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E7681] pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label htmlFor="size" className={labelClass}>
                      Hook Sizes
                    </label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      placeholder="#14, #16, #18"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className={labelClass}>Source</label>
                    <div className="flex gap-1">
                      {FLY_SOURCES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSource(s)}
                          className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors capitalize ${
                            source === s
                              ? 'bg-[#E8923A] text-white'
                              : 'bg-[#0D1117] border border-[#30363D] text-[#A8B2BD] hover:border-[#E8923A]/60'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="source" value={source} />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="tags" className={labelClass}>
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      placeholder="euro, tungsten, nymph, fast-water"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Tying Recipe */}
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                      Tying Recipe
                    </h2>
                    <span className="text-[11px] text-[#6E7681]">
                      {useSimpleMode
                        ? 'Free-text materials list'
                        : 'Search 500+ materials by name or brand'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseSimpleMode(!useSimpleMode)}
                    className="text-[11px] text-[#A8B2BD] hover:text-[#E8923A] transition-colors px-2 h-6 rounded border border-[#30363D] hover:border-[#E8923A]/40"
                  >
                    {useSimpleMode ? 'Use recipe builder' : 'Use simple text'}
                  </button>
                </header>

                <div className={useSimpleMode ? 'p-3' : ''}>
                  {useSimpleMode ? (
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-6">
                        <label htmlFor="hook" className={labelClass}>
                          Hook
                        </label>
                        <input
                          type="text"
                          id="hook"
                          name="hook"
                          placeholder="Tiemco TMC 2457 #16"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label htmlFor="bead_size" className={labelClass}>
                          Bead Size
                        </label>
                        <input
                          type="text"
                          id="bead_size"
                          name="bead_size"
                          placeholder="2.5mm"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label htmlFor="bead_color" className={labelClass}>
                          Bead Color
                        </label>
                        <input
                          type="text"
                          id="bead_color"
                          name="bead_color"
                          placeholder="gold"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label htmlFor="fly_color" className={labelClass}>
                          Fly Color
                        </label>
                        <input
                          type="text"
                          id="fly_color"
                          name="fly_color"
                          placeholder="olive, brown"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-12">
                        <label htmlFor="materials" className={labelClass}>
                          Materials
                        </label>
                        <textarea
                          id="materials"
                          name="materials"
                          rows={4}
                          placeholder="List all materials (thread, dubbing, hackle, etc.)"
                          className={`${inputClass} h-auto py-2 resize-none`}
                        />
                      </div>
                    </div>
                  ) : (
                    <RecipeBuilder onChange={(steps) => setRecipeSteps(steps)} />
                  )}
                </div>
              </section>

              {/* Details */}
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                    Details
                  </h2>
                </header>
                <div className="p-3 space-y-3">
                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Description / Notes
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Fishing tips, when to use, tying notes…"
                      className={`${inputClass} h-auto py-2 resize-none`}
                    />
                  </div>
                  <div>
                    <label htmlFor="video_url" className={labelClass}>
                      Tying Video URL
                    </label>
                    <input
                      type="text"
                      id="video_url"
                      name="video_url"
                      placeholder="https://youtube.com/…"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* SIDEBAR — photo */}
            <aside className="space-y-3">
              <section className="border border-[#30363D] rounded-md bg-[#161B22]">
                <header className="flex items-center justify-between border-b border-[#30363D] bg-[#0D1117] px-3 py-1.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD]">
                    Photo
                  </h2>
                </header>
                <div className="p-3">
                  <FlyImageUploader onFileChange={setImageFile} />
                </div>
              </section>
            </aside>
          </div>
        </form>

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0D1117] border-t border-[#21262D] z-40">
          <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-2">
            <Link
              href="/journal/flies"
              className="px-3 h-9 inline-flex items-center text-[12px] text-[#A8B2BD] hover:text-[#F0F6FC] border border-[#30363D] rounded-md hover:border-[#E8923A]/40 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="new-fly-form"
              disabled={isSubmitting}
              className="ml-auto h-9 px-4 inline-flex items-center bg-[#E8923A] text-white text-[12px] font-semibold rounded-md hover:bg-[#d17d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating…' : 'Create Pattern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
