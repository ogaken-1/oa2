import { A } from "@solidjs/router";
import { css } from "../../styled-system/css";

export default function NavBar() {
  return (
    <div
      class={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        fontWeight: "bold",
      })}
    >
      <A href="/">Index</A>
      <A href="/about">About</A>
    </div>
  );
}
