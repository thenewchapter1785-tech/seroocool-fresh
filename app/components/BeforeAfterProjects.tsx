const projects = [
  {
    before: "Outdated website with weak lead flow",
    after: "Conversion-focused pages with clear consultation CTAs",
  },
  {
    before: "Manual follow-up and missed inquiries",
    after: "Automated lead intake and structured scheduling",
  },
  {
    before: "Unstable business systems and reactive fixes",
    after: "Proactive support plans with faster issue resolution",
  },
];

export default function BeforeAfterProjects() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="before-after">
      <h2 className="section-title">Before and After Projects</h2>
      <p className="section-copy mt-3">Editable placeholders for measurable transformation stories.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <article key={project.before} className="project-card">
            <p className="project-tag">Before</p>
            <p className="project-copy mt-2">{project.before}</p>
            <p className="project-tag mt-4">After</p>
            <p className="project-copy mt-2">{project.after}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
