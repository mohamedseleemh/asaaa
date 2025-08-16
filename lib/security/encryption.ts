import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// الحصول على مفتاح التشفير من متغيرات البيئة
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required")
  }

  // إنشاء مفتاح ثابت الطول من النص المعطى
  return crypto.scryptSync(key, "salt", KEY_LENGTH)
}

// تشفير النص
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, key)
    cipher.setAAD(Buffer.from("kyctrust-auth"))

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    // دمج IV والعلامة مع النص المشفر
    return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

// فك التشفير
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey()
    const parts = encryptedData.split(":")

    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format")
    }

    const iv = Buffer.from(parts[0], "hex")
    const tag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const decipher = crypto.createDecipher(ALGORITHM, key)
    decipher.setAAD(Buffer.from("kyctrust-auth"))
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

// تشفير البيانات الحساسة
export function encryptSensitiveData(data: any): string {
  const jsonString = JSON.stringify(data)
  return encrypt(jsonString)
}

// فك تشفير البيانات الحساسة
export function decryptSensitiveData<T = any>(encryptedData: string): T {
  const decryptedString = decrypt(encryptedData)
  return JSON.parse(decryptedString)
}

// إنشاء hash آمن للبيانات
export function createSecureHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

// التحقق من hash
export function verifyHash(data: string, hash: string): boolean {
  const computedHash = createSecureHash(data)
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))
}
