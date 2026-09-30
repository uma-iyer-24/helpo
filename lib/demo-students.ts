export type DemoStudentId =
  | "ananya"
  | "sana"
  | "priya"
  | "meera"
  | "divya"
  | "kavya"
  | "ishita";

export type DemoStudent = {
  id: DemoStudentId;
  name: string;
  roll: string;
  programme: string;
  year: string;
};

export const DEMO_STUDENTS: Record<DemoStudentId, DemoStudent> = {
  ananya: {
    id: "ananya",
    name: "Ananya Rao",
    roll: "24251A0568",
    programme: "B.Tech CSE",
    year: "II year",
  },
  sana: {
    id: "sana",
    name: "Sana Qureshi",
    roll: "24251A0582",
    programme: "B.Tech CSE",
    year: "II year",
  },
  priya: {
    id: "priya",
    name: "Priya Menon",
    roll: "24251A0611",
    programme: "B.Tech IT",
    year: "III year",
  },
  meera: {
    id: "meera",
    name: "Meera Reddy",
    roll: "24251A0442",
    programme: "B.Tech ECE",
    year: "II year",
  },
  divya: {
    id: "divya",
    name: "Divya Krishnan",
    roll: "24251A0520",
    programme: "B.Tech CSE",
    year: "IV year",
  },
  kavya: {
    id: "kavya",
    name: "Kavya Srinivas",
    roll: "24251A0499",
    programme: "B.Tech ETE",
    year: "III year",
  },
  ishita: {
    id: "ishita",
    name: "Ishita Das",
    roll: "24251A0633",
    programme: "B.Tech CSE",
    year: "I year",
  },
};

export function demoStudent(id: string): DemoStudent {
  return DEMO_STUDENTS[id as DemoStudentId] ?? DEMO_STUDENTS.ananya;
}
