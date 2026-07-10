export function PriceSection() {
    return (
        <section className="w-full flex flex-col gap-7 bg-background border-t border-white/10 pt-12 pb-8 md:pt-16">
            <div className="max-w-300 mx-auto px-5 md:px-8 mt-20 md:mt-28">
                <div className="text-center pb-5">
                    <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                        Preços
                    </span>
                    <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-6">
                        Escolha o plano ideal para sua academia ou box
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 items-center">
                    {/* Pricing cards will go here */}
                </div>
            </div>
        </section>
    );
}