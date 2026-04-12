import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import iconImage from './assets/icon.png'
import mapImage from './assets/map.png'
import { getStoredSchool, getStoredSchoolId, regionMarkers } from './appData'
import { getDoomRanking } from './services/api'
import { getSchoolLogoSrc } from './schoolLogoMap'
import { FooterSchoolButton, LogoHeader } from './uiParts'

export default function MainPage() {
  const navigate = useNavigate()
  const selectedSchool = getStoredSchool()
  const selectedSchoolId = getStoredSchoolId()
  const [rankingData, setRankingData] = useState([])
  const [rankingError, setRankingError] = useState('')

  const handleRegionClick = (regionId) => {
    navigate(`/region/${regionId}`)
  }

  const handleSchoolClick = (university) => {
    navigate(`/school/${university.id}`)
  }

  useEffect(() => {
    let isMounted = true

    const loadRanking = async () => {
      try {
        const ranking = await getDoomRanking(3)
        if (isMounted) {
          setRankingData(ranking)
          setRankingError('')
        }
      } catch (error) {
        if (isMounted) {
          setRankingError(error.message)
        }
      }
    }

    loadRanking()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="screen">
      <div className="phone-frame">
        <div className="page-shell">
          <LogoHeader compact />

          <main className="page-main">
            <p className="page-copy">실시간으로 전국 대학교의 망함 현황을 확인해보세요</p>

            <section className="map-stage">
              <img src={mapImage} alt="전국 지도" className="map-stage__image" />

              {regionMarkers.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className="map-marker"
                  style={{ top: region.top, left: region.left }}
                  onClick={() => handleRegionClick(region.id)}
                  aria-label={`${region.name} 지역 보기`}
                >
                  <img src={iconImage} alt="" />
                </button>
              ))}

              <div className="ranking-panel">
                <div className="ranking-panel__card">
                  <div className="ranking-panel__title">망함지수 랭킹</div>

                  <div className="ranking-panel__list">
                    {rankingData.map((school, index) => (
                      <button
                        key={school.universityId}
                        type="button"
                        className="ranking-item ranking-item--button"
                        onClick={() =>
                          handleSchoolClick({
                            id: school.universityId,
                            name: school.universityName,
                          })
                        }
                      >
                        <span className={`ranking-item__medal ranking-item__medal--${index + 1}`}>
                          {index + 1}
                        </span>
                        <img
                          src={getSchoolLogoSrc(school.universityName) || iconImage}
                          alt=""
                          className="school-logo school-logo--sm"
                        />
                        <span className="ranking-item__name">{school.universityName}</span>
                      </button>
                    ))}

                    {!rankingData.length && !rankingError && (
                      <div className="ranking-item ranking-item--static">랭킹을 불러오는 중...</div>
                    )}
                    {rankingError && <div className="ranking-item ranking-item--static">{rankingError}</div>}
                  </div>
                </div>
              </div>
            </section>
          </main>

          <FooterSchoolButton
            schoolName={selectedSchool}
            onClick={() => {
              if (selectedSchoolId) {
                handleSchoolClick({ id: selectedSchoolId, name: selectedSchool })
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
