import { CreateListingData } from './CreateListing';

export interface StepProps {
  data: CreateListingData;
  updateData: (values: Partial<CreateListingData>) => void;
  next?: () => void;
  prev?: () => void;
}
