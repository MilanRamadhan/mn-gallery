"use client";

import { Upload, type PreviousUpload } from "tus-js-client";
import { createClientId } from "@/lib/client-id";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";
import { getSupabaseEnv } from "@/lib/supabase/env";

const TUS_CHUNK_SIZE = 6 * 1024 * 1024;
const RETRY_DELAYS = [0, 1_000, 3_000, 5_000, 10_000, 20_000];

export type ResumableUploadProgress = {
  bytesTotal: number;
  bytesUploaded: number;
  percentage: number;
};

function getResumableEndpoint(supabaseUrl: string) {
  const url = new URL(supabaseUrl);
  if (url.hostname.endsWith(".supabase.co")) {
    const projectReference = url.hostname.split(".")[0];
    return `${url.protocol}//${projectReference}.storage.supabase.co/storage/v1/upload/resumable`;
  }
  return `${url.origin}/storage/v1/upload/resumable`;
}

function getSafeFileName(file: File) {
  return file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-") || "photo";
}

function newestMatchingUpload(previousUploads: PreviousUpload[], folder: string) {
  return previousUploads
    .filter((item) => item.metadata.bucketName === SUPABASE_MEDIA_BUCKET)
    .filter((item) => item.metadata.objectName?.startsWith(`${folder}/`))
    .sort((first, second) => second.creationTime.localeCompare(first.creationTime))[0];
}

export async function uploadMediaResumable({
  file,
  folder,
  onProgress,
}: {
  file: File;
  folder: string;
  onProgress?: (progress: ResumableUploadProgress) => void;
}) {
  const env = getSupabaseEnv();
  const supabase = createClient();
  if (!env || !supabase) throw new Error("Supabase is not configured.");

  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !data.session?.access_token) {
    throw new Error("Your admin session has ended. Sign in again before uploading.");
  }

  let storagePath = `${folder}/${createClientId()}-${getSafeFileName(file)}`;

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: getResumableEndpoint(env.url),
      retryDelays: RETRY_DELAYS,
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: TUS_CHUNK_SIZE,
      metadata: {
        bucketName: SUPABASE_MEDIA_BUCKET,
        objectName: storagePath,
        contentType: file.type || "application/octet-stream",
        cacheControl: "31536000",
      },
      onError: (error) => {
        console.error("[milanora:upload] resumable upload failed", {
          fileName: file.name,
          fileSize: file.size,
          folder,
          message: error.message,
          storagePath,
        });
        reject(new Error(`The photo could not be uploaded after several retries. ${error.message}`));
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress?.({
          bytesTotal,
          bytesUploaded,
          percentage: bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0,
        });
      },
      onSuccess: () => resolve(),
    });

    void upload.findPreviousUploads().then((previousUploads) => {
      const previousUpload = newestMatchingUpload(previousUploads, folder);
      if (previousUpload) {
        storagePath = previousUpload.metadata.objectName;
        upload.resumeFromPreviousUpload(previousUpload);
      }
      upload.start();
    }).catch(reject);
  });

  const { data: publicUrl } = supabase.storage
    .from(SUPABASE_MEDIA_BUCKET)
    .getPublicUrl(storagePath);
  return { imageUrl: publicUrl.publicUrl, storagePath };
}
