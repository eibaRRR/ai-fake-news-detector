"use client";

import { useState, useEffect } from 'react';

export default function ClientOnlyTimestamp({ timestamp }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // This code runs only after the component has mounted in the browser
        setIsMounted(true);
    }, []);

    // While not mounted, render nothing to avoid a server-client mismatch
    if (!isMounted) {
        return null; 
    }

    // Once mounted, safely render the locally formatted date
    return (
        <p className="text-sm text-white/60">
            {new Date(timestamp).toLocaleString()}
        </p>
    );
}