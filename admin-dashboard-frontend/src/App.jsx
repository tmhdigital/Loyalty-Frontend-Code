import React from "react";
import router from "./routes";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <React.Fragment>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </React.Fragment>
  );
}

export default App;
// Media Url has been removed from the code as it is not needed in the frontend. The media url is now being fetched from the backend and passed to the frontend via API calls.z