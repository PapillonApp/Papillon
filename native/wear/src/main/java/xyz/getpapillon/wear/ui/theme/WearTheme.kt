package xyz.getpapillon.wear.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

val PapillonGreen = Color(0xFF26B290)
val PapillonDarkSurface = Color(0xFF14181B)
val PapillonCardSurface = Color(0xFF1C2226)

fun parseHexColor(hex: String?, fallback: Color = PapillonGreen): Color {
    if (hex.isNullOrBlank()) return fallback
    return runCatching {
        Color(android.graphics.Color.parseColor(hex))
    }.getOrDefault(fallback)
}

@Composable
fun PapillonWearTheme(
    accentHex: String? = null,
    content: @Composable () -> Unit
) {
    val accent = parseHexColor(accentHex, PapillonGreen)
    val wearColors = Colors(
        primary = accent,
        primaryVariant = accent.copy(alpha = 0.8f),
        secondary = accent,
        secondaryVariant = accent.copy(alpha = 0.7f),
        background = Color.Black,
        surface = PapillonCardSurface,
        error = Color(0xFFFF5252),
        onPrimary = Color.Black,
        onSecondary = Color.Black,
        onBackground = Color.White,
        onSurface = Color.White,
        onSurfaceVariant = Color(0xFFB0BEC5),
        onError = Color.Black
    )

    MaterialTheme(
        colors = wearColors,
        content = content
    )
}
