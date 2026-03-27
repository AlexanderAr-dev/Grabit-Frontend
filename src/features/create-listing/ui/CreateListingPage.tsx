import { useState } from 'react';
import { Container } from '@mantine/core';

import { CreateListingData } from '../model/types/CreateListing';
import { CreateListingStep } from '../model/types/CreateListingStep';
import BookingRangeStep from '../steps/BookingRangeStep';
import CategoryStep from '../steps/CategoryStep';
import TypeStep from '../steps/TypeStep';
import DetailsStep from '../steps/DetailsStep';

const CreateListingPage = () => {
  const [step, setStep] = useState<CreateListingStep>(CreateListingStep.TYPE);
  const [data, setData] = useState<CreateListingData>({ type: 'item_rent' });

  const updateData = (values: Partial<CreateListingData>) => {
    setData(prev => ({ ...prev, ...values }));
  };

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const renderStep = () => {
    switch (step) {
      case CreateListingStep.TYPE:
        return <TypeStep data={data} updateData={updateData} next={next} />;
      case CreateListingStep.CATEGORY:
        return (
          <CategoryStep data={data} updateData={updateData} next={next} prev={prev} />
        );
      case CreateListingStep.DETAILS:
        return (
          <DetailsStep data={data} updateData={updateData} next={next} prev={prev} />
        );
      case CreateListingStep.BOOKINGRANGE:
        return (
          <BookingRangeStep data={data} updateData={updateData} prev={prev} />
        );
      default:
        return null;
    }
  };

  return <Container size="sm">{renderStep()}</Container>;
};

export default CreateListingPage;
