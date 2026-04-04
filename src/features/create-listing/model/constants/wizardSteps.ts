import { ComponentType } from 'react';

import AvailabilityStep from '../../steps/AvailabilityStep';
import DayScheduleStep from '../../steps/DayScheduleStep';
import DetailsStep from '../../steps/DetailsStep';
import LocationStep from '../../steps/LocationStep';
import MediaStep from '../../steps/MediaStep';
import WeekDaysStep from '../../steps/WeekDaysStep';
import { ListingType } from '../types/CreateListing';
import { StepProps } from '../types/StepProps';

export type StepComponent = ComponentType<StepProps>;

const commonSteps: StepComponent[] = [
  DetailsStep,
  MediaStep,
  LocationStep,
  AvailabilityStep,
  WeekDaysStep,
  DayScheduleStep,
];

export const wizardSteps: Record<
  ListingType,
  StepComponent[]
> = {
  item_rent: commonSteps,
  service: commonSteps,
  space: commonSteps,
};
