import { useSyncExternalStore } from "react";

// returns the current hash location (minus the # symbol)
const currentLoc = () => window.location.hash.replace(/^#/, "") || "/";

// Custom hook for hash-based routing with proper TypeScript types
const useHashLocation = (): [string, (to: string) => void] => {
    const location = useSyncExternalStore(
        (onChange) => {
            window.addEventListener("hashchange", onChange);
            return () => window.removeEventListener("hashchange", onChange);
        },
        () => currentLoc()
    );

    const navigate = (to: string) => {
        window.location.hash = to;
    };

    return [location, navigate] as [string, (to: string) => void];
};

export default useHashLocation;

