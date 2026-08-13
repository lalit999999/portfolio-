import { getSessionUser } from "@/lib/auth/session";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";

export interface AuthStatusProps {
  className?: string;
}

export async function AuthStatus({ className }: AuthStatusProps) {
  const user = await getSessionUser();

  if (!user) {
    return <SignInButton size="sm" className={className} />;
  }

  return <UserMenu user={user} className={className} />;
}
