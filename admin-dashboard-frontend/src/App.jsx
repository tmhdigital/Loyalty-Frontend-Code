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


// This comment is added to check the CI functionality for the admin dashboard.