import debounce from "lodash.debounce";
import { useRef, useEffect, useCallback } from "react";

export function useDebounce<Params extends unknown[], Return>(
    cb: (...args: Params) => Return,
    delay: number,
): (...args: Params) => Return {
    const cbRef = useRef(cb);
    useEffect(() => {
        cbRef.current = cb;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(
        debounce((...args: Params) => cbRef.current(...args), delay) as (...args: Params) => Return,
        [delay],
    );
}
