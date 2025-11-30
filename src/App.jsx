import "./App.css";
import AppLayout from "./AppLayout";     // this is fine; it will pick AppLayout.jsx
import { Route, Routes } from "react-router-dom";
import { routes } from "./routes";

function App() {
  const routesToRender = routes?.userRoutes || [];

  return (
    <div>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {routesToRender.map((route) => {
            let Component = route?.Component;
            return (
              <Route
                path={route?.path}
                element={<Component />}
              />
            );
          })}

          <Route path="*" element={<div>Not found</div>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
