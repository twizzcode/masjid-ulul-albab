import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

const required = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} belum diisi`)
  return value
}

let client: S3Client | undefined

function getR2() {
  return (client ??= new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  }))
}

const bucket = () => required("R2_BUCKET_NAME")

const objectKey = (key: string) => key.replace(/^\/+/, "")

export function r2PublicUrl(key: string) {
  const base = required("R2_PUBLIC_URL").replace(/\/+$/, "")
  return `${base}/${objectKey(key)}`
}

export async function putR2Object(key: string, body: Uint8Array) {
  await getR2().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: objectKey(key),
      Body: body,
      ContentType: "application/pdf",
    })
  )
}

export async function getR2Object(key: string) {
  const response = await getR2().send(
    new GetObjectCommand({ Bucket: bucket(), Key: objectKey(key) })
  )
  if (!response.Body) throw new Error("Object R2 tidak memiliki isi")
  return new Uint8Array(await response.Body.transformToByteArray())
}

export async function deleteR2Object(key: string) {
  await getR2().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: objectKey(key) })
  )
}
