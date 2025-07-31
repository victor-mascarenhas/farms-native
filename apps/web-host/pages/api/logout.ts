import type { NextApiRequest, NextApiResponse } from 'next';
import nookies from 'nookies';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  nookies.destroy({ res }, 'token', { path: '/' });
  res.status(200).json({ ok: true });
}