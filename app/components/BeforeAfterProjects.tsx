const projects = [
  {
    before: "Slow family computer, constant popups, and daily crashes",
    after: "Computer cleaned up, virus removed, and running normally again",
  },
  {
    before: "Small business missing calls and messages from the website",
    after: "Clear contact flow, faster replies, and more booked jobs",
  },
  {
    before: "Unstable office tech causing delays every week",
    after: "Reliable support plan with fewer surprises and faster fixes",
  },
];

export default function BeforeAfterProjects() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="before-after">
      <h2 className="section-title">Before and After</h2>
      <p className="section-copy mt-3">Example stories you can replace with real customer results.</p>
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
