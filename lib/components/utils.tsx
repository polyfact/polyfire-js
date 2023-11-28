import { useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";

export function useDebounce<Params extends unknown[], Return>(
    cb: (...args: Params) => Return,
    delay: number,
): (...args: Params) => Return {
    const cbRef = useRef(cb);
    useEffect(() => {
        cbRef.current = cb;
    });
    return useCallback(
        debounce((...args: Params) => cbRef.current(...args), delay) as (...args: Params) => Return,
        [delay],
    );
}
