export interface Space {
  id: number;
  name: string;
  capacity: number;
  location: string;
  type: string;
  // Clase 7: id del usuario (COORDINATOR) dueño del espacio. null = sin dueño: solo el ADMIN lo edita.
  ownerId: number | null;
}

export const spaces: Space[] = [
  { id: 1, name: 'Auditorio Principal', capacity: 200, location: 'Bloque A', type: 'auditorio', ownerId: 3 },
  { id: 2, name: 'Laboratorio de Sistemas 1', capacity: 30, location: 'Bloque B', type: 'laboratorio', ownerId: 2 },
  { id: 3, name: 'Salon 204', capacity: 40, location: 'Bloque C', type: 'salon', ownerId: 3 },
  { id: 4, name: 'Cancha Multiple', capacity: 60, location: 'Zona deportiva', type: 'cancha', ownerId: null }
];
