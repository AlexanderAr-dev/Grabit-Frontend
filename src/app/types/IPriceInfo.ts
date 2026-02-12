type priceUnitVariant = 'час' | 'день' | 'неделя';

export interface IPriceInfo {
  payment: number;
  priceUnit: priceUnitVariant;
}
