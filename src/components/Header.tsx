import { useLocation } from "preact-iso";

export function Header() {
  const { url } = useLocation();

  return (
    <header>
      <h1>Literary Society of Friends</h1>
      <nav>
        <a href="/" class={url == "/" && "active"}>
          Home
        </a>
        <a href="/404" class={url == "/404" && "active"}>
          404
        </a>
      </nav>
    </header>
  );
}
