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
  <section className="rounded-[24px] border border-white/10 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.15)]">
    <div className="mb-8">
      <p className="text-sm uppercase tracking-[0.24em] text-[#d8f3dc] opacity-80">{theme}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">{description}</h2>
      <p className="mt-2 max-w-2xl text-sm text-white/75">
        A refined AgriHub surface for farm operations, soil insight, and precision decisions.
      </p>
    </div>
    {children}
  </section>
);

const UIDemo = () => {
  return (
    <main className="min-h-screen space-y-10 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#e9c46a]/90">AgriHub UI system</p>
          <h1 className="text-4xl font-semibold">Precision interface for rural farming operations</h1>
          <p className="mx-auto max-w-2xl text-base text-white/75">
            Button motion, tonal contrast, and terrain-native backgrounds tuned for field workflows.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-agri-light rounded-[30px] p-8">
            <Section theme="Light surface" description="Field-ready clarity">
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
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-700">
                    {buttonRows.map(({ title, variant }) => (
                      <span key={variant} className="rounded-full bg-white/80 px-3 py-1 text-[#1b4332] ring-1 ring-[#1b4332]/10">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div className="bg-agri-dark rounded-[30px] p-8">
            <Section theme="Dark surface" description="Analytics-ready depth">
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
                      <span key={variant} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
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
