"use client";

import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Trigger the entrance animation on mount
        requestAnimationFrame(() => setMounted(true));
    }, []);

    return (
        <div
            className={`page-transition ${mounted ? "page-enter-active" : "page-enter"}`}
        >
            {children}
        </div>
    );
}
