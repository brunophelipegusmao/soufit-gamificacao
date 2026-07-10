import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const navigation = clsx(
  "text-white hover:text-primary transition-colors duration-300",
);

export function Header() {
  return (
    <header className="flex justify-between items-center mx-5 p-7">
      <div className="flex items-center">
        <span className="">
          <Image
            src="./icon.svg"
            alt="Ícone verde com raio preto"
            width={65}
            height={65}
          />
        </span>
        <span className="text-white font-extrabold text-xl">EVENTS</span>
        <span className="text-white text-xl">FITNESS</span>
      </div>

      <nav className="flex justify-between text-sm gap-8 font-sans font-normal">
        <Link href="/" className={navigation}>
          Serviços
        </Link>
        <Link href="/about" className={navigation}>
          Como funciona
        </Link>
        {/* <Link
          href="/contact"
          className={navigation}
        >
          Benefícios
        </Link> */}
        <Link href="/contact" className={navigation}>
          Depoimentos
        </Link>
        <Link href="/contact" className={navigation}>
          Contato
        </Link>
      </nav>
      <div>
        <button className="bg-(--accent) flex p-2 text-background gap-6 items-center rounded-full px-4 font-sans text-sm cursor-pointer hover:bg-primary transition-colors duration-300">
          Agendar demo
          <ArrowRightIcon className="" size={18} />
        </button>
      </div>
    </header>
  );
}
