export interface ItemObra {
  id: string;
  id_obra: string;
  id_item_padre: string | null;
  codigo: string;
  descripcion_tarea: string;
  especialidad: string;
  id_especialidad?: number;
  unidad: string;
  id_unidad?: number;
  cantidad: number;
  precio_unitario: number;
  nivel: number;
  expanded: boolean;
}

export interface Obra {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion?: string;
}

export interface ObraFormData {
  nombre: string;
  ubicacion: string;
  descripcion: string;
}

export interface ObraFormProps {
  formData: ObraFormData;
  setFormData: (data: ObraFormData) => void;
  editingObra: any;
  setEditingObra: (obra: any) => void;
  handleAddObra: () => void;
  handleUpdateObra: () => void;
}