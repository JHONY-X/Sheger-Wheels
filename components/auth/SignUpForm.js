"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Checkbox, Input } from "@/components/ui";
import { createDemoAccount } from "@/lib/domain/users";
import { signInAsDemo } from "@/lib/session";

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [asOwner, setAsOwner] = useState(false);
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const result = createDemoAccount({ name, email, phone, asOwner });
    if (!result.ok) {
      setError(result.message);
      return;
    }

    const signedIn = signInAsDemo(result.user.id);
    if (!signedIn.ok) {
      setError(signedIn.message);
      return;
    }

    router.replace("/cars");
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p role="alert" className="mb-4 rounded-btn bg-danger-tint px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <Input
          label="Full name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Selam Tesfaye"
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          hint="Must be unique among the demo accounts."
        />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+251 911 234 567"
        />

        <Checkbox
          label="I also want to list a car"
          hint="Adds the owner role to this account. You can still rent."
          checked={asOwner}
          onChange={(event) => setAsOwner(event.target.checked)}
        />
      </div>

      <Button type="submit" size="lg" className="mt-5 w-full">
        Create demo account
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        This creates a record in this browser only. No email is sent, no
        password is stored, and the admin role cannot be self-assigned.
      </p>
    </form>
  );
}
