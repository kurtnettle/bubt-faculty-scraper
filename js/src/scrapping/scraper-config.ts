import {Department, DepartmentAlias} from '../constants.js';
import {type ExtractionConfig} from '../types.js';
import {logger} from '../index.js';
import {validateExtractionConfig} from './validator.js';

const departments = [
  // Business
  {
    name: Department.Accounting,
    alias: DepartmentAlias.accounting,
    url: 'https://www.bubt.edu.bd/home/faculty_member/38',
  },
  {
    name: Department.Finance,
    alias: DepartmentAlias.finance,
    url: 'https://www.bubt.edu.bd/home/faculty_member/30',
  },
  {
    name: Department.Management,
    alias: DepartmentAlias.management,
    url: 'https://www.bubt.edu.bd/home/faculty_member/37',
  },
  {
    name: Department.Marketing,
    alias: DepartmentAlias.marketing,
    url: 'https://www.bubt.edu.bd/home/faculty_member/39',
  },
  // Engineering
  //
  // {
  //  after like an hour, I concluded that the infos here obselete,
  //  updated infos are on the cse subdomain
  //  #1 fun fact: some faculty had initials (Mr. Ms.) added before their name :3
  //  #2 fun fact: some faculty's designation was changed to lecturer from asst. prof :3
  //     name: Department['Computer Science and Engineering'],
  //     alias: 'cse',
  // 	   url: 'https://bubt.edu.bd/home/faculty_member/33'
  // },
  // This also maybe obselete. idk yet.
  // {
  //     name: Department['Electrical and Electronic Engineering'],
  //     alias: "eee",
  //     url: "https://bubt.edu.bd/home/faculty_member/34",
  // },
  {
    name: Department.ComputerScienceEngineering,
    alias: DepartmentAlias.cse2,
    url: 'https://cse.bubt.edu.bd/faculty',
    urlSuffix: 'https://cse.bubt.edu.bd/facultydetails',
    facultyListClass: 'div#nav-allfaculty div.single_faculty_wrapper',
    profileUrlClass: 'div.fac_title a',
  },
  {
    name: Department.ElectricalElectronicEngineering,
    alias: DepartmentAlias.eee2,
    url: 'https://eee.bubt.edu.bd/faculty-members',
    facultyListClass: 'div.right-wrap div.faculty_member',
    profileUrlClass: 'div.person_specialization a',
  },
  {
    name: Department.MathematicsStatistics,
    alias: DepartmentAlias.MathStats,
    url: 'https://bubt.edu.bd/home/faculty_member/35',
  },
  {
    name: Department.TextileEngineering,
    alias: DepartmentAlias.textile,
    url: 'https://bubt.edu.bd/home/faculty_member/36',
  },
  {
    name: Department.CivilEngineering,
    alias: DepartmentAlias.civil,
    url: 'https://www.bubt.edu.bd/home/faculty_member/civil-engineering',
  },
  // Social Science
  {
    name: Department.Economics,
    alias: DepartmentAlias.economics,
    url: 'https://bubt.edu.bd/home/faculty_member/economics',
  },
  // Arts & Humanities
  {
    name: Department.English,
    alias: DepartmentAlias.english,
    url: 'https://bubt.edu.bd/home/faculty_member/32',
  },
  // Law
  {
    name: Department.LawJustice,
    alias: DepartmentAlias.LawJustice,
    url: 'https://bubt.edu.bd/home/faculty_member/31',
  },
];

/**
 * Retrieves scraping configurations of departments.
 *
 * @returns Immutable array of extraction configuration objects
 */
export function getScraperConfig(): Map<string, ExtractionConfig> {
  const configs = new Map<string, ExtractionConfig>();

  for (const department of departments) {
    const alias = department.alias;

    const config = {
      alias,
      progName: department.name,
      baseUrl: department.url,
      urlSuffix: department.urlSuffix,
      facultyListClass: department.facultyListClass ?? 'div.faculty-member',
      profileUrlClass: department.profileUrlClass ?? 'a',
    };

    if (validateExtractionConfig(config)) {
      configs.set(alias, config);
    } else {
      logger.warn('Found invalid config.');
    }
  }

  return configs;
}
