export interface Requester {
  id: number;
  name: string;
  email: string;
}

export const requesters: Requester[] = [
  { id: 1, name: 'Williams Henao', email: 'williams@universidad.edu' },
  { id: 2, name: 'Laura Gomez', email: 'laura@universidad.edu' },
  { id: 3, name: 'Carlos Perez', email: 'carlos@universidad.edu' }
];
