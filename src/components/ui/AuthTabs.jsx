'use client';
import { memo } from 'react';
import { AnimatedForm } from './AnimatedForm';


const AuthTabs = memo(function AuthTabs({
  formFields,
  goTo,
  handleSubmit,
}) {
  return (
    <div className="w-full flex flex-col justify-center">
      <AnimatedForm
        {...formFields}
        fieldPerRow={1}
        onSubmit={handleSubmit}
        goTo={goTo}
        googleLogin="Login with Google"
      />
    </div>
  );
});

export { AuthTabs };
