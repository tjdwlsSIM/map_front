import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DEFAULT_SCHOOL_NAME, getStoredSchool } from './appData'
import { searchUniversities } from './services/api'
import iconImage from './assets/icon.png'
import { getSchoolLogoSrc } from './schoolLogoMap'
import { LogoHeader } from './uiParts'

const MAX_UNIVERSITY_OPTIONS = 80

export default function StartPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const storedSchool = location.state?.schoolName || getStoredSchool() || DEFAULT_SCHOOL_NAME

  const [university, setUniversity] = useState(storedSchool)
  const [selectedUniversity, setSelectedUniversity] = useState(location.state?.school || null)
  const [suggestions, setSuggestions] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const [fadeOutIntro, setFadeOutIntro] = useState(false)
  const [hideIntro, setHideIntro] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFadeOutIntro(true), 100)
    const hideTimer = window.setTimeout(() => setHideIntro(true), 1700)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    const keyword = university.trim()

    if (!isFocused) {
      setSuggestions(selectedUniversity && keyword === selectedUniversity.name ? [selectedUniversity] : [])
      return
    }

    let isMounted = true
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')

      try {
        const results = await searchUniversities(keyword)
        if (isMounted) {
          setSuggestions(results.slice(0, MAX_UNIVERSITY_OPTIONS))
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message)
          setSuggestions([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }, 250)

    return () => {
      isMounted = false
      window.clearTimeout(timer)
    }
  }, [isFocused, selectedUniversity, university])

  const handleSelect = (school) => {
    setUniversity(school.name)
    setSelectedUniversity(school)
    setIsFocused(false)
    setError('')
  }

  const handleEnter = () => {
    if (!selectedUniversity) {
      return
    }

    navigate('/confirm', { state: { school: selectedUniversity, schoolName: selectedUniversity.name } })
  }

  return (
    <div className="screen">
      <div className="phone-frame phone-frame--brand">
        <section className="start-layout">
          <LogoHeader />

          <main className="selection-card stack stack--md">
            <p className="selection-card__hint">대학교 명을 입력해주세요!</p>

            <div className="selection-card__input-wrap">
              <input
                type="text"
                className="selection-card__input"
                placeholder="Ex) OO대"
                value={university}
                onChange={(event) => {
                  setUniversity(event.target.value)
                  setSelectedUniversity(null)
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsFocused(false), 120)
                }}
              />

              {isFocused && suggestions.length > 0 && (
                <div className="suggestion-list">
                  {suggestions.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      className="suggestion-item"
                      onMouseDown={() => handleSelect(school)}
                    >
                      <span className="school-option">
                        <img src={getSchoolLogoSrc(school.name) || iconImage} alt="" className="school-logo" />
                        <span>{school.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="selection-card__guide">
              검색 목록에서 학교를 선택하면
              <br />
              다음 단계로 이동할 수 있어요.
            </p>

            {selectedUniversity && (
              <p className="selection-card__selected">{`선택된 대학: ${selectedUniversity.name}`}</p>
            )}

            {!selectedUniversity && isLoading && <p className="selection-card__guide">학교를 찾는 중이에요...</p>}
            {error && <p className="selection-card__guide">{error}</p>}

            <button
              type="button"
              className="primary-button selection-card__action"
              disabled={!selectedUniversity}
              onClick={handleEnter}
            >
              입장하기
            </button>
          </main>
        </section>

        {!hideIntro && (
          <section className={`splash-overlay ${fadeOutIntro ? 'splash-overlay--hidden' : ''}`}>
            <div className="splash-overlay__inner">
              <LogoHeader />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
