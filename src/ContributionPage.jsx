import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStoredSchool, getStoredSchoolId, markContributed, setStoredSchool } from './appData'
import { contributeToUniversity, createUniversityVibe, getUniversityById, getUniversityStats } from './services/api'
import { FooterSchoolButton, LogoHeader } from './uiParts'

export default function ContributionPage() {
  const navigate = useNavigate()
  const { universityId = '' } = useParams()
  const parsedUniversityId = Number(universityId)
  const selectedSchool = getStoredSchool()
  const selectedSchoolId = getStoredSchoolId()
  const [detail, setDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [quoteError, setQuoteError] = useState('')

  const [progress, setProgress] = useState(0)
  const [sleepHours, setSleepHours] = useState(0)
  const [isCramming, setIsCramming] = useState(false)
  const [fearScore, setFearScore] = useState(0)
  const [moodText, setMoodText] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDetail = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [university, stats] = await Promise.all([
          getUniversityById(parsedUniversityId),
          getUniversityStats(parsedUniversityId),
        ])

        if (!isMounted) {
          return
        }

        const nextDetail = {
          id: university.id,
          schoolName: university.name,
          progress: Number(stats.avgProgress ?? 0),
          sleepHours: Number(stats.avgSleepHours ?? 0),
          cramCount: Number(stats.crammerCount ?? 0),
          fearScore: Number(stats.avgExamFear ?? 0),
        }

        setDetail(nextDetail)
        setProgress(nextDetail.progress)
        setSleepHours(nextDetail.sleepHours)
        setIsCramming(nextDetail.cramCount > 0)
        setFearScore(nextDetail.fearScore)
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (Number.isFinite(parsedUniversityId) && parsedUniversityId > 0) {
      loadDetail()
    } else {
      setError('학교 정보를 찾을 수 없어요.')
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [parsedUniversityId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!detail) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setQuoteError('')

    try {
      await contributeToUniversity(detail.id, {
        progress: Number(progress),
        sleepHours: Number(sleepHours),
        isCrammer: isCramming,
        examFear: Number(fearScore),
        currentMood: moodText.trim(),
      })

      markContributed(detail.id)
      setStoredSchool({ id: detail.id, name: detail.schoolName })
      navigate(`/school/${detail.id}`, {
        replace: true,
        state: { submitted: true },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openSchool = () => {
    if (selectedSchoolId) {
      navigate(`/school/${selectedSchoolId}`)
    }
  }

  return (
    <div className="screen">
      <div className="phone-frame">
        <div className="page-shell">
          <LogoHeader compact />

          <main className="page-main">
            <h2 className="detail-title">
              {detail ? `여기는 "${detail.schoolName}" 입니다.` : '학교 정보를 불러오는 중입니다.'}
            </h2>

            <form className="contribution-card stack stack--md" onSubmit={handleSubmit}>
              <div className="contribution-card__header">나의 현재 상황은...?</div>
              {isLoading && <p className="detail-note">기여 화면을 준비하고 있어요.</p>}
              {error && <p className="detail-note">{error}</p>}
              {quoteError && <p className="detail-note">{quoteError}</p>}

              <div className="form-grid">
                <div className="field-card">
                  <p className="field-card__label">나의 현재 시험 공부 진도율</p>
                  <div className="field-card__input-row">
                    <input
                      type="number"
                      className="number-pill"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(event) => setProgress(event.target.value)}
                      disabled={!detail || isSubmitting}
                    />
                    <span className="unit-label">%</span>
                  </div>
                </div>

                <div className="field-card">
                  <p className="field-card__label">나의 평균 수면 시간</p>
                  <div className="field-card__input-row">
                    <input
                      type="number"
                      className="number-pill"
                      min="0"
                      max="24"
                      value={sleepHours}
                      onChange={(event) => setSleepHours(event.target.value)}
                      disabled={!detail || isSubmitting}
                    />
                    <span className="unit-label">시간</span>
                  </div>
                </div>

                <div className="field-card">
                  <p className="field-card__label">벼락치기 여부</p>
                  <div className="binary-row">
                    <label className="binary-option">
                      <input
                        type="radio"
                        name="cramming"
                        checked={isCramming}
                        onChange={() => setIsCramming(true)}
                        disabled={!detail || isSubmitting}
                      />
                      예
                    </label>
                    <label className="binary-option">
                      <input
                        type="radio"
                        name="cramming"
                        checked={!isCramming}
                        onChange={() => setIsCramming(false)}
                        disabled={!detail || isSubmitting}
                      />
                      아니요
                    </label>
                  </div>
                </div>

                <div className="field-card">
                  <p className="field-card__label">나의 현재 시험 공포지수</p>
                  <div className="field-card__input-row">
                    <input
                      type="number"
                      className="number-pill"
                      min="0"
                      max="10"
                      value={fearScore}
                      onChange={(event) => setFearScore(event.target.value)}
                      disabled={!detail || isSubmitting}
                    />
                    <span className="unit-label">점</span>
                  </div>
                </div>

                <div className="field-card">
                  <p className="field-card__label">분위기 한 줄</p>
                  <textarea
                    className="text-pill"
                    rows="2"
                    maxLength="50"
                    value={moodText}
                    onChange={(event) => setMoodText(event.target.value)}
                    disabled={!detail || isSubmitting}
                  />
                </div>
              </div>

              <div className="floating-actions">
                <button type="submit" className="secondary-button" disabled={!detail || isSubmitting}>
                  우리 학교에 적용
                </button>
              </div>
            </form>
          </main>

          <FooterSchoolButton
            schoolName={selectedSchool}
            onClick={openSchool}
          />
        </div>
      </div>
    </div>
  )
}
