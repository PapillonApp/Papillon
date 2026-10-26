package xyz.getpapillon.wear.ui.screens

import android.app.Activity
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.VignettePosition
import xyz.getpapillon.wear.model.WearCanteenCard
import xyz.getpapillon.wear.ui.components.BarcodeBitmap
import xyz.getpapillon.wear.ui.theme.parseHexColor

@Composable
fun CanteenCardScreen(
    cards: List<WearCanteenCard>,
    accentHex: String
) {
    val listState = rememberScalingLazyListState()
    val accentColor = parseHexColor(accentHex)
    var activeCardForQr by remember { mutableStateOf<WearCanteenCard?>(null) }

    val selected = activeCardForQr
    if (selected != null && !selected.qrData.isNullOrBlank()) {
        FullBrightnessQrOverlay(
            card = selected,
            onDismiss = { activeCardForQr = null }
        )
        return
    }

    Scaffold(
        timeText = { TimeText() },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            state = listState,
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            item {
                Text(
                    text = "🍽️ Carte de self",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor,
                    modifier = Modifier.padding(top = 18.dp, bottom = 4.dp)
                )
            }

            if (cards.isEmpty()) {
                item {
                    Text(
                        text = "Aucune carte configurée sur le téléphone",
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colors.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            } else {
                items(cards, key = { it.id }) { card ->
                    val cardAccent = parseHexColor(card.accentColor, accentColor)
                    Card(
                        onClick = {
                            if (!card.qrData.isNullOrBlank()) {
                                activeCardForQr = card
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            Text(
                                text = card.serviceName,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = cardAccent
                            )
                            Text(
                                text = card.label,
                                fontSize = 11.sp,
                                color = MaterialTheme.colors.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = card.amountFormatted,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            if (card.lunchRemaining != null) {
                                Text(
                                    text = "${card.lunchRemaining} repas restants",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colors.onSurfaceVariant
                                )
                            }
                            if (!card.qrData.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Appuyer pour afficher le ${card.codeType}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = accentColor
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FullBrightnessQrOverlay(
    card: WearCanteenCard,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val bitmap = remember(card.qrData, card.codeType) {
        BarcodeBitmap.generate(card.qrData ?: "", card.codeType, 320)
    }

    DisposableEffect(Unit) {
        val window = (context as? Activity)?.window
        val previousBrightness = window?.attributes?.screenBrightness ?: -1f
        window?.attributes = window?.attributes?.apply {
            screenBrightness = 1.0f
        }
        onDispose {
            window?.attributes = window?.attributes?.apply {
                screenBrightness = previousBrightness
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .clickable { onDismiss() },
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(12.dp)
        ) {
            Text(
                text = card.serviceName,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(4.dp))
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = "Code ${card.serviceName}",
                    modifier = Modifier
                        .size(132.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
            } else {
                Text(
                    text = card.qrData ?: "",
                    fontSize = 12.sp,
                    color = Color.Black,
                    textAlign = TextAlign.Center
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = card.amountFormatted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color.DarkGray
            )
        }
    }
}
