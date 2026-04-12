import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getRegionById,
  getStoredSchool,
  getStoredSchoolId,
} from './appData'
import { getUniversitiesByProvince } from './services/api'
import iconImage from './assets/icon.png'
import { getSchoolLogoSrc } from './schoolLogoMap'
import { FooterSchoolButton, LogoHeader } from './uiParts'

export default function RegionPage() {
  const navigate = useNavigate()
  const { regionId = 'chungcheong' } = useParams()
  const region = getRegionById(regionId)
  const selectedSchool = getStoredSchool()
  const selectedSchoolId = getStoredSchoolId()
  const [schools, setSchools] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadSchools = async () => {
      setIsLoading(true)
      setError('')

      try {
        const results = await getUniversitiesByProvince(region.provinceQuery)
        if (isMounted) {
          setSchools(results)
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message)
          setSchools([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSchools()

    return () => {
      isMounted = false
    }
  }, [region.provinceQuery])

  const openSchool = (school) => {
    navigate(`/school/${school.id}`)
  }

  return (
    <div className="screen">
      <div className="phone-frame">
        <div className="page-shell">
          <LogoHeader compact />

          <main className="page-main">
            <p className="page-copy">실시간으로 전국 대학교의 망함 현황을<br />확인해보세요</p>

            <section className="region-stage">
              <div className="region-card stack stack--md">
                <div className="region-heading">{region.displayName || region.name}</div>

                <div className="region-preview">
                  <div className="region-school-list">
                    {schools.map((school) => (
                      <button
                        key={school.id}
                        type="button"
                        className="region-school-button"
                        onClick={() => openSchool(school)}
                      >
                        <span className="school-option">
                          <img src={getSchoolLogoSrc(school.name) || iconImage} alt="" className="school-logo" />
                          <span>{school.name}</span>
                        </span>
                      </button>
                    ))}
                    {isLoading && <div className="region-empty">학교 목록을 불러오는 중이에요...</div>}
                    {!isLoading && !schools.length && !error && (
                      <div className="region-empty">아직 연결된 학교가 없어요.</div>
                    )}
                    {error && <div className="region-empty">{error}</div>}
                  </div>
                </div>

                <div className="floating-actions">
                  <button type="button" className="primary-button region-back-button" onClick={() => navigate('/main')}>
                    뒤로가기
                  </button>
                </div>
              </div>
            </section>
          </main>

          <FooterSchoolButton
            schoolName={selectedSchool}
            onClick={() => {
              if (selectedSchoolId) {
                openSchool({ id: selectedSchoolId })
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
