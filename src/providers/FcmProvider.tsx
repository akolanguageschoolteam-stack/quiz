'use client';

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { getFcmToken, initForegroundFcm } from "@/lib/firebase";
import { tokenSelector } from "@/redux/reducers/userSlice";

export function FcmProvider() {
    const token = useSelector(tokenSelector);
    const queryClient = useQueryClient();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!token || initializedRef.current) return;
        initializedRef.current = true;

        void (async () => {
            await getFcmToken();
            await initForegroundFcm(() => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            });
        })();
    }, [token, queryClient]);

    return null;
}
