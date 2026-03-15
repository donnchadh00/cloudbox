import { Button, Text, View, useAuthenticator } from '@aws-amplify/ui-react';

const guestUsername = import.meta.env.VITE_GUEST_EMAIL?.trim();
const guestPassword = import.meta.env.VITE_GUEST_PASSWORD?.trim();

export default function GuestSignInFooter() {
  const { isPending, submitForm, toForgotPassword } = useAuthenticator((context) => [
    context.isPending,
    context.submitForm,
    context.toForgotPassword,
  ]);
  const isGuestConfigured = Boolean(guestUsername && guestPassword);

  const handleGuestSignIn = async () => {
    if (!isGuestConfigured || isPending) return;

    submitForm({
        username: guestUsername,
        password: guestPassword,
    });
  };

  return (
    <View data-amplify-footer>
      <Button onClick={toForgotPassword} size="small" variation="link">
        Forgot password?
      </Button>
      <Button
        isDisabled={!isGuestConfigured || isPending}
        isFullWidth
        isLoading={isPending}
        loadingText="Signing in..."
        marginTop="0.75rem"
        onClick={handleGuestSignIn}
        type="button"
        variation="primary"
      >
        Guest Sign In
      </Button>
      <Text color="font.secondary" fontSize="0.875rem" marginTop="0.5rem">
        {isGuestConfigured
          ? 'Use the demo account for a quick walkthrough.'
          : 'Set VITE_GUEST_EMAIL and VITE_GUEST_PASSWORD to enable guest sign-in.'}
      </Text>
    </View>
  );
}
