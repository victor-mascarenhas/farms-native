import "./globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("../src/components/Sidebar"), {
  ssr: false,
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Sidebar>
      <Component {...pageProps} />
    </Sidebar>
  );
}
