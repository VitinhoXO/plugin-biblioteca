import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { CategoryBar } from "./CategoryBar";
import { ProductRow } from "./ProductRow";

/**
 * Biblioteca do plugin Collection — home logada (Figma node 17637:48665).
 * Header ancorado + rail de categorias + barra de categorias + fileiras de
 * produtos. Layout fixo de 1440px (janela do plugin desktop).
 */
const SECTIONS = [
  "Porcelanato e Cerâmica",
  "MDF",
  "Pedras",
  "Tintas e Texturas",
  "Móveis",
  "Decoração",
  "Iluminação",
];

export function Home() {
  return (
    <div className="pb-home mx-auto min-h-screen w-[1440px] bg-black text-white">
      <Header />
      <div className="flex">
        <div className="sticky top-[92px] ml-[12px] mt-[12px] self-start">
          <Sidebar />
        </div>
        <main className="ml-[19px] mr-[24px] min-w-px flex-1 pb-[48px]">
          <CategoryBar />
          {SECTIONS.map((title) => (
            <ProductRow key={title} title={title} />
          ))}
        </main>
      </div>
    </div>
  );
}
