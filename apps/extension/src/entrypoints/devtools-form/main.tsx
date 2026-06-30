import { DevToolsFormPage } from "@hyperlinkvr/pages/devtools/form";
import ReactDOM from "react-dom/client";

export const DevToolsFormUI = () => {
    return (
        <DevToolsFormPage />
    )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<DevToolsFormUI />);
