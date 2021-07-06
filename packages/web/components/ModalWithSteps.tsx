import React, { useState } from 'react';

import styled from '@emotion/styled';

import Modal from '../ui/Modal';

interface Step {
  title?: string;
  description?: string;
  ok?: string;
  backable?: boolean;
}

export interface ModalWithStepsProps {
  stepIndex: number;
  step: Step;
  setSteps: (steps: Step[]) => void;
  goForward?: () => void;
  goBack?: () => void;
  setOkEnabled: (enabled: boolean) => void;
  pressOk: () => void;
  close?: () => void;
  setError: (error: string) => void;
  onOkPressed: boolean;
}

const ModalError = styled.p`
  margin: 10px 0 0;
  font-size: 9pt;
  color: red;
`;

const ModalWithSteps =
  (Component: React.ComponentType<ModalWithStepsProps>) =>
  ({ showing, setShowing, ...props }) => {
    const [steps, setSteps] = useState<Step[]>([]);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState<Step>();

    const [okEnabled, setOkEnabled] = useState(false);
    const [onOkPressed, setOnOkPressed] = useState(false);

    const [error, setError] = useState('');

    const [closing, setClosing] = useState(false);

    const goForward = () => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setCurrentStep(steps[currentStepIndex + 1]);
      }

      setError(null);
    };

    const goBack = () => {
      if (currentStepIndex > 0) {
        setCurrentStepIndex(currentStepIndex - 1);
        setCurrentStep(steps[currentStepIndex - 1]);
      }

      setError(null);
    };

    return (
      <Modal
        show={showing}
        closing={closing}
        title={currentStep?.title}
        description={currentStep?.description}
        backable={currentStep?.backable}
        ok={currentStep?.ok}
        onBackPressed={goBack}
        okEnabled={okEnabled}
        hasSteps={true}
        onOkPressed={() => setOnOkPressed(!onOkPressed)}
        requestClose={() => {
          setClosing(true);
          setTimeout(() => {
            setClosing(false);
            setShowing(false);
          }, 300);
        }}
      >
        <Component
          stepIndex={currentStepIndex}
          step={steps[currentStepIndex]}
          setSteps={(steps: Step[]) => {
            setCurrentStep(steps[currentStepIndex]);
            setSteps(steps);
          }}
          setOkEnabled={setOkEnabled}
          onOkPressed={onOkPressed}
          pressOk={() => setOnOkPressed(!onOkPressed)}
          goForward={() => goForward()}
          close={() => setShowing(false)}
          setError={setError}
          {...props}
        />
        {error && <ModalError>{error}</ModalError>}
      </Modal>
    );
  };

export default ModalWithSteps;
