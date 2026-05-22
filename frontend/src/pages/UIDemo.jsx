import AgriButton from "../components/ui/AgriButton";

const buttonRows = [
  {
    title: "Primary CTA",
    label: "Start Crop Diagnosis",
    variant: "primary",
  },
  {
    title: "Secondary",
    label: "View Field Report",
    variant: "secondary",
  },
  {
    title: "Ghost",
    label: "Learn More",
    variant: "ghost",
  },
  {
    title: "Data",
    label: "Open Analytics Dashboard",
    variant: "data",
  },
];

const Section = ({ theme, description, children }) => (
  <section className="rounded-[24px] border border-white/5 p-8 shadow-glow-md bg-black/20">
    <div className="mb-8">
      <p className="text-sm uppercase tracking-[0.24em] text-emerald-400 font-semibold">{theme}</p>
      <h2 className="mt-3 text-3xl font-bold text-white">{description}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">
        A refined AgriHub surface for farm operations, soil insight, and precision decisions.
      </p>
    </div>
    {children}
  </section>
);

const UIDemo = () => {
  return (
    <main className="min-h-screen bg-[#0B0F12] space-y-10 px-6 py-10 text-white pb-20">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-bold">AgriHub UI system</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Precision interface for rural farming operations</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            Button motion, tonal contrast, and terrain-native backgrounds tuned for field workflows.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-[#13191C] border border-white/5 rounded-[30px] p-8 shadow-glow-sm">
            <Section theme="Tonal surface" description="Field-ready clarity">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-4">
                    {buttonRows.map(({ label, variant }) => (
                      <AgriButton key={variant} variant={variant} size="md">
                        {label}
                      </AgriButton>
                    ))}
                    <AgriButton variant="primary" size="md" disabled>
                      Start Crop Diagnosis
                    </AgriButton>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    {buttonRows.map(({ title, variant }) => (
                      <span key={variant} className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400 ring-1 ring-emerald-500/20">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div className="bg-[#1A2228] border border-white/5 rounded-[30px] p-8 shadow-glow-md">
            <Section theme="Elevated surface" description="Analytics-ready depth">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-4">
                    {buttonRows.map(({ label, variant }) => (
                      <AgriButton key={variant} variant={variant} size="md">
                        {label}
                      </AgriButton>
                    ))}
                    <AgriButton variant="secondary" size="md" disabled>
                      View Field Report
                    </AgriButton>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-white/70">
                    {buttonRows.map(({ title, variant }) => (
                      <span key={variant} className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10 text-slate-300">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UIDemo;
