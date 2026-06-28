import "~/shared.css";

import { SettingsPage } from "@viewportvr/pages/settings";
import ReactDOM from "react-dom/client";
import { DefaultContextProviders } from "~/contexts/DefaultContextProviders";

const SettingsUI = () => {
    return (
        <DefaultContextProviders>
            <SettingsPage />
        </DefaultContextProviders>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<SettingsUI />);
