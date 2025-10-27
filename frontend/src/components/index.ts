// Forms
export { default as PartidaBasicInfo, SmartSelect } from '../forms/PartidaBasicInfo';

// Tables
export { default as ResourceTable, SummaryCard } from '../tables/ResourceTable';
export { default as ModernTable } from '../tables/ModernTable';
export { default as TableComponent } from '../tables/TableComponent';

// Notifications
export { ToastProvider, useToast, useToastHelpers } from '../notifications/ToastProvider';

// Animations
export { 
  FadeIn, 
  SlideIn, 
  ScaleIn, 
  StaggerContainer, 
  StaggerItem, 
  PageTransition, 
  LoadingSpinner, 
  Pulse 
} from '../animations/MotionComponents';

// Modern UI Components
export {
  ModernCard,
  StatsGrid,
  ModernButton,
  ProgressBar,
  LoadingSpinner as ModernLoadingSpinner,
  EmptyState
} from '../ui/ModernComponents';

// Testing
export { default as TestingDashboard } from '../testing/TestingDashboard';

// Modals
export { default as AddClientModal } from './AddClientModal';
export { default as AddEspecialidadModal } from './AddEspecialidadModal';
export { default as AddIncrementModal } from './AddIncrementModal';
export { default as AddPlanillaModal } from './AddPlanillaModal';
export { default as AddUnidadModal } from './AddUnidadModal';
export { default as ConfirmModal } from './ConfirmModal';