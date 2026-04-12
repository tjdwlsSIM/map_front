import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import iconImage from './assets/icon.png'
import { getStoredSchoolId, getStoredSchool, hasContributed } from './appData'
import { createUniversityVibe, getUniversityById, getUniversityStats, getUniversityVibes } from './services/api'
import { getSchoolLogoSrc } from './schoolLogoMap'
import { FooterSchoolButton, LogoHeader } from './uiParts'

export default function SchoolDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { universityId = '' } = useParams()
  const parsedUniversityId = useMemo(() => Number(universityId), [universityId])
  const selectedSchool = getStoredSchool()
  const isSubmitted = Boolean(location.state?.submitted)
  const myUniversityId = getStoredSchoolId()
  const [detail, setDetail] = useState(null)
  const [vibes, setVibes] = useState([])
  const [vibeText, setVibeText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingVibe, setIsSubmittingVibe] = useState(false)
  const [error, setError] = useState('')
  const [vibeError, setVibeError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDetail = async () => {
      setIsLoading(true)
      setError('')
      setVibeError('')

      try {
        const [university, stats] = await Promise.all([
          getUniversityById(parsedUniversityId),
          getUniversityStats(parsedUniversityId),
        ])

        if (!isMounted) {
          return
        }

        const normalizedDetail = {
          id: university.id,
          schoolName: university.name,
          province: university.province,
          currentMood: university.currentMood || '',
          participants: Number(stats.contributionCount ?? 0),
          progress: Number(stats.avgProgress ?? 0),
          sleepHours: Number(stats.avgSleepHours ?? 0),
          cramCount: Number(stats.crammerCount ?? 0),
          fearScore: Number(stats.avgExamFear ?? 0),
          doomScore: Number(stats.doomScore ?? 0),
        }

        setDetail(normalizedDetail)
        setVibes([])

        try {
          const vibeList = await getUniversityVibes(parsedUniversityId)
          if (isMounted) {
            setVibes(vibeList)
          }
        } catch (requestError) {
          if (isMounted) {
            setVibeError('한마디 목록은 지금 불러오지 못하고 있어요.')
          }
        }
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

  const openMySchool = () => {
    if (!myUniversityId) {
      return
    }

    navigate(`/school/${myUniversityId}`)
  }

  const handleCreateVibe = async () => {
    const nextText = vibeText.trim()

    if (!nextText || !detail) {
      return
    }

    setIsSubmittingVibe(true)
    setVibeError('')

    try {
      const created = await createUniversityVibe(detail.id, nextText)
      setVibes((current) => [created, ...current].slice(0, 3))
      setVibeText('')
    } catch (requestError) {
      setVibeError(requestError.message)
    } finally {
      setIsSubmittingVibe(false)
    }
  }

  const canContribute = Boolean(detail && myUniversityId === detail.id)
  const isContributionDisabled = !detail || hasContributed(detail.id)
  const currentMoodText = detail?.currentMood || '아직 등록된 분위기가 없어요.'
  const schoolLogoSrc = getSchoolLogoSrc(detail?.schoolName) || iconImage

  return (
    <div className="screen">
      <div className="phone-frame">
        <div className="page-shell">
          <LogoHeader compact />

          <main className="page-main">
            <h2 className="detail-title">
              {detail ? `여기는 "${detail.schoolName}" 입니다.` : '학교 정보를 불러오는 중입니다.'}
            </h2>

            <section className="detail-card stack stack--md">
              {isSubmitted && <p className="detail-note">내 상태가 반영됐어요. 고마워요!</p>}
              {isLoading && <p className="detail-note">상세 정보를 불러오는 중이에요.</p>}
              {error && <p className="detail-note">{error}</p>}

              <div className="detail-hero">
                <div className="detail-hero__badge">
                  <img src={schoolLogoSrc} alt="" />
                </div>
              </div>

              <div className="detail-mood">
                <span>실시간 분위기</span>
                <span>{`"${currentMoodText}"`}</span>
              </div>

              {detail && (
                <div className="detail-stats">
                  <div className="stat-chip">
                    <span>참여 인원</span>
                    <span className="stat-chip__value">{detail.participants}</span>
                  </div>
                  <div className="stat-chip">
                    <span>현재 평균 진도율</span>
                    <span>{`${detail.progress} %`}</span>
                  </div>
                  <div className="stat-chip">
                    <span>현재 평균 수면시간</span>
                    <span>{`${detail.sleepHours} 시간`}</span>
                  </div>
                  <div className="stat-chip">
                    <span>현재 벼락치기 인원</span>
                    <span className="stat-chip__value">{detail.cramCount}</span>
                  </div>
                  <div className="stat-chip">
                    <span>평균 시험 공포지수</span>
                    <span>{`${detail.fearScore} 점`}</span>
                  </div>
                  <div className="stat-chip">
                    <span>망함지수</span>
                    <span>{detail.doomScore}</span>
                  </div>
                </div>
              )}

              <div className="field-card">
                <p className="field-card__label">분위기 한 줄</p>
                {vibeError && <p className="detail-note">{vibeError}</p>}
                <textarea
                  className="text-pill"
                  rows="2"
                  maxLength="50"
                  value={vibeText}
                  onChange={(event) => setVibeText(event.target.value)}
                  placeholder="50자 이내로 남겨주세요"
                />
                <div className="floating-actions">
                  <button
                    type="button"
                    className="accent-button"
                    disabled={!detail || isSubmittingVibe || !vibeText.trim()}
                    onClick={handleCreateVibe}
                  >
                    분위기 등록
                  </button>
                </div>
              </div>

              <div className="field-card">
                <p className="field-card__label">최근 한마디</p>
                <div className="vibe-list">
                  {vibes.slice(0, 3).map((vibe) => (
                    <div key={vibe.id} className="vibe-item">
                      {vibe.text}
                    </div>
                  ))}
                  {!vibes.length && !vibeError && <div className="vibe-item">아직 등록된 한마디가 없어요.</div>}
                  {!vibes.length && vibeError && <div className="vibe-item">한마디 기능은 잠시 후 다시 시도해 주세요.</div>}
                </div>
              </div>

              <div className="detail-actions">
                <button type="button" className="primary-button" onClick={() => navigate(-1)}>
                  뒤로가기
                </button>
                {canContribute && (
                  <button
                    type="button"
                    className={`secondary-button ${isContributionDisabled ? 'secondary-button--complete' : ''}`}
                    disabled={isContributionDisabled}
                    onClick={() => navigate(`/contribute/${detail.id}`)}
                  >
                    {isContributionDisabled ? '기여 완료' : '나도 기여하기'}
                  </button>
                )}
              </div>
              {canContribute && isContributionDisabled && (
                <p className="detail-note">이미 기여를 완료한 학교예요.</p>
              )}
            </section>
          </main>

          <FooterSchoolButton schoolName={selectedSchool} onClick={openMySchool} />
        </div>
      </div>
    </div>
  )
}
