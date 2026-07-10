import Link from "next/link";
import { ArrowRightIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = clsx(
  "text-white hover:text-primary transition-colors duration-300",
);

const navLinks = [
  { href: "/", label: "Serviços" },
  { href: "/about", label: "Como funciona" },
  { href: "/contact", label: "Depoimentos" },
  { href: "/contact", label: "Contato" },
];

function DemoButton({ className }: { className?: string }) {
  return (
    <Link
      href="/demo"
      className={clsx(
        "bg-accent flex py-4 text-background gap-6 items-center rounded-full px-4 font-sans text-sm cursor-pointer hover:bg-primary transition-colors duration-300",
        className,
      )}
    >
      Agendar demo
      <ArrowRightIcon size={18} />
    </Link>
  );
}

export function Header() {
  return (
    <header className="flex justify-between items-center mx-5 p-7">
      <Link href="/">
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
        </Link>

      <nav className="hidden md:flex justify-between text-sm gap-8 font-sans font-normal">
        {navLinks.map(({ href, label }) => (
          <Link key={label} href={href} className={navigation}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:block">
        <DemoButton />
      </div>

      <Sheet>
        <SheetTrigger
          className="md:hidden"
          render={<Button variant="ghost" size="icon" />}
        >
          <MenuIcon className="text-white" />
          <span className="sr-only">Abrir menu</span>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-6 px-4 font-sans text-sm">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-foreground hover:text-primary transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
            <DemoButton className="text-background" />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
