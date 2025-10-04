// app/projects/page.tsx  (SERVER)
import ProjectsClient from "./ProjectsClient";

export const metadata = { title: "Projects | Heptapus" };

export default function Page() {
  return <ProjectsClient />;
}
