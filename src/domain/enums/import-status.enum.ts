export enum ImportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const ImportStatusLabels: Record<ImportStatus, string> = {
  [ImportStatus.PENDING]: 'Pending',
  [ImportStatus.PROCESSING]: 'Processing',
  [ImportStatus.COMPLETED]: 'Completed',
  [ImportStatus.FAILED]: 'Failed',
};
