import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DEFAULT_SCHOOL_NAME, getStoredSchool, setStoredSchool } from './appData'
import { LogoHeader } from './uiParts'

export default function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedUniversity = location.state?.school || null
  const schoolName = selectedUniversity?.name || location.state?.schoolName || getStoredSchool() || DEFAULT_SCHOOL_NAME

  useEffect(() => {
    if (!schoolName) {
      navigate('/start', { replace: true })
    }
  }, [navigate, schoolName])

  const handleBack = () => {
    navigate('/start', { state: { school: selectedUniversity, schoolName } })
  }

  const handleEnter = () => {
    if (selectedUniversity) {
      setStoredSchool(selectedUniversity)
    } else {
      setStoredSchool(schoolName)
    }

    navigate('/main')
  }

  return (
    <div className="screen">
      <div className="phone-frame phone-frame--brand">
        <section className="start-layout">
          <LogoHeader />

          <main className="confirm-card stack stack--md">
            <p className="confirm-card__title">선택한 학교를 마지막으로 확인해주세요.</p>
            <div className="confirm-card__school">{schoolName}</div>
            <div className="confirm-card__warning">
              소속 대학교는 다시 바꿀 수 없습니다!
              <br />
              한 번 더 확인해 주세요.
            </div>

            <div className="confirm-card__actions">
              <button type="button" className="accent-button" onClick={handleBack}>
                다시선택
              </button>
              <button type="button" className="primary-button" onClick={handleEnter}>
                입장하기
              </button>
            </div>
          </main>
        </section>
      </div>
    </div>
  )
}
