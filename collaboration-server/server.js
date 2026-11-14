require("dotenv").config();

const { Server } = require("@hocuspocus/server");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "syncspace",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Naitik123",
});

const server = new Server({
  port: Number(process.env.PORT || 1234),

  async onAuthenticate({ token, documentName }) {
    if (!token) {
      throw new Error("Authentication required");
    }

    const match = /^convergedesk-document-(\d+)$/.exec(documentName);

    if (!match) {
      throw new Error("Invalid document room");
    }

    const documentId = match[1];

    const apiUrl = process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api";
    const response = await fetch(
      `${apiUrl}/collaboration/documents/${documentId}/authorize/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(
        "[onAuthenticate] Django rejected request:",
        response.status,
        body
      );
      throw new Error("Document access denied");
    }

    const data = await response.json().catch(() => ({}));

    return {
      documentId,
      user: {
        id: data.user_id,
        name: data.username,
      },
    };
  },

  async onLoadDocument({ documentName, document }) {
    const match = /^convergedesk-document-(\d+)$/.exec(documentName);
    if (!match) throw new Error("Invalid document room");

    const docId = match[1];

    const result = await pool.query(
      `SELECT state FROM projects_collaborationstate WHERE document_id = $1`,
      [docId]
    );

    if (result.rows.length > 0 && result.rows[0].state) {
      const Y = require("yjs");
      Y.applyUpdate(document, new Uint8Array(result.rows[0].state));
    } else {
      const docResult = await pool.query(
        `SELECT content FROM projects_projectdocuments WHERE id = $1`,
        [docId]
      );
      if (docResult.rows.length > 0 && docResult.rows[0].content) {
        const ytext = document.getText("quill");
        if (ytext.length === 0) {
          ytext.insert(0, docResult.rows[0].content);
        }
      }
    }
  },

  async onStoreDocument({ documentName, document }) {
    const match = /^convergedesk-document-(\d+)$/.exec(documentName);
    if (!match) throw new Error("Invalid document room");

    const Y = require("yjs");
    const state = Buffer.from(Y.encodeStateAsUpdate(document));

    await pool.query(
      `INSERT INTO projects_collaborationstate (document_id, state, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (document_id)
       DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`,
      [match[1], state]
    );
  },
});

server.listen().then(() => {
  console.log(`ConvergeDesk collaboration server listening on port ${process.env.PORT || 1234}`);
});

process.on("SIGINT", async () => {
  await server.destroy();
  await pool.end();
  process.exit(0);
});
