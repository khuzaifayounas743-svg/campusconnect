export type University = {
  name: string
  city: string
  shortName: string
}

export const UNIVERSITIES: University[] = [
  // COMSATS (multiple campuses)
  { name: 'COMSATS University - Islamabad', shortName: 'CUI Islamabad', city: 'Islamabad' },
  { name: 'COMSATS University - Lahore', shortName: 'CUI Lahore', city: 'Lahore' },
  { name: 'COMSATS University - Abbottabad', shortName: 'CUI Abbottabad', city: 'Abbottabad' },
  { name: 'COMSATS University - Wah', shortName: 'CUI Wah', city: 'Wah Cantt' },
  { name: 'COMSATS University - Attock', shortName: 'CUI Attock', city: 'Attock' },
  { name: 'COMSATS University - Sahiwal', shortName: 'CUI Sahiwal', city: 'Sahiwal' },
  { name: 'COMSATS University - Vehari', shortName: 'CUI Vehari', city: 'Vehari' },

  // NUST
  { name: 'National University of Sciences and Technology (NUST)', shortName: 'NUST', city: 'Islamabad' },
  { name: 'NUST - Karachi Campus', shortName: 'NUST Karachi', city: 'Karachi' },
  { name: 'NUST - Quetta Campus', shortName: 'NUST Quetta', city: 'Quetta' },
  { name: 'NUST - Rawalpindi Campus', shortName: 'NUST Rawalpindi', city: 'Rawalpindi' },

  // GIKI
  { name: 'Ghulam Ishaq Khan Institute (GIKI)', shortName: 'GIKI', city: 'Topi' },

  // FAST
  { name: 'FAST National University - Islamabad', shortName: 'FAST Islamabad', city: 'Islamabad' },
  { name: 'FAST National University - Lahore', shortName: 'FAST Lahore', city: 'Lahore' },
  { name: 'FAST National University - Karachi', shortName: 'FAST Karachi', city: 'Karachi' },
  { name: 'FAST National University - Peshawar', shortName: 'FAST Peshawar', city: 'Peshawar' },
  { name: 'FAST National University - Multan', shortName: 'FAST Multan', city: 'Multan' },
  { name: 'FAST National University - Faisalabad', shortName: 'FAST Faisalabad', city: 'Faisalabad' },

  // LUMS
  { name: 'Lahore University of Management Sciences (LUMS)', shortName: 'LUMS', city: 'Lahore' },

  // UET
  { name: 'University of Engineering and Technology - Lahore', shortName: 'UET Lahore', city: 'Lahore' },
  { name: 'UET Taxila', shortName: 'UET Taxila', city: 'Taxila' },
  { name: 'UET Peshawar', shortName: 'UET Peshawar', city: 'Peshawar' },

  // Others
  { name: 'Punjab University', shortName: 'PU', city: 'Lahore' },
  { name: 'Quaid-i-Azam University', shortName: 'QAU', city: 'Islamabad' },
  { name: 'Aga Khan University', shortName: 'AKU', city: 'Karachi' },
  { name: 'Karachi University', shortName: 'KU', city: 'Karachi' },
  { name: 'IBA Karachi', shortName: 'IBA', city: 'Karachi' },
  { name: 'Habib University', shortName: 'HU', city: 'Karachi' },
  { name: 'SZABIST University', shortName: 'SZABIST', city: 'Karachi' },
  { name: 'Bahria University', shortName: 'Bahria', city: 'Islamabad' },
  { name: 'Air University', shortName: 'AU', city: 'Islamabad' },
  { name: 'Riphah International University', shortName: 'Riphah', city: 'Islamabad' },
  { name: 'International Islamic University', shortName: 'IIUI', city: 'Islamabad' },
  { name: 'PMAS Arid Agriculture University', shortName: 'UAAR', city: 'Rawalpindi' },
  { name: 'Government College University - Lahore', shortName: 'GCU Lahore', city: 'Lahore' },
  { name: 'Government College University - Faisalabad', shortName: 'GCUF', city: 'Faisalabad' },
  { name: 'University of Agriculture Faisalabad', shortName: 'UAF', city: 'Faisalabad' },
  { name: 'King Edward Medical University', shortName: 'KEMU', city: 'Lahore' },
  { name: 'Fatima Jinnah Medical University', shortName: 'FJMU', city: 'Lahore' },
  { name: 'Allama Iqbal Medical College', shortName: 'AIMC', city: 'Lahore' },
  { name: 'Nishtar Medical University', shortName: 'NMU', city: 'Multan' },
  { name: 'Bahauddin Zakariya University', shortName: 'BZU', city: 'Multan' },
  { name: 'PUCIT', shortName: 'PUCIT', city: 'Lahore' },
  { name: 'UMT Lahore', shortName: 'UMT', city: 'Lahore' },
  { name: 'UCP Lahore', shortName: 'UCP', city: 'Lahore' },
  { name: 'Lahore University of Biological Sciences', shortName: 'LUBS', city: 'Lahore' },
  { name: 'University of Sargodha', shortName: 'UOS', city: 'Sargodha' },
  { name: 'University of Gujrat', shortName: 'UOG', city: 'Gujrat' },
  { name: 'COMSATS Abbottabad', shortName: 'CUI Abbottabad', city: 'Abbottabad' },
  { name: 'Hazara University', shortName: 'HU Mansehra', city: 'Mansehra' },
  { name: 'University of Peshawar', shortName: 'UOP', city: 'Peshawar' },
  { name: 'Balochistan University', shortName: 'BUITEMS', city: 'Quetta' },
  { name: 'Sindh University', shortName: 'SU', city: 'Jamshoro' },
  { name: 'Mehran University', shortName: 'MUET', city: 'Jamshoro' },
  { name: 'NED University', shortName: 'NED', city: 'Karachi' },
]

export const PROGRAMS = [
  'BS Computer Science',
  'BS Software Engineering',
  'BS Electrical Engineering',
  'BS Mechanical Engineering',
  'BS Civil Engineering',
  'BS Business Administration',
  'BS Accounting & Finance',
  'BS Economics',
  'BS Mathematics',
  'BS Physics',
  'BS Chemistry',
  'BS Biology',
  'BS Biotechnology',
  'BS Psychology',
  'BS Mass Communication',
  'BS Architecture',
  'BS Data Science',
  'BS Artificial Intelligence',
  'BS Cyber Security',
  'MS Computer Science',
  'MS Software Engineering',
  'MS Business Administration',
  'MS Data Science',
  'MBA',
  'PhD',
  'Other',
]

export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
  'Graduated',
]

export const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Economics',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Psychology',
  'Mass Communication',
  'Architecture',
  'Medicine',
  'Law',
  'Other',
]