export function generateBlurDataURL(width = 10, height = 10): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  // إنشاء تدرج بسيط للـ placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, "#f3f4f6")
  gradient.addColorStop(1, "#e5e7eb")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL()
}

export function getOptimalImageSize(containerWidth: number, devicePixelRatio = 1): number {
  const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  const targetWidth = containerWidth * devicePixelRatio

  return sizes.find((size) => size >= targetWidth) || sizes[sizes.length - 1]
}

export function generateSrcSet(src: string, sizes: number[]): string {
  return sizes.map((size) => `${src}?w=${size}&q=75 ${size}w`).join(", ")
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function compressImage(file: File, quality = 0.8, maxWidth = 1920, maxHeight = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // رسم الصورة المضغوطة
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("فشل في ضغط الصورة"))
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
