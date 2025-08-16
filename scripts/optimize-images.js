const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const inputDir = path.join(process.cwd(), "public", "images")
const outputDir = path.join(process.cwd(), "public", "optimized")

const optimizeImages = async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const files = fs.readdirSync(inputDir)

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(inputDir, file)
      const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, ".webp"))

      await sharp(inputPath).webp({ quality: 80 }).resize(1920, null, { withoutEnlargement: true }).toFile(outputPath)

      console.log(`✅ Optimized: ${file} -> ${path.basename(outputPath)}`)
    }
  }

  console.log("🎉 All images optimized!")
}

optimizeImages().catch(console.error)
