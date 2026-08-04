import { NextIntlClientProvider, useMessages } from "next-intl";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const appMessages = useMessages();

  return (
    <>
      <NextIntlClientProvider messages={appMessages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
};
