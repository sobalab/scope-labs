import { useMemo, useState } from 'react';
import { CodeViewer } from './CodeViewer';
import { fileContent } from '../../lib/fileContent';

interface Node {
  name: string;
  path: string;
  type: 'dir' | 'file';
  children?: Node[];
}

// Build a nested tree from a flat list of file paths ("src/eval/evaluate.ts").
function build(paths: string[]): Node[] {
  const root: Node[] = [];
  for (const p of paths) {
    const parts = p.split('/');
    let level = root;
    let cur = '';
    parts.forEach((part, i) => {
      cur = cur ? `${cur}/${part}` : part;
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === part);
      if (!node) {
        node = { name: part, path: cur, type: isFile ? 'file' : 'dir', children: isFile ? undefined : [] };
        level.push(node);
      }
      if (!isFile) level = node.children!;
    });
  }
  const sort = (nodes: Node[]) => {
    nodes.sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1,
    );
    nodes.forEach((n) => n.children && sort(n.children));
  };
  sort(root);
  return root;
}

function allDirs(nodes: Node[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.type === 'dir') {
      acc.push(n.path);
      if (n.children) allDirs(n.children, acc);
    }
  }
  return acc;
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="shrink-0 transition-transform"
    style={{ transform: open ? 'rotate(90deg)' : 'none' }}
  >
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-accent">
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-faint">
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

function TreeNodes({
  nodes,
  depth,
  expanded,
  toggle,
  onOpenFile,
}: {
  nodes: Node[];
  depth: number;
  expanded: Set<string>;
  toggle: (path: string) => void;
  onOpenFile: (path: string) => void;
}) {
  return (
    <>
      {nodes.map((n) => {
        const pad = { paddingLeft: depth * 15 + 12 };
        if (n.type === 'dir') {
          const open = expanded.has(n.path);
          return (
            <div key={n.path}>
              <button
                type="button"
                onClick={() => toggle(n.path)}
                aria-expanded={open}
                style={pad}
                className="flex w-full items-center gap-[7px] py-[5px] pr-3 text-left text-[13px] font-medium text-ink transition-colors hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-line"
              >
                <span className="text-faint">
                  <Chevron open={open} />
                </span>
                <FolderIcon />
                {n.name}
              </button>
              {open && n.children && (
                <TreeNodes
                  nodes={n.children}
                  depth={depth + 1}
                  expanded={expanded}
                  toggle={toggle}
                  onOpenFile={onOpenFile}
                />
              )}
            </div>
          );
        }
        return (
          <button
            type="button"
            key={n.path}
            onClick={() => onOpenFile(n.path)}
            aria-label={`View ${n.path}`}
            style={pad}
            className="flex w-full items-center gap-[7px] py-[5px] pr-3 text-left text-[13px] text-body transition-colors hover:bg-surface-sunk hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-line"
          >
            <span className="w-[11px] shrink-0" aria-hidden="true" />
            <FileIcon />
            {n.name}
          </button>
        );
      })}
    </>
  );
}

// A read-only view of the codebase structure, built from the repo's file paths.
// Clicking a file opens it in an in-tool code viewer; the repo stays one click
// away from inside that viewer.
export function FileTree({
  paths,
  repoUrl,
  readme,
}: {
  paths: string[];
  repoUrl?: string;
  readme?: string;
}) {
  const tree = useMemo(() => build(paths), [paths]);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(allDirs(tree)),
  );
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const opened = openPath ? fileContent(openPath, readme) : null;

  return (
    <>
      <div className="scroll-region max-h-[320px] overflow-auto rounded-lg border border-border bg-surface-sunk py-2">
        <TreeNodes
          nodes={tree}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          onOpenFile={setOpenPath}
        />
      </div>
      {openPath && opened && (
        <CodeViewer
          path={openPath}
          content={opened.content}
          lang={opened.lang}
          repoUrl={repoUrl}
          onClose={() => setOpenPath(null)}
        />
      )}
    </>
  );
}
