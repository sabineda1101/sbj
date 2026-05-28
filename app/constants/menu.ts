export const MENU_DATA = {
  "기초교양": [
    "학문의기초"
  ],
  "핵심교양": [
    "(핵심)INU세미나",
    "(핵심)과학기술",
    "(핵심)사회",
    "(핵심)예술체육",
    "(핵심)외국어",
    "(핵심)인문"
  ],
  "심화교양": [
    "과학기술",
    "사회",
    "예술체육",
    "외국어",
    "인문"
  ]
};

export type CourseCategory = keyof typeof MENU_DATA;
