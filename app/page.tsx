import {
  getProfile,
  getEducation,
  getSkillsByCategory,
  getProjects,
  getCertifications,
  getSocials,
  getBlogSources,
} from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function Empty({ collection }: { collection: string }) {
  return <p style={{ color: "red", fontWeight: "bold" }}>EMPTY: {collection}</p>;
}

export default async function Home() {
  const [
    profile,
    education,
    skillsByCategory,
    projects,
    certifications,
    socials,
    blogSources,
  ] = await Promise.all([
    getProfile(),
    getEducation(),
    getSkillsByCategory(),
    getProjects({}),
    getCertifications(),
    getSocials(),
    getBlogSources(),
  ]);

  return (
    <div>
      <h1>Phase 1 smoke test — raw Atlas reads</h1>

      <h2>Profile</h2>
      {profile ? <pre>{JSON.stringify(profile, null, 2)}</pre> : <Empty collection="profile" />}

      <h2>Education</h2>
      {education.length === 0 ? (
        <Empty collection="education" />
      ) : (
        <ul>
          {education.map((e: any) => (
            <li key={e._id}>
              {e.degree} — {e.institution}
            </li>
          ))}
        </ul>
      )}

      <h2>Projects (title + slug)</h2>
      {projects.length === 0 ? (
        <Empty collection="projects" />
      ) : (
        <ul>
          {projects.map((p: any) => (
            <li key={p._id}>
              {p.title} — /{p.slug}
            </li>
          ))}
        </ul>
      )}

      <h2>Skills by category</h2>
      {skillsByCategory.length === 0 ? (
        <Empty collection="skillcategories" />
      ) : (
        skillsByCategory.map((cat: any) => (
          <div key={cat._id}>
            <h3>{cat.name}</h3>
            {cat.skills.length === 0 ? (
              <Empty collection={`skills[${cat.slug}]`} />
            ) : (
              <ul>
                {cat.skills.map((s: any) => (
                  <li key={s._id}>{s.name}</li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}

      <h2>Certifications</h2>
      {certifications.length === 0 ? (
        <Empty collection="certifications" />
      ) : (
        <ul>
          {certifications.map((c: any) => (
            <li key={c._id}>
              {c.title} — {c.issuer} — {formatDate(c.issueDate)}
            </li>
          ))}
        </ul>
      )}

      <h2>Socials</h2>
      {socials.length === 0 ? (
        <Empty collection="socials" />
      ) : (
        <ul>
          {socials.map((s: any) => (
            <li key={s._id}>
              {s.name}: {s.url}
            </li>
          ))}
        </ul>
      )}

      <h2>Blog sources</h2>
      {blogSources.length === 0 ? (
        <Empty collection="blogsources" />
      ) : (
        <ul>
          {blogSources.map((b: any) => (
            <li key={b._id}>
              {b.name} — {b.host}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
