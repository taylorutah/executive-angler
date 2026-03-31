'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RecipeBuilder, type RecipeStep } from '@/components/flies/RecipeBuilder'

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
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false)

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
    if (showRecipeBuilder && recipeSteps.length > 0) {
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

  return (
    <div className="min-h-screen bg-[#161B22] pt-6 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/journal/flies"
          className="inline-flex items-center text-[#E8923A] hover:text-[#E8923A] mb-6"
        >
          ← Back to Fly Patterns
        </Link>

        <h1 className="text-4xl font-heading font-bold text-[#F0F6FC] mb-8">Add Fly Pattern</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            >
              <option value="">Select type...</option>
              {FLY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Hook Sizes
            </label>
            <input
              type="text"
              id="size"
              name="size"
              placeholder="#14, #16, #18"
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="hook" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Hook
            </label>
            <input
              type="text"
              id="hook"
              name="hook"
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bead_size" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
                Bead Size
              </label>
              <input
                type="text"
                id="bead_size"
                name="bead_size"
                className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="bead_color" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
                Bead Color
              </label>
              <input
                type="text"
                id="bead_color"
                name="bead_color"
                className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="fly_color" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Fly Color
            </label>
            <input
              type="text"
              id="fly_color"
              name="fly_color"
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          {/* Source toggle */}
          <div>
            <label className="block text-sm font-semibold text-[#A8B2BD] mb-2">Source</label>
            <div className="flex gap-2">
              {FLY_SOURCES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    source === s
                      ? 'bg-[#E8923A] text-white'
                      : 'bg-[#0D1117] border border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input type="hidden" name="source" value={source} />
          </div>

          {/* Materials — free text or structured recipe */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="materials" className="block text-sm font-semibold text-[#A8B2BD]">
                Materials
              </label>
              <button
                type="button"
                onClick={() => setShowRecipeBuilder(!showRecipeBuilder)}
                className="text-xs text-[#E8923A] hover:underline"
              >
                {showRecipeBuilder ? 'Use simple text' : 'Use structured recipe builder'}
              </button>
            </div>

            {showRecipeBuilder ? (
              <RecipeBuilder
                onChange={(steps) => setRecipeSteps(steps)}
              />
            ) : (
              <textarea
                id="materials"
                name="materials"
                rows={4}
                placeholder="List materials or switch to the structured recipe builder above"
                className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent bg-[#0D1117] text-[#F0F6FC] placeholder-[#6E7681]"
              />
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="video_url" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Video URL
            </label>
            <input
              type="text"
              id="video_url"
              name="video_url"
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="euro, tungsten, nymph, fast-water"
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
            <p className="text-xs text-[#6E7681] mt-1">Separate with commas</p>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-[#A8B2BD] mb-2">
              Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs rounded-lg border border-[#21262D]"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#E8923A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0D1117] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Pattern'}
            </button>
            <Link
              href="/journal/flies"
              className="px-6 py-3 border border-[#21262D] text-[#A8B2BD] font-semibold rounded-lg hover:bg-[#0D1117] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
