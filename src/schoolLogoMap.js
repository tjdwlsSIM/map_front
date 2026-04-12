import schoolLogos from './schoolLogos.json'

const schoolLogoMap = new Map(schoolLogos.map((item) => [item.schoolName, item.src]))

const schoolNameAliases = {
  고려대: '고려대(서울)',
  상명대: '상명대(서울)',
}

export function getSchoolLogoSrc(schoolName) {
  if (!schoolName) {
    return null
  }

  const exactMatch = schoolLogoMap.get(schoolName)
  if (exactMatch) {
    return exactMatch
  }

  const aliasMatch = schoolLogoMap.get(schoolNameAliases[schoolName])
  if (aliasMatch) {
    return aliasMatch
  }

  return null
}

export function getUnmatchedSchoolNames(schools) {
  return schools
    .map((school) => school.name)
    .filter((schoolName, index, names) => names.indexOf(schoolName) === index && !getSchoolLogoSrc(schoolName))
    .sort((left, right) => left.localeCompare(right, 'ko'))
}
