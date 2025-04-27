import { signOut } from "@/auth";
import MyProfileForm from "@/components/MyProfileForm";
import { Button } from "@/components/ui/button";

import React from "react";

const page = async () => {
  return (
    <>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
        className="mb-10"
      >
        <Button>Logout</Button>
        <MyProfileForm />
      </form>
    </>
  );
};

export default page;
