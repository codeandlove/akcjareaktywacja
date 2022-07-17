import { useCallback, useEffect, useRef, useState } from "react";

// Hook useHover
export const useHover = () => {
    const [value, setValue] = useState(false);

    const ref = useRef(null);

    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);

    useEffect(() => {
            const node = ref.current;
            if (node) {
                node.addEventListener("mouseover", handleMouseOver);
                node.addEventListener("mouseout", handleMouseOut);
                return () => {
                    node.removeEventListener("mouseover", handleMouseOver);
                    node.removeEventListener("mouseout", handleMouseOut);
                };
            }
        },
        [] // Recall only if ref changes
    );
    return [ref, value];
}

// Hook
// Parameter is the boolean, with default "false" value
export const useToggle = (initialState = false) => {
    // Initialize the state
    const [state, setState] = useState(initialState);

    // Define and memorize toggler function in case we pass down the component,
    // This function change the boolean value to it's opposite value
    const toggle = useCallback(() => setState(state => !state), []);

    return [state, toggle]
}

export const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export const useFormState = (initialState = {}) => {
    // Initialize the state
    const [state, _setState] = useState({...initialState});

    const setState = (updatedState) => {
        _setState({...state, ...updatedState});
    }

    const validateValues = (values) => {
        const result = values.filter(val => {
            return state[val] === false || state[val] === null || !state[val];
        });

        return result.length !== 0;
    }

    const handleChange = name => (event, data) => {
        const {value, checked} = data;

        setState({
            [name]: checked !== undefined ? checked : value
        });
    };


    return [state, setState, handleChange, validateValues];
}