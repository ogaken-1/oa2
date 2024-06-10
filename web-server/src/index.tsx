import { Suspense, render } from "solid-js/web";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import NavBar from "./components/navbar";
import { lazy } from "solid-js";

const Home = lazy(() => import("./routes/index"));
const About = lazy(() => import("./routes/about"));
const NotFound = lazy(() => import("./not-found"));

const root = document.getElementById("root");
if (root != null) {
  render(
    () => (
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
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="*404" component={NotFound} />
      </Router>
    ),
    root,
  );
}
