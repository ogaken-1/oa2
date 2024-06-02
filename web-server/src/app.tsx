import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./index.css";
import NavBar from "./components/navbar";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <header>
            <NavBar />
          </header>
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
