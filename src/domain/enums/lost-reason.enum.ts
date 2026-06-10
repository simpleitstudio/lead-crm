export enum LostReason {
  NO_BUDGET = 'NO_BUDGET',
  NO_RESPONSE = 'NO_RESPONSE',
  NOT_INTERESTED = 'NOT_INTERESTED',
  ALREADY_HAS_VENDOR = 'ALREADY_HAS_VENDOR',
  BAD_FIT = 'BAD_FIT',
  OTHER = 'OTHER',
}

export const LostReasonLabels: Record<LostReason, string> = {
  [LostReason.NO_BUDGET]: 'No Budget',
  [LostReason.NO_RESPONSE]: 'No Response',
  [LostReason.NOT_INTERESTED]: 'Not Interested',
  [LostReason.ALREADY_HAS_VENDOR]: 'Already Has Vendor',
  [LostReason.BAD_FIT]: 'Bad Fit',
  [LostReason.OTHER]: 'Other',
};
