export interface Division {
  id: number;
  code?: string | null;
  name: string;
  hasAccess?: boolean;
}

/** Returned by GET /divisions — includes HOD info for each division */
export interface DivisionWithHOD {
  id: number;
  userId?: string | null;
  rcno: number;
  fullName: string;
  divisionId: number;
  division: string;
  divisionCode: string | null;
}
