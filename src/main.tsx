import "@mantine/charts/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "sweetalert2/dist/sweetalert2.min.css";
import App from "./App.tsx";
import "./index.css";
import {
  registerServiceWorker,
  skipWaitingAndReload,
} from "./registerServiceWorker.ts";
import { store } from "./store/store";

const theme = createTheme({
  fontFamily: "Bricolage Grotesque, sans-serif",
  headings: {
    fontFamily: "Bricolage Grotesque, sans-serif",
    fontWeight: "700",
  },
  components: {
    Paper: {
      defaultProps: {
        shadow: "none",
        radius: "12",
        style: {
          border: "1px solid #E9ECEF",
          backgroundColor: "#FDFFFC",
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: "none",
        radius: "12",
        style: {
          border: "1px solid #E9ECEF",
          backgroundColor: "#FDFFFC",
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "8",
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </Provider>
);

// Example usage: show a native alert when an update is available.
// In your app you probably want a nicer toast/snackbar (Mantine/Sonner/etc).
registerServiceWorker((registration) => {
  // simple prompt; replace with your app's snackbar/prompt
  if (confirm("A new version is available. Update now?")) {
    skipWaitingAndReload(registration);
  }
});
