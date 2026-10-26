package xyz.getpapillon.wear.ui.components

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.MultiFormatWriter

object BarcodeBitmap {
    fun generate(content: String, codeType: String, sizePx: Int = 320): Bitmap? {
        if (content.isBlank()) return null
        return runCatching {
            val isCode39 = codeType.equals("CODE39", ignoreCase = true)
            val format = if (isCode39) BarcodeFormat.CODE_39 else BarcodeFormat.QR_CODE
            val width = sizePx
            val height = if (isCode39) sizePx / 2 else sizePx
            val hints = mapOf(
                EncodeHintType.MARGIN to 1,
                EncodeHintType.CHARACTER_SET to "UTF-8"
            )
            val matrix = MultiFormatWriter().encode(content, format, width, height, hints)
            val pixels = IntArray(width * height)
            for (y in 0 until height) {
                val offset = y * width
                for (x in 0 until width) {
                    pixels[offset + x] = if (matrix.get(x, y)) Color.BLACK else Color.WHITE
                }
            }
            Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888).apply {
                setPixels(pixels, 0, width, 0, 0, width, height)
            }
        }.getOrNull()
    }
}
