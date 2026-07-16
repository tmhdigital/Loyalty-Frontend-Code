import React, { useEffect } from "react";
import router from "./routes";
import { RouterProvider } from "react-router-dom";
import { setupForegroundMessageHandler } from "./utils/fcmService";

function App() {
  useEffect(() => {
    // Initialize FCM foreground message handler when app loads
    setupForegroundMessageHandler();
  }, []);

  return (
    <React.Fragment>
      <RouterProvider router={router} />
    </React.Fragment>
  );
}
export default App;