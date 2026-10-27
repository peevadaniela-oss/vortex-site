// Saved projects: designs people come back to and edit later. They live in this browser only.
const KEY = "vortex-projects";

export function listProjects() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.sort((a, b) => b.updated - a.updated) : [];
  } catch { return []; }
}
function saveAll(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
}
export const getProject = (id) => listProjects().find((p) => p.id === id) ?? null;

// design: { shape, size, main, textc, text } with colours by name
export function createProject({ name, idea = "", design }) {
  const p = { id: Math.random().toString(36).slice(2, 10), name, idea, design, updated: Date.now() };
  return saveAll([p, ...listProjects()]) ? p : null;
}
export function updateProject(id, changes) {
  const list = listProjects(), p = list.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, changes, { updated: Date.now() });
  return saveAll(list) ? p : null;
}
export function deleteProject(id) {
  saveAll(listProjects().filter((p) => p.id !== id));
}
