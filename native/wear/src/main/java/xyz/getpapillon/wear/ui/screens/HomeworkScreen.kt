package xyz.getpapillon.wear.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Checkbox
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.SplitToggleChip
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.ToggleChipDefaults
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.VignettePosition
import xyz.getpapillon.wear.model.WearHomeworkItem
import xyz.getpapillon.wear.ui.theme.parseHexColor
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HomeworkScreen(
    homeworks: List<WearHomeworkItem>,
    accentHex: String,
    onToggleHomework: (String, Boolean) -> Unit
) {
    val listState = rememberScalingLazyListState()
    val accentColor = parseHexColor(accentHex)
    val dateFormat = SimpleDateFormat("EEE d MMM", Locale.getDefault())

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
                    text = "📚 Devoirs",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor,
                    modifier = Modifier.padding(top = 18.dp, bottom = 4.dp)
                )
            }

            if (homeworks.isEmpty()) {
                item {
                    Text(
                        text = "Aucun devoir à venir",
                        fontSize = 12.sp,
                        color = MaterialTheme.colors.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            } else {
                items(homeworks, key = { it.id }) { hw ->
                    val subjectColor = parseHexColor(hw.color, accentColor)
                    val dueText = dateFormat.format(Date(hw.dueDate))

                    SplitToggleChip(
                        checked = hw.isDone,
                        onCheckedChange = { checked ->
                            onToggleHomework(hw.id, checked)
                        },
                        onClick = {
                            onToggleHomework(hw.id, !hw.isDone)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = {
                            Column {
                                Text(
                                    text = "${hw.emoji} ${hw.subject}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = subjectColor,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = hw.content.ifBlank { "Travail à faire" },
                                    fontSize = 12.sp,
                                    color = if (hw.isDone) MaterialTheme.colors.onSurfaceVariant else Color.White,
                                    textDecoration = if (hw.isDone) TextDecoration.LineThrough else TextDecoration.None,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        },
                        secondaryLabel = {
                            val evalBadge = if (hw.isEvaluation) " • Éval." else ""
                            Text(
                                text = "Pour $dueText$evalBadge",
                                fontSize = 10.sp,
                                color = if (hw.isEvaluation) Color(0xFFFFD54F) else MaterialTheme.colors.onSurfaceVariant,
                                maxLines = 1
                            )
                        },
                        toggleControl = {
                            Checkbox(checked = hw.isDone)
                        },
                        colors = ToggleChipDefaults.splitToggleChipColors()
                    )
                }
            }
        }
    }
}
