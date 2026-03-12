'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function NewFlyPatternPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
    <div className="min-h-screen bg-[#161B22] py-12">
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
            <label htmlFor="name" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
            <label htmlFor="type" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
            <label htmlFor="hook_sizes" className="block text-sm font-semibold text-[#8B949E] mb-2">
              Hook Sizes
            </label>
            <input
              type="text"
              id="hook_sizes"
              name="hook_sizes"
              placeholder="#14, #16, #18"
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="hook" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
              <label htmlFor="bead_size" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
              <label htmlFor="bead_color" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
            <label htmlFor="fly_color" className="block text-sm font-semibold text-[#8B949E] mb-2">
              Fly Color
            </label>
            <input
              type="text"
              id="fly_color"
              name="fly_color"
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="materials" className="block text-sm font-semibold text-[#8B949E] mb-2">
              Materials
            </label>
            <textarea
              id="materials"
              name="materials"
              rows={4}
              className="w-full px-4 py-2 border border-[#21262D] rounded-lg focus:ring-2 focus:ring-[#E8923A] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
            <label htmlFor="video_url" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
            <label htmlFor="image" className="block text-sm font-semibold text-[#8B949E] mb-2">
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
              className="flex-1 bg-[#E8923A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E8923A]-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Pattern'}
            </button>
            <Link
              href="/journal/flies"
              className="px-6 py-3 border border-[#21262D] text-[#8B949E] font-semibold rounded-lg hover:bg-[#0D1117] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
