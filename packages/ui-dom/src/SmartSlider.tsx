import { useEffect, useState } from "react";

interface SmartSliderProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    sliderMin: number;
    sliderMax: number;
    rawMin: number;
    rawMax: number;
    step?: number; // how fine the input steps (e.g., 1, 0.1, 0.01, 0.001)
    precision?: number; // hard rounding limit under the hood (e.g., 2 decimal places)
    unit?: string;
    disabled?: boolean;
}

export const SmartSlider = ({
    label = "Control",
    value,
    onChange,
    sliderMin,
    sliderMax,
    rawMin,
    rawMax,
    step = 1,
    precision = 2,
    unit = "",
    disabled = false
}: SmartSliderProps) => {
    const [input, setInput] = useState(value.toFixed(precision));

    useEffect(() => {
        if (document.activeElement !== document.getElementById(`input-${label}`)) {
            setInput(value.toFixed(precision));
        }
    }, [value, precision, label]);

    const handle_slider_change = (e) => {
        const num_val = parseFloat(e.target.value);
        onChange(num_val);
        setInput(num_val.toFixed(precision));
    };

    const handle_text_change = (e) => {
        const val = e.target.value;
        setInput(val);

        const num_val = parseFloat(val);
        if (!isNaN(num_val)) {
            onChange(Math.max(rawMin, Math.min(rawMax, num_val)));
        }
    };

    const handle_blur = () => {
        let num_val = parseFloat(input);
        if (isNaN(num_val)) num_val = value;

        const final_val = Math.max(rawMin, Math.min(rawMax, num_val));
        onChange(final_val);
        setInput(final_val.toFixed(precision));
    };

    return (
        <div className={`flex items-start justify-between w-full max-w-sm py-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
            <label className="text-xs text-white select-none whitespace-nowrap mr-4">
                {label}
            </label>

            <div className="flex flex-wrap items-center justify-end gap-4 mt-2">
                <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    step={step}
                    value={Math.max(sliderMin, Math.min(sliderMax, value))}
                    onChange={handle_slider_change}
                    className="w-full max-w-50 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
                    disabled={disabled}
                />

                <div className="flex items-center bg-slate-700 px-3 py-1.5 rounded-md min-w-20 justify-end shadow-sm">
                    <input
                        id={`input-${label}`}
                        type="number"
                        value={input}
                        onChange={handle_text_change}
                        onBlur={handle_blur}
                        step={step}
                        className="w-12 bg-transparent text-right text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        disabled={disabled}
                    />
                    <span className="text-sm text-white ml-1 select-none">{unit}</span>
                </div>
            </div>
        </div>
    );
}