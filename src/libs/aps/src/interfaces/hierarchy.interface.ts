export interface CoveringEmployee {
  rcno: number;
  full_name: string;
  post: string;
  division: string;
  email: string;
  coveringFrom: string;
  coveringUntil: string;
}

export interface HierarchyEmployee {
  rcno: number;
  full_name: string;
  doj: string;
  post: string;
  division: string;
  email: string;
  coveringEmployee?: CoveringEmployee;
}

export interface StaffHierarchy {
  employee: HierarchyEmployee;
  reportsTo: HierarchyEmployee | null;
  hod: HierarchyEmployee | null;
}

export interface GetHierarchyParams {
  email?: string;
  rcno?: string;
  replaceCovering?: string;
}
