import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function useWorkspaceRealtime(
    workspaceId,
    onMessage
) {
    useEffect(() => {
        if (!workspaceId || !onMessage) return;

        const channel = supabase
            .channel(`workspace-messages-${workspaceId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "workspace_messages",
                    filter: `workspace_id=eq.${workspaceId}`,
                },
                (payload) => {
                    onMessage(payload.new);
                }
            )
            .subscribe((status) => {
                console.log(
                    "Workspace Realtime status:",
                    status
                );
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [workspaceId, onMessage]);
}