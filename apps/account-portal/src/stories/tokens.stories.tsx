import type { Meta, StoryObj } from "@storybook/react-vite";

const colors = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["popover", "bg-popover"],
  ["muted", "bg-muted"],
  ["accent", "bg-accent"],
  ["secondary", "bg-secondary"],
  ["primary (brass)", "bg-primary"],
  ["destructive", "bg-destructive"],
  ["trade-up", "bg-trade-up"],
  ["trade-down", "bg-trade-down"],
  ["status-warning", "bg-status-warning"],
  ["sidebar", "bg-sidebar"],
  ["chart-1", "bg-chart-1"],
  ["chart-2", "bg-chart-2"],
  ["chart-3", "bg-chart-3"],
  ["chart-4", "bg-chart-4"],
] as const;

const text = [
  ["foreground", "text-foreground"],
  ["muted-foreground", "text-muted-foreground"],
  ["primary", "text-primary"],
  ["trade-up", "text-trade-up"],
  ["trade-down", "text-trade-down"],
] as const;

function Swatches() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="realm-card-title">Surfaces &amp; roles</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colors.map(([name, cls]) => (
            <div key={name} className="space-y-1.5">
              <div className={`${cls} h-14 rounded-md border`} />
              <p className="realm-group-title">{name}</p>
              <p className="realm-label font-mono">{cls}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="realm-card-title">Text</h2>
        <div className="flex flex-wrap gap-6">
          {text.map(([name, cls]) => (
            <span key={name} className={`${cls} text-sm`}>
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Typography() {
  return (
    <div className="space-y-6">
      <div>
        <p className="realm-kicker">Eyebrow · .realm-kicker · Monaspace Xenon</p>
        <h1 className="realm-page-title">Page title</h1>
        <p className="realm-label">.realm-page-title · IM Fell English SC · 30/36px</p>
      </div>
      <div>
        <h2 className="realm-card-title">Section title</h2>
        <p className="realm-label">.realm-card-title · IM Fell, brass · 18px</p>
      </div>
      <div>
        <p className="realm-group-title">Group title</p>
        <p className="realm-label">.realm-group-title · Exo 2 semibold · 14px</p>
      </div>
      <div>
        <p className="text-sm">
          Body copy is Exo 2 at 14px. Supporting copy and metadata use 12px muted.
        </p>
        <p className="realm-label">.realm-label · Exo 2 · 12px muted</p>
      </div>
      <div>
        <p className="realm-stat text-3xl font-semibold">124,500.00</p>
        <p className="realm-label">.realm-stat · Monaspace Xenon · tabular numbers</p>
      </div>
    </div>
  );
}

function Shape() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="realm-card-title">Radius</h2>
        <div className="flex flex-wrap gap-4">
          {["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-full"].map(
            (cls) => (
              <div key={cls} className="space-y-1.5 text-center">
                <div className={`bg-card size-16 border ${cls}`} />
                <p className="realm-label font-mono">{cls}</p>
              </div>
            ),
          )}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="realm-card-title">Edges &amp; elevation</h2>
        <p className="text-muted-foreground max-w-xl text-sm">
          Grounded surfaces (cards, panels) have one etched border and no shadow.
          Only floating layers (dialogs, menus, popovers) use <code>shadow-float</code>.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-card size-24 rounded-lg border" />
          <div className="bg-card border-border-strong size-24 rounded-lg border" />
          <div className="bg-popover shadow-float border-border-strong size-24 rounded-lg border" />
          <div className="bg-card shadow-glow-md size-24 rounded-lg border" />
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Foundations/Tokens",
  parameters: {
    docs: {
      description: {
        component:
          "Semantic tokens from src/styles.css (shared with the marketplace). Components use these utilities only — no arbitrary colors, radii or shadows.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = { render: () => <Swatches /> };
export const Type: Story = { render: () => <Typography /> };
export const RadiusAndElevation: Story = {
  name: "Radius & elevation",
  render: () => <Shape />,
};
