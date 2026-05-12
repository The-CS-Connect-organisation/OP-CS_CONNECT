'use client';
import { memo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { BoxReveal } from './BoxReveal';
import { MagneticInput } from './MagneticInput';
import { cn } from '@/lib/utils';


const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);


const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields = [],
  submitButton,
  textVariantButton,
  errorField,
  fieldPerRow = 1,
  onSubmit,
  googleLogin,
  goTo,
}) {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleVisibility = () => setVisible(!visible);

  const validateForm = (event) => {
    const currentErrors = {};
    fields.forEach((field) => {
      const value = event.target[field.label]?.value;
      if (field.required && !value) {
        currentErrors[field.label] = `${field.label} is required`;
      }
      if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        currentErrors[field.label] = 'Invalid email address';
      }
      if (field.type === 'password' && value && value.length < 6) {
        currentErrors[field.label] = 'Password must be at least 6 characters';
      }
    });
    return currentErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formErrors = validateForm(event);
    if (Object.keys(formErrors).length === 0) {
      onSubmit(event);
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className="max-md:w-full flex flex-col gap-4 w-full mx-auto">
      <BoxReveal boxColor="#5046e6" duration={0.3}>
        <h2 className="font-bold text-3xl text-neutral-800 dark:text-neutral-200">
          {header}
        </h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor="#5046e6" duration={0.3} className="pb-2">
          <p className="text-neutral-600 text-sm max-w-sm dark:text-neutral-300">
            {subHeader}
          </p>
        </BoxReveal>
      )}

      {googleLogin && (
        <>
          <BoxReveal boxColor="#5046e6" duration={0.3} overflow="visible" width="unset">
            <button
              className="g-button group/btn bg-transparent w-full rounded-md border h-10 font-medium outline-hidden hover:cursor-pointer"
              type="button"
              onClick={() => console.log('Google login clicked')}
            >
              <span className="flex items-center justify-center w-full h-full gap-3">
                <img
                  src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                  width={26}
                  height={26}
                  alt="Google Icon"
                />
                {googleLogin}
              </span>
              <BottomGradient />
            </button>
          </BoxReveal>

          <BoxReveal boxColor="#5046e6" duration={0.3} width="100%">
            <section className="flex items-center gap-4">
              <hr className="flex-1 border-1 border-dashed border-neutral-300 dark:border-neutral-700" />
              <p className="text-neutral-700 text-sm dark:text-neutral-300">or</p>
              <hr className="flex-1 border-1 border-dashed border-neutral-300 dark:border-neutral-700" />
            </section>
          </BoxReveal>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <section className="grid grid-cols-1 mb-4">
          {fields.map((field) => (
            <section key={field.label} className="flex flex-col gap-2 mb-3">
              <BoxReveal boxColor="#5046e6" duration={0.3}>
                <label htmlFor={field.label} className="text-sm font-medium leading-none">
                  {field.label} <span className="text-red-500">*</span>
                </label>
              </BoxReveal>

              <BoxReveal width="100%" boxColor="#5046e6" duration={0.3} className="flex flex-col space-y-2 w-full">
                <section className="relative">
                  <MagneticInput
                    type={
                      field.type === 'password'
                        ? visible
                          ? 'text'
                          : 'password'
                        : field.type
                    }
                    id={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />

                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={toggleVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  )}
                </section>

                <section className="h-4">
                  {errors[field.label] && (
                    <p className="text-red-500 text-xs">{errors[field.label]}</p>
                  )}
                </section>
              </BoxReveal>
            </section>
          ))}
        </section>

        <BoxReveal width="100%" boxColor="#5046e6" duration={0.3}>
          {errorField && (
            <p className="text-red-500 text-sm mb-4">{errorField}</p>
          )}
        </BoxReveal>

        <BoxReveal width="100%" boxColor="#5046e6" duration={0.3} overflow="visible">
          <button
            className={cn(
              "bg-gradient-to-br relative group/btn from-zinc-200 dark:from-zinc-900",
              "dark:to-zinc-900 to-zinc-200 block dark:bg-zinc-800 w-full text-black",
              "dark:text-white rounded-md h-10 font-medium",
              "shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]",
              "dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]",
              "outline-hidden hover:cursor-pointer"
            )}
            type="submit"
          >
            {submitButton} &rarr;
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor="#5046e6" duration={0.3}>
            <section className="mt-4 text-center hover:cursor-pointer">
              <button
                className="text-sm text-blue-500 hover:cursor-pointer outline-hidden"
                onClick={goTo}
                type="button"
              >
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

export { AnimatedForm };
