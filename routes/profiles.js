import { buildProfileState } from '../shared/profile-domain.mjs';
import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { USERNAME_RE } from './profile.js';

const createProfile = async (
  req,
  res,
  _params,
  { profileDir, sendJson, parseJsonBody },
) => {
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Invalid JSON');
      return;
    }
    throw error;
  }

  const requestedId = typeof body.id === 'string' ? body.id.trim() : '';
  if (!USERNAME_RE.test(requestedId)) {
    sendJson(res, 422, { ok: false, errors: { id: 'Invalid username' } });
    return;
  }

  const filePath = path.join(profileDir, `${requestedId}.json`);
  try {
    await stat(filePath);
    sendJson(res, 409, { ok: false, error: 'Profile already exists' });
    return;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const merged = { ...body, id: requestedId };
  const state = buildProfileState(merged);

  if (!state.valid) {
    sendJson(res, 422, {
      ok: false,
      profile: state.profile,
      computed: state.computed,
      errors: state.errors,
      valid: false,
    });
    return;
  }

  await writeFile(filePath, JSON.stringify(state.profile, null, 2), 'utf8');
  sendJson(res, 200, {
    ok: true,
    profile: state.profile,
    computed: state.computed,
    errors: state.errors,
    valid: true,
  });
};

export default { POST: createProfile };
