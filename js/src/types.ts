import {type DepartmentAlias, type Department} from './constants.js';

export type FacultyInfo = {
  department: Department | undefined;
  fcode: string;
  name: string;
  designation: string;
  telephone: ContactInfo | string;
  email: ContactInfo | string;
  building: string;
  room: string;
  status: string;
  profileUrl: string;
  [key: string]: string | ContactInfo | undefined;
  // https://stackoverflow.com/questions/58458308/what-does-a-typescript-index-signature-actually-mean
};

export type ExtractionConfig = {
  alias: DepartmentAlias;
  progName: Department;
  baseUrl: string;
  urlSuffix?: string;
  facultyListClass?: string;
  profileUrlClass?: string;
};

export type ContactCategory = 'personal' | 'office' | 'other';
export type ContactInfo = Partial<Record<ContactCategory, string | string[]>>;
