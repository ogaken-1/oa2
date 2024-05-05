import { css } from "../styled-system/css";

function App() {
  return (
    <div
      class={css({
        fontSize: "2xl",
        fontWeight: "bold",
      })}
    >
      Hello panda!
    </div>
  );
}

export default App;
