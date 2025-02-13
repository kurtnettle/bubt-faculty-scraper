import {Department} from '../../constants.js';

export function getDeptId(deptName: string): Department | undefined {
  deptName = deptName.toLowerCase();

  const textMapping = {
    computer: Department.ComputerScienceEngineering,
    electronic: Department.ElectricalElectronicEngineering,
    mathematics: Department.MathematicsStatistics,
    textile: Department.TextileEngineering,
    civil: Department.CivilEngineering,
    accounting: Department.Accounting,
    finance: Department.Finance,
    management: Department.Management,
    marketing: Department.Marketing,
    economics: Department.Economics,
    english: Department.English,
    justice: Department.LawJustice,
  };

  for (const [key, id] of Object.entries(textMapping)) {
    if (deptName.includes(key)) {
      return id;
    }
  }

  return undefined;
}
