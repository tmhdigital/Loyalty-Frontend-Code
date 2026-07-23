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
// Media Url has been updated in Production environment. Now checking in production environment.