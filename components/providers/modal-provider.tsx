"use client";
import { useState, useEffect } from "react";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { EditServerModal } from "../modals/edit-server-modal";
import { InviteModal } from "../modals/invite-modal";
import { MembersModal } from "../modals/members-modal";

const ModalProvider = () => {
  // the isMounted check is to make sure that the modal is not rendered in the server side because it is use client so it will be rendered server side. But we dont want that because it will cause hydration error as the state will be different on the server and client side and this will cause inconsistencies.
  // Visit this for hydration error
  // https://blog.logrocket.com/common-next-js-errors/#:~:text=js%20hydration%20errors%20arise%20when,was%20rendered%20on%20the%20server

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  });

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
    </>
  );
};

export default ModalProvider;
