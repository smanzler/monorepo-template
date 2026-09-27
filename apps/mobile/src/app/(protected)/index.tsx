import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useDeleteAccount } from "@/features/account/hooks/use-delete-account";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";
import { authClient } from "@/lib/auth-client";
import { Alert, View } from "react-native";

export default function Home() {
  const { data: session } = authClient.useSession();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your account and everything in it. You cannot undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteAccount(undefined, {
              onError: (error) => {
                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "An error occurred while deleting your account",
                );
              },
            }),
        },
      ],
    );
  };

  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="text-muted-foreground">
        Signed in as {session?.user.email}
      </Text>
      <Button variant="outline" onPress={() => authClient.signOut()}>
        <Text>Sign out</Text>
      </Button>
      <Button variant="ghost" onPress={resetOnboarding}>
        <Text>Reset onboarding</Text>
      </Button>
      <Button
        variant="ghost"
        onPress={handleDeleteAccount}
        disabled={isDeletingAccount}
      >
        <Text className="text-destructive">Delete account</Text>
      </Button>
    </View>
  );
}
