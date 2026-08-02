"use client";

import { KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

function getUpdateErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("same password") || normalized.includes("different from the old")) {
    return "Your new password must be different from the current password.";
  }
  if (normalized.includes("weak") || normalized.includes("characters")) {
    return "Supabase rejected this password. Try a longer password with a mix of letters, numbers, and symbols.";
  }
  return "The password could not be changed. Please try again.";
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.`);
      return;
    }
    if (newPassword !== confirmation) {
      setError("The new password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Your new password must be different from the current password.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected. Check the site configuration and try again.");
      return;
    }

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (userError || !email) {
        setError("Your admin session could not be verified. Sign in again, then retry.");
        return;
      }

      const { error: verificationError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verificationError) {
        setError("The current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      });
      if (updateError) {
        setError(getUpdateErrorMessage(updateError.message));
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });
      if (signOutError) {
        setError("The password was changed, but automatic sign-out failed. Use Sign out before continuing.");
        return;
      }

      toast.success("Password changed. Sign in again with your new password.");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("A connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="settings-form password-settings-form" onSubmit={submit}>
      <section className="settings-block">
        <div>
          <span>04</span>
          <h2>Security</h2>
          <p>Change the admin password without using a recovery email. You will be signed out on every device afterward.</p>
        </div>
        <div className="settings-fields">
          <label className="wide">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={loading}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              aria-describedby="password-requirements"
              disabled={loading}
              required
            />
            <small id="password-requirements" className="field-hint">At least {MIN_PASSWORD_LENGTH} characters. A longer passphrase is safer.</small>
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              disabled={loading}
              required
            />
          </label>
          {error && <div className="form-alert password-alert" role="alert">{error}</div>}
          <div className="password-actions">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" /> : <KeyRound size={16} />}
              {loading ? "Changing password..." : "Change password"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
