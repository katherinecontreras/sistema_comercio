export type AtributoTipo = 'texto' | 'numerico' | 'entero';

export interface AtributoBase {
  id: string; // identificador único (ej: 'descripcion' o generated id)
  nombre: string; // label visible
  tipo: AtributoTipo;
  requerido?: boolean;
  base?: boolean; // si viene del core y no puede eliminarse
}

export interface AtributoSeleccionable extends AtributoBase {
  selected?: boolean;
}
