'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RecipeBuilder, type RecipeStep } from '@/components/flies/RecipeBuilder'
import { ChevronDown, ArrowLeft, Camera } from 'lucide-react'

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

export default function NewFlyPatternPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([])
  const [source, setSource] = useState<typeof FLY_SOURCES[number]>('tied')
  const [useSimpleMode, setUseSimpleMode] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    // Add recipe steps if using structured builder
    if (!useSimpleMode && recipeSteps.length > 0) {
      formData.set('recipe_steps', JSON.stringify(recipeSteps.map((s, i) => ({
        role: s.role,
        material_id: s.material?.id || null,
        material_name: s.materialName || s.material?.name || '',
        step_position: i + 1,
        color_choice: s.colorChoice || null,
        size_choice: s.sizeChoice || null,
        quantity: s.quantity || null,
        notes: s.notes || null,
        is_optional: s.isOptional,
      }))));
      formData.set('has_structured_recipe', 'true');
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

  const inputClass = "w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm text-[#F0F6FC] placeholder-[#6E7681] outline-none focus:border-[#E8923A] transition-colors"
  const labelClass = "block text-[10px] font-semibold text-[#6E7681] uppercase tracking-wider mb-1.5"

  return (
    <div className="min-h-screen bg-[#0D1117] pt-6 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/journal/flies"
          className="inline-flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fly Patterns
        </Link>

        <h1 className="text-3xl font-heading font-bold text-[#F0F6FC] mb-2">New Fly Pattern</h1>
        <p className="text-sm text-[#6E7681] mb-8">Build your recipe from our database of 500+ tying materials</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Basic Info ── */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-[#E8923A] uppercase tracking-wider">Pattern Info</h2>

            <div>
              <label htmlFor="name" className={labelClass}>
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Perdigon, Pheasant Tail, Woolly Bugger"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className={labelClass}>
                  Type <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    required
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select type...</option>
                    {FLY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7681] pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="size" className={labelClass}>Hook Sizes</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  placeholder="#14, #16, #18"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <label className={labelClass}>Source</label>
              <div className="flex gap-2">
                {FLY_SOURCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      source === s
                        ? 'bg-[#E8923A] text-white'
                        : 'bg-[#0D1117] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input type="hidden" name="source" value={source} />
            </div>
          </div>

          {/* ── Recipe / Materials (PRIMARY SECTION) ── */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-semibold text-[#E8923A] uppercase tracking-wider">Tying Recipe</h2>
                <p className="text-xs text-[#6E7681] mt-0.5">
                  {useSimpleMode
                    ? 'Free-text materials list'
                    : 'Search 500+ materials by name or brand'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseSimpleMode(!useSimpleMode)}
                className="text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors px-2 py-1 rounded border border-[#21262D] hover:border-[#E8923A]/30"
              >
                {useSimpleMode ? 'Use recipe builder' : 'Use simple text'}
              </button>
            </div>

            {useSimpleMode ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="hook" className={labelClass}>Hook</label>
                  <input type="text" id="hook" name="hook" placeholder="e.g. Tiemco TMC 2457 #16" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bead_size" className={labelClass}>Bead Size</label>
                    <input type="text" id="bead_size" name="bead_size" placeholder="e.g. 2.5mm" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="bead_color" className={labelClass}>Bead Color</label>
                    <input type="text" id="bead_color" name="bead_color" placeholder="e.g. gold" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="fly_color" className={labelClass}>Fly Color</label>
                  <input type="text" id="fly_color" name="fly_color" placeholder="e.g. olive, brown" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="materials" className={labelClass}>Materials</label>
                  <textarea
                    id="materials"
                    name="materials"
                    rows={4}
                    placeholder="List all materials (thread, dubbing, hackle, etc.)"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            ) : (
              <RecipeBuilder onChange={(steps) => setRecipeSteps(steps)} />
            )}
          </div>

          {/* ── Details ── */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-[#E8923A] uppercase tracking-wider">Details</h2>

            <div>
              <label htmlFor="description" className={labelClass}>Description / Notes</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Fishing tips, when to use, tying notes..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="video_url" className={labelClass}>Tying Video URL</label>
              <input
                type="text"
                id="video_url"
                name="video_url"
                placeholder="https://youtube.com/..."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="tags" className={labelClass}>Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="euro, tungsten, nymph, fast-water"
                className={inputClass}
              />
              <p className="text-[10px] text-[#6E7681] mt-1">Separate with commas</p>
            </div>
          </div>

          {/* ── Photo ── */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#E8923A] uppercase tracking-wider mb-3">Photo</h2>
            <label
              htmlFor="image"
              className="flex flex-col items-center justify-center border-2 border-dashed border-[#21262D] rounded-lg p-6 cursor-pointer hover:border-[#E8923A]/40 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-[#6E7681] mb-2" />
                  <span className="text-sm text-[#6E7681]">Tap to add a photo</span>
                </>
              )}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#E8923A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#d17d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Pattern'}
            </button>
            <Link
              href="/journal/flies"
              className="px-6 py-3 border border-[#21262D] text-[#A8B2BD] font-semibold rounded-lg hover:bg-[#161B22] transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
