import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/message-admin")({
  component: MessageAdminRedirect,
});

// Your real app doesn't have a live-chat feature — messaging the agency happens
// inline within the Help Center flow (help.tsx), submitted to the `grievances`
// table and answered asynchronously. This route just sends people there instead
// of showing a fake chat UI that has no real functionality behind it.
function MessageAdminRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/help" });
  }, []);
  return null;
}
