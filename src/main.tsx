
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { LanguageProvider } from "./utils/languageContext";
  import { ComplianceProvider } from "./utils/complianceContext";
  import { NotificationsProvider } from "./utils/notificationsContext";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <LanguageProvider>
      <ComplianceProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </ComplianceProvider>
    </LanguageProvider>,
  );
