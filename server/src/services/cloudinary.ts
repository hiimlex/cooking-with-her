import { createHash } from 'crypto';

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME  ?? '';
const API_KEY     = process.env.CLOUDINARY_API_KEY     ?? '';
const API_SECRET  = process.env.CLOUDINARY_API_SECRET  ?? '';
const UPLOAD_URL  = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const FOLDER      = 'cooking-with-her/memories';

function sign(params: Record<string, string | number>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha256').update(sorted + API_SECRET).digest('hex');
}

export interface CloudinaryUploadResult {
  url:       string;
  publicId:  string;
  width:     number;
  height:    number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  mimeType:   string,
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params    = { folder: FOLDER, timestamp };
  const signature = sign(params);

  const body = new FormData();
  body.append('file',      new Blob([fileBuffer.buffer as ArrayBuffer], { type: mimeType }), 'photo.jpg');
  body.append('api_key',   API_KEY);
  body.append('timestamp', String(timestamp));
  body.append('folder',    FOLDER);
  body.append('signature', signature);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${text}`);
  }

  const json = await res.json() as {
    secure_url: string;
    public_id:  string;
    width:      number;
    height:     number;
  };

  return {
    url:      json.secure_url,
    publicId: json.public_id,
    width:    json.width,
    height:   json.height,
  };
}
