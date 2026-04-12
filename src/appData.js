export const DEFAULT_SCHOOL_NAME = '충북대학교'
const MY_UNIVERSITY_ID_KEY = 'myUniversityId'
const MY_UNIVERSITY_NAME_KEY = 'myUniversityName'

export const regionMarkers = [
  {
    id: 'gyeonggi',
    name: '경기도',
    displayName: '경기도',
    provinceQuery: '경기',
    top: '23%',
    left: '42%',
  },
  {
    id: 'gangwon',
    name: '강원도',
    displayName: '강원도',
    provinceQuery: '강원',
    top: '17%',
    left: '64%',
  },
  {
    id: 'chungbuk',
    name: '충청북도',
    displayName: '충청북도',
    provinceQuery: '충북',
    top: '32%',
    left: '52%',
  },
  {
    id: 'chungnam',
    name: '충청남도',
    displayName: '충청남도',
    provinceQuery: '충남',
    top: '41%',
    left: '30%',
  },
  {
    id: 'gyeongbuk',
    name: '경상북도',
    displayName: '경상북도',
    provinceQuery: '경북',
    top: '42%',
    left: '76%',
  },
  {
    id: 'jeonbuk',
    name: '전라북도',
    displayName: '전라북도',
    provinceQuery: '전북',
    top: '56%',
    left: '40%',
  },
  {
    id: 'gyeongnam',
    name: '경상남도',
    displayName: '경상남도',
    provinceQuery: '경남',
    top: '61%',
    left: '63%',
  },
  {
    id: 'jeonnam',
    name: '전라남도',
    displayName: '전라남도',
    provinceQuery: '전남',
    top: '71%',
    left: '28%',
  },
  {
    id: 'jeju',
    name: '제주특별자치도',
    displayName: '제주특별자치도',
    provinceQuery: '제주',
    top: '90%',
    left: '22%',
  },
]

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getStoredSchool() {
  if (!canUseStorage()) {
    return DEFAULT_SCHOOL_NAME
  }

  return window.localStorage.getItem(MY_UNIVERSITY_NAME_KEY) || DEFAULT_SCHOOL_NAME
}

export function getStoredSchoolId() {
  if (!canUseStorage()) {
    return null
  }

  const value = window.localStorage.getItem(MY_UNIVERSITY_ID_KEY)
  return value ? Number(value) : null
}

export function setStoredSchool(university) {
  if (!canUseStorage()) {
    return
  }

  if (typeof university === 'string') {
    window.localStorage.setItem(MY_UNIVERSITY_NAME_KEY, university)
    return
  }

  if (university?.id) {
    window.localStorage.setItem(MY_UNIVERSITY_ID_KEY, String(university.id))
  }

  if (university?.name) {
    window.localStorage.setItem(MY_UNIVERSITY_NAME_KEY, university.name)
  }
}

export function hasContributed(universityId) {
  if (!canUseStorage() || !universityId) {
    return false
  }

  return window.localStorage.getItem(`contributed_${universityId}`) === 'true'
}

export function markContributed(universityId) {
  if (!canUseStorage() || !universityId) {
    return
  }

  window.localStorage.setItem(`contributed_${universityId}`, 'true')
}

export function getRegionById(regionId) {
  return regionMarkers.find((region) => region.id === regionId) || regionMarkers[0]
}

export function deriveMood(fearScore) {
  if (fearScore >= 88) return '아 진짜 망했다'
  if (fearScore >= 80) return '숨 참고 버티는 중'
  if (fearScore >= 72) return '그래도 시작은 함'
  return '아직은 해볼 만함'
}

export function getRegionByProvince(province) {
  if (!province) {
    return getRegionById('chungbuk')
  }

  return (
    regionMarkers.find((region) => province.includes(region.provinceQuery) || region.displayName.includes(province)) ||
    getRegionById('chungbuk')
  )
}
