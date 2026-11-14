import { request } from './client';

export async function getProjectDocuments(projectId) {
  const data = await request(`/projects/${projectId}/documents/`);
  return Array.isArray(data) ? data : data.documents || [];
}

export async function createProjectDocument(projectId, title, content = '') {
  return request(`/projects/${projectId}/documents/`, {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
}

export async function getDocument(documentId) {
  const data = await request(`/projects/documents/${documentId}/`);
  return data.document || data;
}

export async function updateDocument(documentId, updates) {
  return request(`/projects/documents/${documentId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteDocument(documentId) {
  return request(`/projects/documents/${documentId}/`, {
    method: 'DELETE',
  });
}

export async function getDocumentCollabToken(documentId) {
  return request(`/projects/documents/${documentId}/token/`);
}
