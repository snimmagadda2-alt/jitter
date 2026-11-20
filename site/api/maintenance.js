// Reads and flips the public maintenance state.
//
// GET  /api/maintenance  -> { enabled, message, updatedAt }
// POST /api/maintenance  -> same, after saving { enabled } (needs the admin passcode)
//
// The state lives in site/maintenance.json on the repository, so the switch works
// from any device and every visitor sees it without a manual redeploy.
//
// Environment variables:
//   GITHUB_TOKEN    fine-grained token with Contents: read and write on this repo
//   ADMIN_PASSCODE  the passcode the console asks for

const REPO = "snimmagadda2-alt/jitter";
const BRANCH = "main";
const FILE_PATH = "site/maintenance.json";
const CONTENTS_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "jitterdededev-status",
  };
}

// Keeps GitHub's own explanation in the message: it names the missing permission
// ("Resource not accessible by personal access token") instead of just a status.
async function githubError(response, action) {
  let detail = "";
  try {
    const body = await response.json();
    if (typeof body.message === "string") detail = body.message;
    if (!detail && Array.isArray(body.errors)) {
      detail = body.errors.map((entry) => entry.message || entry.code).filter(Boolean).join("; ");
    }
  } catch (error) {
    // GitHub sometimes answers with an HTML page; the status alone will have to do.
  }
  return new Error(`Could not ${action} the state file (GitHub ${response.status}${detail ? `: ${detail}` : ""}).`);
}

async function readState() {
  const response = await fetch(`${CONTENTS_URL}?ref=${BRANCH}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw await githubError(response, "read");
  const body = await response.json();
  return {
    sha: body.sha,
    state: JSON.parse(Buffer.from(body.content, "base64").toString("utf8")),
  };
}

async function writeState(state, sha) {
  const response = await fetch(CONTENTS_URL, {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      branch: BRANCH,
      sha,
      message: `Turn maintenance overlay ${state.enabled ? "on" : "off"}`,
      content: Buffer.from(`${JSON.stringify(state, null, 2)}\n`).toString("base64"),
    }),
  });
  if (!response.ok) throw await githubError(response, "save");
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: "The hosting project is missing the GITHUB_TOKEN variable." });
  }

  try {
    if (req.method === "GET") {
      const { state } = await readState();
      return res.status(200).json(state);
    }

    if (req.method === "POST") {
      if (!process.env.ADMIN_PASSCODE) {
        return res.status(500).json({ error: "The hosting project is missing the ADMIN_PASSCODE variable." });
      }

      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const passcode = req.headers["x-admin-passcode"] || body.passcode;
      if (passcode !== process.env.ADMIN_PASSCODE) {
        return res.status(401).json({ error: "Wrong passcode." });
      }

      const { sha, state } = await readState();
      const next = { ...state, enabled: Boolean(body.enabled), updatedAt: new Date().toISOString() };
      await writeState(next, sha);
      return res.status(200).json(next);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
};
