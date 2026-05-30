"use client";

import { useRouter } from "next/navigation";
import BroadcastEmailClient from "../BroadcastEmailClient";

type FormOption = {
  id: string;
  title: string;
};

type UserOption = {
  id: string;
  full_name?: string | null;
  email: string | null;
  role?: string | null;
  email_promotions?: boolean | null;
};

type Props = {
  forms: FormOption[];
  users: UserOption[];
};

export default function NewBroadcastWrapper({ forms, users }: Props) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/broadcasts");
  };

  return (
    <BroadcastEmailClient
      forms={forms}
      users={users}
      onSuccess={handleSuccess}
    />
  );
}