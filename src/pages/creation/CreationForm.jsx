
import { useRef, useState } from 'react'
import {
  Globe,
  Lock,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react'

import { getWorlds } from '../../data/worldStore'
import { saveCreation } from '../../data/creationStore'

const CREATION_TYPES = [
  { value: 'project', label: 'Project' },
  { value: 'idea', label: 'Idea' },
  { value: 'resource', label: 'Resource' },
  { value: 'article', label: 'Article' },
]

const SUGGESTED_TOPICS = [
  'AI',
  'Artificial Intelligence',
  'AI Agents',
  'React',
  'JavaScript',
  'Web Development',
  'Frontend',
  'UI Design',
  'UX Design',
  'Design Systems',
  'Game Development',
  'Game Design',
  'World Building',
  'Storytelling',
  'Building',
  'Projects',
  'Entrepreneurship',
  'Product Development',
  'Learning',
  'Education',
  'Knowledge Sharing',
  'Collaboration',
]

export default function CreationForm({
  mode = 'create',
  creation,
  initialWorldId,
  onSuccess,
  submitLabel,
}) {
  const isCreate = mode === 'create'

  const availableWorlds = getWorlds()

  const defaultWorldId =
    initialWorldId &&
    availableWorlds.some(
      (world) => world.id === initialWorldId
    )
      ? initialWorldId
      : availableWorlds[0]?.id || ''

  const [title, setTitle] = useState(
    creation?.title || ''
  )

  const [description, setDescription] = useState(
    creation?.description || ''
  )

  const [type, setType] = useState(
    creation?.type || 'project'
  )

  const [visibility, setVisibility] = useState(
    creation?.visibility || 'public'
  )

  const [coverImage, setCoverImage] = useState(
    creation?.cover_image || ''
  )

  const [worldId, setWorldId] = useState(
    creation?.world_id ||
      initialWorldId ||
      defaultWorldId
  )

  const [topics, setTopics] = useState(
    Array.isArray(creation?.topics)
      ? creation.topics
      : []
  )

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiSuggestions, setAiSuggestions] =
    useState(null)

  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  const handleImageUpload = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    setError('')
    setUploading(true)

    const reader = new FileReader()

    reader.onloadend = () => {
      setCoverImage(reader.result)
      setUploading(false)
    }

    reader.onerror = () => {
      setError(
        'Failed to load image. Please try again.'
      )
      setUploading(false)
    }

    reader.readAsDataURL(file)
  }

  const toggleTopic = (topic) => {
    setTopics((currentTopics) => {
      const alreadySelected =
        currentTopics.some(
          (item) =>
            item.toLowerCase() ===
            topic.toLowerCase()
        )

      if (alreadySelected) {
        return currentTopics.filter(
          (item) =>
            item.toLowerCase() !==
            topic.toLowerCase()
        )
      }

      return [...currentTopics, topic]
    })
  }

  const handleAIAssist = async () => {
    setAiError('')
    setAiSuggestions(null)

    const trimmedTitle = title.trim()
    const trimmedDescription =
      description.trim()

    if (
      !trimmedTitle &&
      !trimmedDescription
    ) {
      setAiError(
        'Add a title or description before asking AI to assist.'
      )
      return
    }

    const selectedWorld = availableWorlds.find(
      (world) => world.id === worldId
    )

    setAiLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3001/api/ai/assist-creation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: trimmedTitle,
            description: trimmedDescription,
            world: selectedWorld || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'REALM AI could not assist with this Creation.'
        )
      }

      if (
        typeof data?.suggestedTitle !==
          'string' ||
        typeof data?.suggestedDescription !==
          'string'
      ) {
        throw new Error(
          'REALM AI returned an invalid assistance response.'
        )
      }

      setAiSuggestions({
        suggestedTitle:
          data.suggestedTitle.trim(),
        suggestedDescription:
          data.suggestedDescription.trim(),
      })
    } catch (err) {
      console.error(
        'Creation AI Assist error:',
        err
      )

      setAiError(
        err?.message ||
          'REALM AI could not assist with this Creation. Please try again.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyAISuggestions = () => {
    if (!aiSuggestions) return

    if (aiSuggestions.suggestedTitle) {
      setTitle(aiSuggestions.suggestedTitle)
    }

    if (
      aiSuggestions.suggestedDescription
    ) {
      setDescription(
        aiSuggestions.suggestedDescription
      )
    }

    setAiSuggestions(null)
    setAiError('')
  }

  const handleKeepMyText = () => {
    setAiSuggestions(null)
    setAiError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (
      trimmedTitle.length < 1 ||
      trimmedTitle.length > 100
    ) {
      setError(
        'Title must be between 1 and 100 characters.'
      )
      return
    }

    if (isCreate && !worldId) {
      setError(
        'Please choose a World to publish in.'
      )
      return
    }

    const selectedWorld = availableWorlds.find(
      (world) => world.id === worldId
    )

    if (isCreate && !selectedWorld) {
      setError(
        'The selected World could not be found.'
      )
      return
    }

    setLoading(true)

    try {
      const result = {
        id: creation?.id || crypto.randomUUID(),

        slug:
          creation?.slug ||
          trimmedTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),

        title: trimmedTitle,

        excerpt: trimmedDescription,

        description: trimmedDescription,

        content: trimmedDescription,

        topics,

        creator:
          creation?.creator || {
            name: 'You',
            username: 'you',
          },

        likes: creation?.likes || 0,

        comments: creation?.comments || 0,

        createdAt:
          creation?.createdAt ||
          new Date().toISOString(),

        type,

        visibility,

        cover_image: coverImage || '',

        world_id:
          selectedWorld?.id || worldId,

        worldSlug:
          selectedWorld?.slug ||
          creation?.worldSlug ||
          '',
      }

      saveCreation(result)

      onSuccess?.(result)
    } catch (err) {
      console.error(
        'Failed to publish Creation:',
        err
      )

      setError(
        err?.message ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const noWorlds =
    isCreate && availableWorlds.length === 0

  return (
    <form
      className="creation-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="creation-form-error">
          {error}
        </div>
      )}

      {noWorlds && (
        <div className="creation-form-no-worlds">
          <strong>No Worlds available</strong>

          <p>
            You aren't an active member of any World yet.
            Join or create a World before publishing a
            Creation.
          </p>
        </div>
      )}

      {/* Cover image */}
      <div className="creation-form-field">
        <label className="creation-form-label">
          Cover image
        </label>

        <div className="creation-cover-preview">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Creation cover preview"
              className="creation-cover-image"
            />
          ) : (
            <div className="creation-cover-placeholder" />
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="creation-hidden-input"
          onChange={(event) => {
            handleImageUpload(
              event.target.files?.[0]
            )
          }}
        />

        <button
          type="button"
          className="creation-upload-button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={uploading}
        >
          <span>
            {uploading ? (
              <>
                <Loader2
                  size={16}
                  className="creation-spin"
                />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={16} />
                {coverImage
                  ? 'Change image'
                  : 'Upload cover'}
              </>
            )}
          </span>
        </button>
      </div>

      {/* Title */}
      <div className="creation-form-field">
        <label
          className="creation-form-label"
          htmlFor="creation-title"
        >
          Title
        </label>

        <input
          id="creation-title"
          className="creation-form-input"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          maxLength={100}
          placeholder="Name your Creation"
          required
        />

        <p className="creation-character-count">
          {title.length}/100
        </p>
      </div>

      {/* World */}
      {isCreate && (
        <div className="creation-form-field">
          <label
            className="creation-form-label"
            htmlFor="creation-world"
          >
            World
          </label>

          <select
            id="creation-world"
            className="creation-form-select"
            value={worldId}
            onChange={(event) =>
              setWorldId(event.target.value)
            }
            disabled={noWorlds}
          >
            {noWorlds ? (
              <option value="">
                No Worlds available
              </option>
            ) : (
              availableWorlds.map((world) => (
                <option
                  key={world.id}
                  value={world.id}
                >
                  {world.name}
                  {world.visibility === 'private'
                    ? ' (Private)'
                    : ''}
                </option>
              ))
            )}
          </select>

          <p className="creation-form-help">
            You can only publish inside Worlds where
            you're an active member.
          </p>
        </div>
      )}

      {/* Description */}
      <div className="creation-form-field">
        <label
          className="creation-form-label"
          htmlFor="creation-description"
        >
          Description
        </label>

        <textarea
          id="creation-description"
          className="creation-form-textarea"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          maxLength={2000}
          rows={5}
          placeholder="Describe your Creation"
        />

        <p className="creation-character-count">
          {description.length}/2000
        </p>
      </div>

      {/* Topics */}
      <div className="creation-form-field">
        <span className="creation-form-label">
          Topics
        </span>

        <p className="creation-form-help">
          Add topics that help people discover your
          Creation.
        </p>

        <div className="creation-topic-grid">
          {SUGGESTED_TOPICS.map(
            (suggestedTopic) => {
              const selected =
                topics.some(
                  (item) =>
                    item.toLowerCase() ===
                    suggestedTopic.toLowerCase()
                )

              return (
                <button
                  key={suggestedTopic}
                  type="button"
                  className={
                    selected
                      ? 'creation-topic-option active'
                      : 'creation-topic-option'
                  }
                  onClick={() =>
                    toggleTopic(
                      suggestedTopic
                    )
                  }
                >
                  {suggestedTopic}
                </button>
              )
            }
          )}
        </div>

        {topics.length > 0 && (
          <p className="creation-form-help">
            {topics.length} topic
            {topics.length === 1
              ? ''
              : 's'} selected.
          </p>
        )}
      </div>

      {/* AI assistance */}
      <div className="creation-ai-card">
        <div>
          <span className="creation-ai-label">
            AI ASSIST
          </span>

          <p>
            Get help refining your title and
            description.
          </p>
        </div>

        <button
          type="button"
          className="creation-ai-button"
          onClick={handleAIAssist}
          disabled={aiLoading || loading}
        >
          {aiLoading ? (
            <>
              <Loader2
                size={16}
                className="creation-spin"
              />
              Thinking…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Assist with AI
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="creation-form-error">
          {aiError}
        </div>
      )}

      {aiSuggestions && (
        <div className="creation-ai-suggestions">
          <div className="creation-ai-suggestions-header">
            <div>
              <span className="creation-ai-label">
                AI SUGGESTION
              </span>

              <h3>
                Review the suggested changes
              </h3>
            </div>
          </div>

          <div className="creation-ai-suggestion-field">
            <span>Suggested title</span>

            <p>
              {aiSuggestions.suggestedTitle ||
                'No title suggestion provided.'}
            </p>
          </div>

          <div className="creation-ai-suggestion-field">
            <span>
              Suggested description
            </span>

            <p>
              {aiSuggestions.suggestedDescription ||
                'No description suggestion provided.'}
            </p>
          </div>

          <div className="creation-ai-suggestion-actions">
            <button
              type="button"
              className="creation-ai-apply-button"
              onClick={
                handleApplyAISuggestions
              }
            >
              Apply suggestions
            </button>

            <button
              type="button"
              className="creation-ai-keep-button"
              onClick={handleKeepMyText}
            >
              Keep my text
            </button>
          </div>
        </div>
      )}

      {/* Type */}
      <div className="creation-form-field">
        <label
          className="creation-form-label"
          htmlFor="creation-type"
        >
          Type
        </label>

        <select
          id="creation-type"
          className="creation-form-select"
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
        >
          {CREATION_TYPES.map(
            (creationType) => (
              <option
                key={creationType.value}
                value={creationType.value}
              >
                {creationType.label}
              </option>
            )
          )}
        </select>
      </div>

      {/* Visibility */}
      <div className="creation-form-field">
        <span className="creation-form-label">
          Visibility
        </span>

        <div className="creation-visibility-grid">
          <VisibilityOption
            active={visibility === 'public'}
            onClick={() =>
              setVisibility('public')
            }
            icon={Globe}
            title="Public"
            description="Discoverable in public Worlds"
          />

          <VisibilityOption
            active={visibility === 'private'}
            onClick={() =>
              setVisibility('private')
            }
            icon={Lock}
            title="Private"
            description="Restricted to authorized users"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="creation-form-actions">
        <button
          type="submit"
          className="creation-submit-button"
          disabled={
            loading ||
            uploading ||
            noWorlds
          }
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                className="creation-spin"
              />

              {isCreate
                ? 'Publishing…'
                : 'Saving…'}
            </>
          ) : (
            submitLabel ||
            (isCreate
              ? 'Publish Creation'
              : 'Save changes')
          )}
        </button>
      </div>
    </form>
  )
}

function VisibilityOption({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`creation-visibility-option ${
        active ? 'active' : ''
      }`}
    >
      <span className="creation-visibility-title">
        <Icon size={16} />
        {title}
      </span>

      <span className="creation-visibility-description">
        {description}
      </span>
    </button>
  )
}

