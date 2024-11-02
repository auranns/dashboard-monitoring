import { Component } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import { routes } from "./routes"; // Import routes dari file route.ts

const App: Component = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          path={route.path}
          component={route.component}
        />
      ))}
    </Routes>
  );
};

export default App;
