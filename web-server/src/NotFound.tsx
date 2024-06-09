import { css } from "../styled-system/css";

export default function NotFound() {
  return (
    <>
      <h1>
        <b
          class={css({
            fontSize: "404px",
          })}
        >
          404 Not Found
        </b>
      </h1>
      <p>This is not the web page you are looking for.</p>
    </>
  );
}
